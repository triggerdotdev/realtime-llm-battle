"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput";
import ModelResponse from "@/components/ModelResponse";
import { ModelSelector } from "@/components/ModelSelector";
import { llmBattle, STREAMS } from "@/trigger/ai";
import { LLMModel, LLMModelEval } from "@/lib/schemas";
import { useRealtimeTaskTriggerWithStreams } from "@trigger.dev/react-hooks";
import EvalResponse from "./EvalResponse";

export default function AppUI({ triggerToken }: { triggerToken: string }) {
  const triggerInstance = useRealtimeTaskTriggerWithStreams<
    typeof llmBattle,
    STREAMS
  >("llm-battle", {
    accessToken: triggerToken,
    baseURL: process.env.NEXT_PUBLIC_TRIGGER_API_URL,
  });

  const [selectedModels, setSelectedModels] = useState<
    { model1: LLMModel; model2: LLMModel } | undefined
  >(undefined);

  const isLoading = triggerInstance.isLoading;

  const handleModelSelect = (model1: LLMModel, model2: LLMModel) => {
    setSelectedModels({ model1, model2 });
  };

  const handleSubmit = async (inputPrompt: string) => {
    if (!selectedModels) {
      return;
    }

    triggerInstance.submit({
      prompt: inputPrompt,
      ...selectedModels,
    });
  };

  // isLoading should also be true until both streams are finished
  const model1Finished = triggerInstance.streams.model1?.find(
    (part) => part.type === "step-finish"
  );
  const model2Finished = triggerInstance.streams.model2?.find(
    (part) => part.type === "step-finish"
  );

  const $isLoading =
    isLoading ||
    (!!triggerInstance.handle && (!model1Finished || !model2Finished));

  const parsedEval = triggerInstance.streams.eval
    ? LLMModelEval.safeParse(
        triggerInstance.streams.eval[triggerInstance.streams.eval.length - 1]
      )
    : undefined;

  const evaluation = parsedEval?.success ? parsedEval.data : undefined;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">
          Trigger.dev LLM Battle
        </h1>
        <h2 className="text-large text-center mb-8">
          Realtime Streams + Trigger React hooks
        </h2>
        <div className="space-y-6">
          <ModelSelector onSelect={handleModelSelect} />
          <PromptInput onSubmit={handleSubmit} isLoading={$isLoading} />
          <div className="grid gap-6 md:grid-cols-2">
            {selectedModels && (
              <>
                <ModelResponse
                  key={"model1"}
                  model={selectedModels.model1}
                  stream={triggerInstance.streams.model1 ?? []}
                  isWinner={
                    evaluation
                      ? evaluation.model1.score > evaluation.model2.score
                      : undefined
                  }
                  score={evaluation?.model1.score}
                />
                <ModelResponse
                  key={"model2"}
                  model={selectedModels.model2}
                  stream={triggerInstance.streams.model2 ?? []}
                  isWinner={
                    evaluation
                      ? evaluation.model2.score > evaluation.model1.score
                      : undefined
                  }
                  score={evaluation?.model2.score}
                />
              </>
            )}
          </div>
          {evaluation && (
            <EvalResponse isLoading={$isLoading} evaluation={evaluation} />
          )}
        </div>
      </div>
    </div>
  );
}
