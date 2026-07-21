/**
 * Process execution wrapper. Uses cross-spawn so npm shims (`markdownlint.cmd`,
 * `vale.cmd`) resolve on Windows without `shell: true` and its quoting hazards.
 * Large payloads go through `input` (piped stdin) rather than argv — Windows
 * caps the command line at ~32K characters.
 */
import spawn from "cross-spawn";
import type { ExecFn, ExecResult } from "./types.js";

export const realExec: ExecFn = (cmd, opts = {}) => {
  const [bin, ...args] = cmd;
  if (!bin) {
    return Promise.resolve<ExecResult>({
      code: null,
      stdout: "",
      stderr: "",
      timedOut: false,
      spawnError: "Empty command",
    });
  }
  return new Promise<ExecResult>((resolvePromise) => {
    const child = spawn(bin, args, {
      cwd: opts.cwd,
      env: { ...process.env, ...(opts.env ?? {}) },
      stdio: [opts.input != null ? "pipe" : "ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;

    const timeoutMs = opts.timeoutMs ?? 60000;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    const settle = (result: ExecResult): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolvePromise(result);
    };

    if (opts.input != null && child.stdin) {
      // EPIPE from a child that exits before reading is not our failure.
      child.stdin.on("error", () => {});
      child.stdin.end(opts.input);
    }
    child.stdout?.on("data", (d: Buffer) => (stdout += d.toString()));
    child.stderr?.on("data", (d: Buffer) => (stderr += d.toString()));
    child.on("error", (e) =>
      settle({ code: null, stdout, stderr, timedOut, spawnError: e.message }),
    );
    child.on("close", (code) => settle({ code, stdout, stderr, timedOut }));
  });
};

/** Truncate command output for finding messages. */
export function outputTail(result: ExecResult, maxChars = 400): string {
  const text = (result.stderr.trim() || result.stdout.trim()).trim();
  if (text.length <= maxChars) return text;
  return `…${text.slice(-maxChars)}`;
}
