/** Provider factory: resolve the configured/CLI-selected judge provider. */
import { DocevalsError } from "../../types.js";
import type { DocevalsConfig, ProviderName } from "../../core/config.js";
import type { JudgeOptions } from "../../core/engine.js";
import type { JudgeProvider } from "../types.js";
import { AnthropicProvider } from "./anthropic.js";

export function makeProvider(
  config: DocevalsConfig,
  options: JudgeOptions = {},
): JudgeProvider {
  const name = (options.provider ?? config.provider.default) as ProviderName;
  switch (name) {
    case "anthropic":
      return new AnthropicProvider(
        options.model ?? config.provider.anthropic.model,
        config.provider.anthropic.apiKeyEnv,
      );
    case "openai":
    case "claude-cli":
      // Implemented in a later phase.
      throw new DocevalsError(
        `Provider "${name}" is not available yet — use anthropic`,
      );
    default:
      throw new DocevalsError(`Unknown provider "${String(name)}"`);
  }
}
