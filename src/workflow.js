export const WORKFLOW_VERSION = 2;

export const STATUSES = Object.freeze([
  'ready',
  'executing',
  'awaiting-review',
  'reviewing',
  'changes-requested',
  'verified',
  'archive-approved',
  'archived',
  'blocked',
]);

export const TRANSITIONS = Object.freeze({
  ready: ['executing', 'blocked'],
  executing: ['awaiting-review', 'blocked'],
  'awaiting-review': ['reviewing', 'blocked'],
  reviewing: ['changes-requested', 'verified', 'blocked'],
  'changes-requested': ['executing', 'blocked'],
  verified: ['archive-approved', 'blocked'],
  'archive-approved': ['archived', 'blocked'],
  archived: [],
  blocked: STATUSES.filter((status) => status !== 'blocked' && status !== 'archived'),
});

export function canTransition(from, to) {
  return Boolean(TRANSITIONS[from]?.includes(to));
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const error = new Error(`Invalid spec-flow transition: ${from} -> ${to}`);
    error.code = 'INVALID_TRANSITION';
    throw error;
  }
}

export function migrateLegacyStatus(status, { archived = false, approvedReview = false } = {}) {
  if (archived) return { status: 'archived' };
  if (status === 'todo') return { status: 'ready' };
  if (status === 'in-progress') {
    return { status: 'blocked', resume_from: 'executing', blocked_reason: 'migration-requires-resume' };
  }
  if (status === 'done') return { status: approvedReview ? 'verified' : 'awaiting-review' };
  return { status };
}

export function parseFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) return { attributes: {}, body: text };
  const attributes = {};
  for (const line of match[1].split('\n')) {
    const field = /^([a-z_]+):\s*(.*?)\s*$/.exec(line);
    if (field) attributes[field[1]] = field[2].replace(/^['"]|['"]$/g, '');
  }
  return { attributes, body: text.slice(match[0].length), raw: match[1] };
}

export function setFrontmatterFields(text, fields) {
  const parsed = parseFrontmatter(text);
  const lines = parsed.raw ? parsed.raw.split('\n') : [];
  for (const [key, value] of Object.entries(fields)) {
    const index = lines.findIndex((line) => line.startsWith(`${key}:`));
    if (value === undefined || value === null) {
      if (index >= 0) lines.splice(index, 1);
    } else if (index >= 0) lines[index] = `${key}: ${value}`;
    else lines.push(`${key}: ${value}`);
  }
  return `---\n${lines.join('\n')}\n---\n${parsed.body}`;
}
