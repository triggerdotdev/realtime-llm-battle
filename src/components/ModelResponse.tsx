"use client";

import { cn } from "@/lib/utils";
import type { STREAM } from "@/trigger/ai";
import type { LLMModel } from "@/lib/schemas";

interface ModelResponseProps {
  model: LLMModel;
  stream: STREAM[];
  isWinner?: boolean;
  score?: number;
}

export default function ModelResponse({
  model,
  stream,
  isWinner,
  score,
}: ModelResponseProps) {
  const text = stream
    .filter((part) => part.type === "text-delta")
    .map((part) => part.textDelta)
    .join("");
  const stepFinish = stream.find((part) => part.type === "step-finish");

  return (
    <div
      className={cn(
        "border rounded-lg p-4",
        isWinner ? "bg-green-100" : "bg-white"
      )}
    >
      <h2 className="text-lg font-semibold mb-2">
        {model.name} - {model.provider}
        {isWinner && (
          <span className="ml-2 text-sm font-normal text-green-600">
            Winner
          </span>
        )}
        {score !== undefined && (
          <span className="ml-2 text-sm font-normal text-blue-600">
            Score: {score}
          </span>
        )}
      </h2>
      <div className="h-[550px] overflow-y-auto mb-2 bg-gray-50 p-2 rounded">
        {stream.length ? (
          <pre className="whitespace-pre-wrap text-sm">{text}</pre>
        ) : (
          <p className="text-gray-500">Waiting for response...</p>
        )}
      </div>
      <div className="text-xs text-gray-500">
        {stepFinish?.usage ? (
          <>
            <span>Prompt tokens: {stepFinish.usage.promptTokens}</span>
            <span className="ml-4">
              Output tokens: {stepFinish.usage.completionTokens}
            </span>
            <span className="ml-4">
              Total tokens: {stepFinish.usage.totalTokens}
            </span>
          </>
        ) : (
          <span>Waiting for response...</span>
        )}
      </div>
    </div>
  );
}
