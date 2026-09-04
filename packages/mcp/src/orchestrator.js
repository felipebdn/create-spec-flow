import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir, rename, stat, unlink } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { executionReport, parseAgentJson, reviewReport } from './documents.js';
import { git, runProcess } from './process.js';

// The fallback keeps repository tests runnable before 0.5.0 exists in npm. The published companion
// resolves the declared dependency and therefore consumes the exact public workflow contract.
let workflow;
try { workflow = await import('create-spec-flow/workflow'); }
catch { workflow = await import('../../../src/workflow.js'); }
const { assertTransition, parseFrontmatter, setFrontmatterFields } = workflow;

const COMMIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME || 'Spec Flow',
  GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL || 'spec-flow@local',
  GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME || 'Spec Flow',
  GIT_COMMITTER_EMAIL: process.env.GIT_COMMITTER_EMAIL || 'spec-flow@local',
};

async function exists(path) { try { await stat(path); return true; } catch (e) { if (e.code === 'ENOENT') return false; throw e; } }
const safeId = (id) => {
  if (!/^[0-9]{3}[a-z]?-[a-z0-9][a-z0-9-]*$/.test(id)) throw new Error(`Invalid change id: ${id}`);
  return id;
};

export class SpecFlowOrchestrator {
  constructor({ project }) {
    this.project = resolve(project);
    this.runs = new Map();
    this.active = null;
    this.controllers = new Map();
  }

  get runtimeRoot() { return join(this.project, '.git/spec-flow'); }

  async config() {
    const path = join(this.project, '.specs/orchestrator.json');
    return JSON.parse(await readFile(path, 'utf8'));
  }

  async ensureClean() {
    const { stdout } = await git(this.project, ['status', '--porcelain']);
    if (stdout.trim()) throw new Error('The project checkout must be clean before an MCP transition.');
  }

  async changes() {
    const root = join(this.project, '.specs/changes');
    const entries = await readdir(root, { withFileTypes: true });
    const out = [];
    for (const entry of entries.filter((e) => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
      const specPath = join(root, entry.name, 'spec.md');
      if (!(await exists(specPath))) continue;
      const { attributes } = parseFrontmatter(await readFile(specPath, 'utf8'));
      let dependencies = [];
      const rawDependencies = (attributes.depends_on ?? attributes.depende_de ?? '[]').split(' #')[0];
      let dependenciesValid = true;
      try { dependencies = JSON.parse(rawDependencies.replaceAll("'", '"')); }
      catch { dependenciesValid = false; }
      out.push({ id: entry.name, status: attributes.status, attempt: Number(attributes.attempt ?? 0), dependencies, dependenciesValid });
    }
    return out;
  }

  async status(runId) {
    if (runId) {
      const memory = this.runs.get(runId);
      if (memory) return memory;
      const path = join(this.runtimeRoot, 'runs', `${runId}.json`);
      if (await exists(path)) return JSON.parse(await readFile(path, 'utf8'));
      throw new Error(`Unknown run: ${runId}`);
    }
    return { active: this.active, changes: await this.changes() };
  }

  async persist(run) {
    this.runs.set(run.id, run);
    await mkdir(join(this.runtimeRoot, 'runs'), { recursive: true });
    const path = join(this.runtimeRoot, 'runs', `${run.id}.json`);
    const temporary = `${path}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(run, null, 2)}\n`);
    await rename(temporary, path);
  }

  async acquireLock(runId) {
    await mkdir(this.runtimeRoot, { recursive: true });
    const path = join(this.runtimeRoot, 'lock.json');
    try {
      await writeFile(path, `${JSON.stringify({ runId, pid: process.pid, createdAt: new Date().toISOString() })}\n`, { flag: 'wx' });
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
      const lock = JSON.parse(await readFile(path, 'utf8'));
      let alive = true;
      try { process.kill(lock.pid, 0); } catch { alive = false; }
      if (alive) throw new Error(`Project is locked by run ${lock.runId} (pid ${lock.pid}).`);
      if (await exists(join(this.runtimeRoot, 'runs', `${lock.runId}.json`))) {
        const stale = JSON.parse(await readFile(join(this.runtimeRoot, 'runs', `${lock.runId}.json`), 'utf8'));
        stale.status = 'blocked'; stale.phase = 'recovery-required'; stale.error = 'orchestrator-process-ended';
        await this.persist(stale);
      }
      await unlink(path);
      return this.acquireLock(runId);
    }
  }

  async releaseLock(runId) {
    const path = join(this.runtimeRoot, 'lock.json');
    if (!(await exists(path))) return;
    const lock = JSON.parse(await readFile(path, 'utf8'));
    if (lock.runId === runId) await unlink(path);
  }

  async dispatch(role, prompt, cwd, signal) {
    const config = await this.config();
    const adapterName = config.roles[role];
    const adapter = config.adapters[adapterName];
    if (!adapter?.command || !Array.isArray(adapter.args)) throw new Error(`Invalid adapter for role ${role}`);
    const timeoutMs = (config.limits?.timeoutMinutes ?? 30) * 60_000;
    const maxOutputBytes = config.limits?.maxOutputBytes ?? 1024 * 1024;
    const result = await runProcess(adapter.command, adapter.args, { cwd, input: prompt, timeoutMs, maxOutputBytes, signal });
    return { adapter: adapterName, output: parseAgentJson(result.stdout), stderr: result.stderr };
  }

  async prepareChange({ request, answers = [] }) {
    const before = (await git(this.project, ['status', '--porcelain'])).stdout;
    const prompt = `You are the planner for a spec-driven project. Read project instructions and .specs context. Do not write any project file.\nRequest: ${request}\nAnswers: ${JSON.stringify(answers)}\nReturn one JSON object. If blocked, use {"ready":false,"questions":[...]}. If ready, use {"ready":true,"id":"NNN-slug","summary":"...","documents":{"spec":"complete markdown","plan":"complete markdown","tasks":"complete markdown"}}.`;
    const dispatched = await this.dispatch('planner', prompt, this.project);
    const after = (await git(this.project, ['status', '--porcelain'])).stdout;
    if (after !== before) throw new Error('Planner changed project files; proposal was rejected.');
    const proposal = { proposalId: randomUUID(), createdAt: new Date().toISOString(), adapter: dispatched.adapter, ...dispatched.output };
    if (proposal.ready) {
      safeId(proposal.id);
      await mkdir(join(this.runtimeRoot, 'proposals'), { recursive: true });
      await writeFile(join(this.runtimeRoot, 'proposals', `${proposal.proposalId}.json`), `${JSON.stringify(proposal, null, 2)}\n`);
    }
    return proposal;
  }

  async approveSpec({ proposalId, confirmed }) {
    if (confirmed !== true) throw new Error('Explicit confirmation is required.');
    if (await exists(join(this.runtimeRoot, 'lock.json'))) throw new Error('Another change owns the project lock.');
    await this.ensureClean();
    const proposal = JSON.parse(await readFile(join(this.runtimeRoot, 'proposals', `${proposalId}.json`), 'utf8'));
    const payload = proposal;
    if (!payload.ready || !payload.documents) throw new Error('Proposal is not ready.');
    const change = safeId(payload.id);
    const root = join(this.project, '.specs/changes', change);
    if (await exists(root)) throw new Error(`Change already exists: ${change}`);
    await mkdir(root, { recursive: true });
    for (const name of ['spec', 'plan', 'tasks']) {
      if (typeof payload.documents[name] !== 'string') throw new Error(`Proposal is missing ${name}.md`);
      await writeFile(join(root, `${name}.md`), payload.documents[name]);
    }
    let spec = await readFile(join(root, 'spec.md'), 'utf8');
    spec = setFrontmatterFields(spec, { workflow_version: 2, status: 'ready', attempt: 0 });
    await writeFile(join(root, 'spec.md'), spec);
    await this.commit(this.project, `spec-flow(spec): approve ${change}`);
    return { change, status: 'ready', commit: await this.head(this.project) };
  }

  async head(cwd) { return (await git(cwd, ['rev-parse', 'HEAD'])).stdout.trim(); }

  async commit(cwd, message) {
    await git(cwd, ['add', '-A']);
    const { stdout } = await git(cwd, ['status', '--porcelain']);
    if (!stdout.trim()) return this.head(cwd);
    await git(cwd, ['commit', '-m', message], { env: COMMIT_ENV });
    return this.head(cwd);
  }

  async transition(cwd, change, to, extra = {}) {
    const path = join(cwd, '.specs/changes', change, 'spec.md');
    const text = await readFile(path, 'utf8');
    const { attributes } = parseFrontmatter(text);
    assertTransition(attributes.status, to);
    await writeFile(path, setFrontmatterFields(text, { status: to, ...extra }));
  }

  async createWorktree(change, runId) {
    const path = join(dirname(this.project), '.spec-flow-worktrees', basename(this.project), runId);
    const branch = `spec-flow/${change}/${runId}`;
    await mkdir(dirname(path), { recursive: true });
    await git(this.project, ['worktree', 'add', '-b', branch, path, 'HEAD']);
    return { path, branch };
  }

  async start({ change, queue = false }) {
    if (this.active) throw new Error(`Run already active: ${this.active}`);
    await this.ensureClean();
    const available = await this.changes();
    const archived = new Set((await readdir(join(this.project, '.specs/archive'), { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name));
    const satisfied = (item) => item.dependenciesValid && item.dependencies.every((dependency) => archived.has(dependency) || ['verified', 'archive-approved', 'archived'].includes(available.find(({ id }) => id === dependency)?.status));
    const selected = change ? available.find((item) => item.id === change) : available.find((item) => ['ready', 'changes-requested'].includes(item.status) && satisfied(item));
    if (!selected) throw new Error('No executable change found.');
    if (!selected.dependenciesValid) throw new Error(`Change ${selected.id} has invalid dependencies frontmatter.`);
    if (!satisfied(selected)) throw new Error(`Change ${selected.id} has unmet dependencies.`);
    if (!['ready', 'changes-requested'].includes(selected.status)) throw new Error(`Change ${selected.id} is ${selected.status}.`);
    const id = randomUUID();
    await this.acquireLock(id);
    let worktree;
    try { worktree = await this.createWorktree(selected.id, id); }
    catch (error) { await this.releaseLock(id); throw error; }
    const run = { id, change: selected.id, queue, phase: 'starting', status: 'running', worktree: worktree.path, branch: worktree.branch, baseCommit: await this.head(this.project), attempt: selected.attempt, createdAt: new Date().toISOString() };
    this.controllers.set(id, new AbortController());
    this.active = id;
    await this.persist(run);
    void this.execute(run).catch(async (error) => {
      if (run.status === 'cancelling') {
        try {
          const spec = parseFrontmatter(await readFile(join(run.worktree, '.specs/changes', run.change, 'spec.md'), 'utf8'));
          if (spec.attributes.status !== 'blocked') await this.transition(run.worktree, run.change, 'blocked', { resume_from: spec.attributes.status, blocked_reason: 'cancelled' });
          await this.commit(run.worktree, `spec-flow(state): cancel ${run.change}`);
        } catch { /* The persisted run still records cancellation if recovery itself fails. */ }
        run.status = 'cancelled'; run.phase = 'cancelled'; run.finishedAt = new Date().toISOString();
        this.active = null; this.controllers.delete(run.id); await this.persist(run); await this.releaseLock(run.id); return;
      }
      run.status = 'blocked'; run.phase = 'blocked'; run.error = error.message; run.finishedAt = new Date().toISOString();
      try {
        const spec = parseFrontmatter(await readFile(join(run.worktree, '.specs/changes', run.change, 'spec.md'), 'utf8'));
        if (spec.attributes.status !== 'blocked') await this.transition(run.worktree, run.change, 'blocked', { resume_from: spec.attributes.status, blocked_reason: JSON.stringify(error.message) });
        await this.commit(run.worktree, `spec-flow(state): block ${run.change}`);
      } catch { /* Preserve the original failure. */ }
      this.active = null; await this.persist(run);
      this.controllers.delete(run.id);
      await this.releaseLock(run.id);
    });
    return run;
  }

  async execute(run) {
    const config = await this.config();
    const maxAttempts = config.limits?.maxRemediationAttempts ?? 3;
    while (run.attempt < maxAttempts + 1) {
      run.attempt += 1; run.phase = run.attempt === 1 ? 'executing' : 'remediating'; await this.persist(run);
      const executionStartedAt = new Date().toISOString();
      await this.transition(run.worktree, run.change, 'executing', { attempt: run.attempt, resume_from: null, blocked_reason: null });
      await this.commit(run.worktree, `spec-flow(state): execute ${run.change} attempt ${run.attempt}`);
      const role = run.attempt === 1 ? 'executor' : 'remediator';
      const prompt = `You are a fresh ${role}. Work only in ${run.worktree}. Read project instructions and .specs/changes/${run.change}/{spec.md,plan.md,tasks.md}. ${role === 'remediator' ? 'Also read review.md and fix every finding without expanding scope.' : 'Implement the approved change.'} Run all validation and sabotage required by the flow. Do not commit and do not write execution-report.md. Return one JSON object: {"summary":"...","checks":[{"command":"...","result":"passed|failed","evidence":"..."}],"outcome":"completed|blocked"}.`;
      const headBeforeExecution = await this.head(run.worktree);
      const execution = await this.dispatch(role, prompt, run.worktree, this.controllers.get(run.id)?.signal);
      if (await this.head(run.worktree) !== headBeforeExecution) throw new Error(`${role} created a commit; only the orchestrator may commit.`);
      const implementationCommit = await this.commit(run.worktree, `spec-flow(exec): ${run.change} attempt ${run.attempt}`);
      const outcome = execution.output.outcome ?? 'completed';
      const changeRoot = join(run.worktree, '.specs/changes', run.change);
      const report = executionReport({ change: run.change, runId: run.id, attempt: run.attempt, agent: execution.adapter, baseCommit: run.baseCommit, resultCommit: implementationCommit, startedAt: executionStartedAt, outcome, summary: execution.output.summary, checks: execution.output.checks, details: execution.stderr });
      await mkdir(join(changeRoot, 'runs', String(run.attempt).padStart(3, '0')), { recursive: true });
      await writeFile(join(changeRoot, 'execution-report.md'), report);
      await writeFile(join(changeRoot, 'runs', String(run.attempt).padStart(3, '0'), 'execution-report.md'), report);
      if (outcome !== 'completed') throw new Error(execution.output.summary || 'Executor reported a blocker.');
      await this.transition(run.worktree, run.change, 'awaiting-review');
      await this.commit(run.worktree, `spec-flow(report): execution ${run.change} attempt ${run.attempt}`);

      run.phase = 'reviewing'; await this.persist(run);
      const reviewStartedAt = new Date().toISOString();
      await this.transition(run.worktree, run.change, 'reviewing');
      await this.commit(run.worktree, `spec-flow(state): review ${run.change} attempt ${run.attempt}`);
      const reviewPrompt = `You are a fresh read-only reviewer. Review commit ${implementationCommit} in ${run.worktree} against .specs/changes/${run.change}/spec.md, plan.md, tasks.md, and execution-report.md. Do not edit files or commit. Return exactly one JSON object: {"verdict":"approved|changes-requested|blocked","summary":"...","criteria":[{"id":"AC1","result":"met|not-met|not-verifiable","evidence":"..."}],"findings":[{"id":"F1","severity":"high|medium|low","location":"path:line","problem":"...","fix":"..."}]}.`;
      const reviewHead = await this.head(run.worktree);
      const reviewTree = (await git(run.worktree, ['status', '--porcelain'])).stdout;
      const review = await this.dispatch('reviewer', reviewPrompt, run.worktree, this.controllers.get(run.id)?.signal);
      if (await this.head(run.worktree) !== reviewHead || (await git(run.worktree, ['status', '--porcelain'])).stdout !== reviewTree) {
        throw new Error('Reviewer changed the worktree; review must be read-only.');
      }
      const verdict = review.output.verdict ?? 'blocked';
      const reviewText = reviewReport({ change: run.change, runId: run.id, attempt: run.attempt, reviewer: review.adapter, commit: implementationCommit, startedAt: reviewStartedAt, verdict, summary: review.output.summary, findings: review.output.findings, criteria: review.output.criteria });
      await writeFile(join(changeRoot, 'review.md'), reviewText);
      await writeFile(join(changeRoot, 'runs', String(run.attempt).padStart(3, '0'), 'review.md'), reviewText);
      if (verdict === 'approved') {
        await this.transition(run.worktree, run.change, 'verified');
        run.status = 'awaiting-archive-approval'; run.phase = 'verified'; run.resultCommit = implementationCommit;
        await this.commit(run.worktree, `spec-flow(review): approve ${run.change}`);
        await this.persist(run); this.active = null; this.controllers.delete(run.id); return;
      }
      if (verdict === 'blocked') throw new Error(review.output.summary || 'Reviewer reported a blocker.');
      await this.transition(run.worktree, run.change, 'changes-requested');
      await this.commit(run.worktree, `spec-flow(review): request changes ${run.change}`);
    }
    throw new Error(`Remediation limit reached (${maxAttempts}).`);
  }

  async approveArchive({ runId, confirmed }) {
    if (confirmed !== true) throw new Error('Explicit confirmation is required.');
    const run = await this.status(runId);
    if (run.status !== 'awaiting-archive-approval') throw new Error(`Run is ${run.status}.`);
    await this.ensureClean();
    const currentHead = await this.head(this.project);
    if (currentHead !== run.baseCommit) {
      run.status = 'blocked'; run.phase = 'integration-required'; run.error = 'base-branch-advanced';
      await this.persist(run); await this.releaseLock(run.id);
      throw new Error('Base branch advanced; preserve the worktree and integrate manually.');
    }
    try {
      await this.transition(run.worktree, run.change, 'archive-approved');
      await this.commit(run.worktree, `spec-flow(state): approve archive ${run.change}`);
      run.phase = 'archiving'; run.status = 'running'; await this.persist(run);
      const prompt = `You are a fresh archiver in ${run.worktree}. Read the approved review and the spec archive skill. Produce walkthrough.md, promote reusable decisions/contracts, set status archived, and move .specs/changes/${run.change} to .specs/archive/${run.change}. Do not commit. Return {"summary":"..."} as JSON.`;
      const archiveHead = await this.head(run.worktree);
      await this.dispatch('archiver', prompt, run.worktree);
      if (await this.head(run.worktree) !== archiveHead) throw new Error('Archiver created a commit; only the orchestrator may commit.');
      const archived = join(run.worktree, '.specs/archive', run.change, 'spec.md');
      if (!(await exists(archived))) throw new Error('Archiver did not move the verified change.');
      const parsed = parseFrontmatter(await readFile(archived, 'utf8'));
      if (parsed.attributes.status !== 'archived') await writeFile(archived, setFrontmatterFields(await readFile(archived, 'utf8'), { status: 'archived' }));
      await this.commit(run.worktree, `spec-flow(archive): ${run.change}`);
      await git(this.project, ['merge', '--ff-only', run.branch]);
      run.status = 'archived'; run.phase = 'complete'; run.finishedAt = new Date().toISOString(); run.finalCommit = await this.head(this.project);
      await this.persist(run);
      try { await git(this.project, ['worktree', 'remove', run.worktree]); }
      catch (error) { run.cleanupWarning = error.message; await this.persist(run); }
      await this.releaseLock(run.id);
      if (run.queue) {
        try { run.nextRun = (await this.start({ queue: true })).id; }
        catch (error) { if (error.message !== 'No executable change found.') run.queueError = error.message; }
        await this.persist(run);
      }
      return run;
    } catch (error) {
      run.status = 'blocked'; run.phase = 'archive-blocked'; run.error = error.message;
      await this.persist(run); await this.releaseLock(run.id);
      throw error;
    }
  }

  async cancel(runId) {
    const run = await this.status(runId);
    if (run.status !== 'running' || !this.controllers.has(runId)) throw new Error(`Run ${runId} has no active subprocess.`);
    run.status = 'cancelling'; run.phase = 'cancelling';
    await this.persist(run);
    this.controllers.get(runId)?.abort();
    return run;
  }
}
