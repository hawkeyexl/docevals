/** docevals CLI entry point. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Command } from "commander";
import pc from "picocolors";
import { DocevalsError } from "./types.js";
import { runList, renderList } from "./commands/list.js";
import { runRun } from "./commands/run.js";
import { render, type ReportFormat } from "./reporters/index.js";

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

program
  .command("run")
  .description("Run evals against documentation pages")
  .argument("[globs...]", "File globs (default: config files.include)")
  .option("-c, --config <path>", "Path to docevals.config.yaml")
  .option(
    "-f, --format <format>",
    "Output format: human | json | markdown | github",
    "human",
  )
  .option("--deterministic-only", "Run only command/tool graders, skip the LLM judge")
  .option("--llm-only", "Run only LLM-judged evals, skip deterministic graders")
  .option("--no-frontmatter-commands", "Skip command evals defined in page frontmatter")
  .option("--no-generate", "Do not generate scripts for command evals missing a command")
  .option("--no-cache", "Bypass the judge response cache")
  .option("--fail-on-review", "Exit 1 when any eval lands in the human-review zone")
  .option("--provider <name>", "Judge provider: anthropic | openai | claude-cli")
  .option("--model <model>", "Judge model override")
  .option("--runs <n>", "Ensemble runs per eval", (v) => Number.parseInt(v, 10))
  .option("--max-cost <usd>", "Abort judging past this cost", (v) => Number.parseFloat(v))
  .action(async (globs: string[], opts: Record<string, unknown>) => {
    try {
      const report = await runRun(globs, {
        config: opts.config as string | undefined,
        format: opts.format as ReportFormat,
        deterministicOnly: opts.deterministicOnly as boolean | undefined,
        llmOnly: opts.llmOnly as boolean | undefined,
        frontmatterCommands: opts.frontmatterCommands as boolean | undefined,
        generate: opts.generate as boolean | undefined,
        cache: opts.cache as boolean | undefined,
        failOnReview: opts.failOnReview as boolean | undefined,
        provider: opts.provider as string | undefined,
        model: opts.model as string | undefined,
        runs: opts.runs as number | undefined,
        maxCost: opts.maxCost as number | undefined,
      });
      console.log(render(report, opts.format as ReportFormat));
      process.exitCode = report.exitCode;
    } catch (e) {
      fail(e);
    }
  });

program.parse();
