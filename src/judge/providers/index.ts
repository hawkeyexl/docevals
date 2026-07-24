/** Provider factory: resolve the configured/CLI-selected judge provider. */
import { DocevalsError } from "../../types.js";
import type { DocevalsConfig, ProviderName } from "../../core/config.js";
import type { JudgeOptions } from "../../core/engine.js";
import type { JudgeProvider } from "../types.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAICompatProvider } from "./openai-compat.js";
import { ClaudeCliProvider } from "./claude-cli.js";

/**
 * Resolve which provider and model a run would use without constructing the
 * provider (construction may require an API key). Lets fully-cached runs
 * compute cache keys and pricing with no credentials.
 */
export function resolveProviderIdentity(
  config: DocevalsConfig,
  options: JudgeOptions = {},
): { name: ProviderName; model: string } {
  const name = (options.provider ?? config.provider.default) as ProviderName;
  switch (name) {
    case "anthropic":
      return { name, model: options.model ?? config.provider.anthropic.model };
    case "openai":
      return { name, model: options.model ?? config.provider.openai.model };
    case "claude-cli":
      return { name, model: options.model ?? config.provider["claude-cli"].model };
    default:
      throw new DocevalsError(`Unknown provider "${String(name)}"`);
  }
}

export function makeProvider(
  config: DocevalsConfig,
  options: JudgeOptions = {},
): JudgeProvider {
  const { name, model } = resolveProviderIdentity(config, options);
  switch (name) {
    case "anthropic":
      return new AnthropicProvider(model, config.provider.anthropic.apiKeyEnv);
    case "openai":
      return new OpenAICompatProvider(
        config.provider.openai.baseUrl,
        model,
        config.provider.openai.apiKeyEnv,
      );
    case "claude-cli":
      return new ClaudeCliProvider(
        model,
        config.provider["claude-cli"].command,
      );
  }
}
