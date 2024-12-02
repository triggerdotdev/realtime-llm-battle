import { z } from "zod";

export const LLMProviders = z.enum(["openai", "anthropic", "xai"]);
export type LLMProviders = z.infer<typeof LLMProviders>;

export const LLMModel = z.object({
  provider: LLMProviders,
  name: z.string(),
});

export type LLMModel = z.infer<typeof LLMModel>;

export const LLMModelEval = z.object({
  model1: z
    .object({
      score: z
        .number()
        .describe("The score of model1 between 0 and 100. 100 is best."),
    })
    .describe("The evaluation of model1"),
  model2: z
    .object({
      score: z
        .number()
        .describe("The score of model2 between 0 and 100. 100 is best."),
    })
    .describe("The evaluation of model2"),
  reason: z.string().optional().describe("The reason for the score."),
});

export type LLMModelEval = z.infer<typeof LLMModelEval>;
