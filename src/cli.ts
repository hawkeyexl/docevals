/** docevals CLI entry point. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { DocevalsError } from "./types.js";
import { runList, renderList } from "./commands/list.js";

const pkg = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"),
    "utf8",
  ),
) as { version: string };

const program = new Command();

program
  .name("docevals")
  .description(
    "Deterministic and LLM-as-judge evals for documentation pages, driven by frontmatter.",
  )
  .version(pkg.version);

function fail(e: unknown): never {
  if (e instanceof DocevalsError) {
    console.error(pc.red(`docevals: ${e.message}`));
    process.exit(2);
  }
  throw e;
}

program
  .command("list")
  .description("Show the resolved eval plan per page without running anything")
  .argument("[globs...]", "File globs (default: config files.include)")
  .option("-c, --config <path>", "Path to docevals.config.yaml")
  .option("-f, --format <format>", "Output format: human | json", "human")
  .action((globs: string[], opts: { config?: string; format: string }) => {
    try {
      const run = runList(globs, {
        config: opts.config,
        format: opts.format as "human" | "json",
      });
      console.log(renderList(run, opts.format as "human" | "json"));
      process.exitCode = run.exitCode;
    } catch (e) {
      fail(e);
    }
  });

program.parse();
