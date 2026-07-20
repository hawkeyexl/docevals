/**
 * Judge provider contract. Providers turn a (system, user, schema) request
 * into schema-conforming JSON. `provider()` and `modelName()` feed cache keys,
 * so two providers/models never share cached verdicts.
 */
export interface CompleteJSONRequest {
  system: string;
  user: string;
  /** JSON Schema the response must conform to (verdict-schema.json). */
  schema: Record<string, unknown>;
  temperature: number;
}

export interface CompleteJSONResponse {
  json: unknown;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface JudgeProvider {
  provider(): string;
  modelName(): string;
  completeJSON(req: CompleteJSONRequest): Promise<CompleteJSONResponse>;
}
