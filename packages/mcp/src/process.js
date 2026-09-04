import { execFile } from 'node:child_process';

export function runProcess(command, args, {
  cwd, input = '', timeoutMs = 30 * 60_000, maxOutputBytes = 1024 * 1024, env = process.env, signal,
} = {}) {
  return new Promise((resolve, reject) => {
    const child = execFile(command, args, { cwd, env, maxBuffer: maxOutputBytes, signal }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
      } else resolve({ stdout, stderr });
    });
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 2_000).unref();
    }, timeoutMs);
    timer.unref();
    child.once('exit', () => clearTimeout(timer));
    if (input) child.stdin.end(input);
    else child.stdin.end();
  });
}

export async function git(cwd, args, options = {}) {
  return runProcess('git', args, { cwd, ...options });
}
