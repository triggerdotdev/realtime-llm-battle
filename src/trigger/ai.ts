import { LLMModel, LLMModelEval } from "@/lib/schemas";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { xai } from "@ai-sdk/xai";
import { metadata, schemaTask } from "@trigger.dev/sdk/v3";
import {
  LanguageModelUsage,
  streamObject,
  streamText,
  type DeepPartial,
  type TextStreamPart,
} from "ai";
import { z } from "zod";

export type STREAM = TextStreamPart<{}>;

export type STREAMS = {
  model1: STREAM;
  model2: STREAM;
  eval: DeepPartial<LLMModelEval>;
};

function createModel(model: LLMModel) {
  switch (model.provider) {
    case "openai":
      return openai(model.name);
    case "anthropic":
      return anthropic(model.name);
    case "xai":
      return xai(model.name);
  }
}

export const llmBattle = schemaTask({
  id: "llm-battle",
  description: "Compare responses from multiple language models",
  schema: z.object({
    model1: LLMModel,
    model2: LLMModel,
    prompt: z.string(),
  }),
  run: async ({ model1, model2, prompt }) => {
    const response1 = streamText({
      model: createModel(model1),
      prompt,
      maxSteps: 3,
      experimental_telemetry: {
        isEnabled: true,
      },
    });

    const response2 = streamText({
      model: createModel(model2),
      prompt,
      maxSteps: 3,
      experimental_telemetry: {
        isEnabled: true,
      },
    });

    // Stream the responses from both models through Trigger.dev Realtime
    await metadata.stream("model1", response1.fullStream);
    await metadata.stream("model2", response2.fullStream);

    // Collect the results from both streams for evaluation
    // There's probably a better "streamier" way to do this
    const [result1, result2] = await collectResults(
      response1.fullStream as AsyncIterable<STREAM>,
      response2.fullStream as AsyncIterable<STREAM>,
      model1,
      model2
    );

    const evalPrompt = createEvalPrompt(
      {
        model: model1,
        text: result1.text,
        usage: result1.usage,
      },
      {
        model: model2,
        text: result2.text,
        usage: result2.usage,
      }
    );

    const evaluation = streamObject({
      model: openai("gpt-4o"), // 🤖 Use GPT-4o for evaluation
      prompt: evalPrompt,
      schema: LLMModelEval,
      experimental_telemetry: {
        isEnabled: true,
      },
    });

    // Now add the evaluation to the realtime stream
    await metadata.stream("eval", evaluation.partialObjectStream);
  },
});

type LLMModelResults = {
  model: LLMModel;
  text: string;
  usage: LanguageModelUsage;
};

async function collectResults(
  stream1: AsyncIterable<STREAM>,
  stream2: AsyncIterable<STREAM>,
  model1: LLMModel,
  model2: LLMModel
): Promise<[LLMModelResults, LLMModelResults]> {
  const results = await Promise.all(
    [stream1, stream2].map(async (stream) => {
      let text = "";
      let usage: LanguageModelUsage | undefined = undefined;

      for await (const part of stream) {
        switch (part.type) {
          case "text-delta": {
            text += part.textDelta;
            break;
          }
          case "step-finish": {
            usage = part.usage;
            break;
          }
        }
      }

      if (!usage) {
        throw new Error("Missing step-finish part");
      }

      return { text, usage };
    })
  );

  return [
    {
      model: model1,
      text: results[0].text,
      usage: results[0].usage,
    },
    {
      model: model2,
      text: results[1].text,
      usage: results[1].usage,
    },
  ];
}

// TODO: Use langfuse to manage the prompt
function createEvalPrompt(
  model1Results: LLMModelResults,
  model2Results: LLMModelResults
) {
  return `Compare the responses from ${model1Results.model.name} (as "model1") and ${model2Results.model.name} (as "model2"):

  Generate a score between 0 and 100 for each model based on the quality of the text response and the usage. 100 is best.

  Best means:
    - The text response is high quality
    - The usage is lower
    - The response is relevant to the prompt
    - The response is coherent
    - It doesn't sound like an LLM generated it

  model1 is ${model1Results.model.name} by ${model1Results.model.provider}:
  
  model1 text response:
  ${model1Results.text}

  model1 usage:
  Prompt tokens: ${model1Results.usage.promptTokens}
  Output tokens: ${model1Results.usage.completionTokens}

  model2 is ${model2Results.model.name} by ${model2Results.model.provider}:

  model2 text response:
  ${model2Results.text}

  model2 usage:
  Prompt tokens: ${model2Results.usage.promptTokens}
  Output tokens: ${model2Results.usage.completionTokens}

  Please think of the scores and the winner first, and then provide a reason for the score. In the reason please identify the model by name, not "model1" or "model2".
  `;
}
