"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LLMModel, LLMProviders } from "@/lib/schemas";

// Updated models array with provider information
const models = [
  { value: "gpt-4o", label: "GPT 4o", provider: "openai" },
  { value: "gpt-4o-mini", label: "GPT 4o mini", provider: "openai" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo", provider: "openai" },
  {
    value: "claude-3-5-sonnet-20241022",
    label: "Claude Sonnet 3.5",
    provider: "anthropic",
  },
  {
    value: "claude-3-5-haiku-20241022",
    label: "Claude Haiku 3.5",
    provider: "anthropic",
  },
  { value: "grok-beta", label: "Grok Beta", provider: "xai" },
];

interface ModelSelectorProps {
  onSelect: (model1: LLMModel, model2: LLMModel) => void;
}

export function ModelSelector({ onSelect }: ModelSelectorProps) {
  const [selectedModels, setSelectedModels] = useState<{
    model1?: LLMModel;
    model2?: LLMModel;
  }>({});

  const handleModel1Select = (value: string) => {
    const selectedModel = models.find((model) => model.value === value);
    if (!selectedModel) return;

    const llmModel = {
      name: selectedModel.value,
      provider: selectedModel.provider as LLMProviders,
    };

    setSelectedModels((prev) => ({ ...prev, model1: llmModel }));
  };

  const handleModel2Select = (value: string) => {
    const selectedModel = models.find((model) => model.value === value);
    if (!selectedModel) return;

    const llmModel = {
      name: selectedModel.value,
      provider: selectedModel.provider as LLMProviders,
    };

    setSelectedModels((prev) => ({ ...prev, model2: llmModel }));
  };

  useEffect(() => {
    if (selectedModels.model1 && selectedModels.model2) {
      onSelect(selectedModels.model1, selectedModels.model2);
    }
  }, [selectedModels]);

  return (
    <div className="flex gap-4">
      <Select onValueChange={handleModel1Select}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select first model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={handleModel2Select}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select second model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.value} value={model.value}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
