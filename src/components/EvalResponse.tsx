"use client";

import { LLMModelEval } from "@/lib/schemas";

interface EvalResponseProps {
  isLoading: boolean;
  evaluation: LLMModelEval;
}

export default function EvalResponse({
  isLoading,
  evaluation,
}: EvalResponseProps) {
  return (
    <div className="border rounded-lg p-4 bg-white">
      <h2 className="text-lg font-semibold mb-2">Evaluation</h2>
      <div className="h-[200px] overflow-y-auto mb-2 bg-gray-50 p-4 rounded">
        {isLoading ? (
          <p className="text-gray-500">Evaluating responses...</p>
        ) : (
          <pre className="whitespace-pre-wrap text-base">
            {evaluation.reason}
          </pre>
        )}
      </div>
    </div>
  );
}
