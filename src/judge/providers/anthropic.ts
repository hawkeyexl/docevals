/**
 * Anthropic provider: structured output via a single forced tool call whose
 * input schema is the verdict schema — the model cannot answer any other way.
 */
import Anthropic from "@anthropic-ai/sdk";
import { DocevalsError } from "../../types.js";
import type {
  CompleteJSONRequest,
  CompleteJSONResponse,
  JudgeProvider,
} from "../types.js";

const TOOL_NAME = "record_verdict";

export class AnthropicProvider implements JudgeProvider {
  private readonly client: Anthropic;

  constructor(
    private readonly model: string,
    apiKeyEnv: string,
  ) {
    const apiKey = process.env[apiKeyEnv];
    if (!apiKey) {
      throw new DocevalsError(
        `Anthropic provider needs ${apiKeyEnv} set (or choose another provider)`,
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  provider(): string {
    return "anthropic";
  }

  modelName(): string {
    return this.model;
  }

  async completeJSON(req: CompleteJSONRequest): Promise<CompleteJSONResponse> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      temperature: req.temperature,
      system: req.system,
      messages: [{ role: "user", content: req.user }],
      tools: [
        {
          name: TOOL_NAME,
          description: "Record the structured eval verdict.",
          input_schema: req.schema as Anthropic.Tool["input_schema"],
        },
      ],
      tool_choice: { type: "tool", name: TOOL_NAME },
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
    );
    if (!toolUse) {
      throw new Error("Anthropic response contained no tool_use block");
    }
    return {
      json: toolUse.input,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
