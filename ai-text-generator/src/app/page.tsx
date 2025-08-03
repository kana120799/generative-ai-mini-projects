"use client";

import { useState } from "react";

interface GenerationResult {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Parameters
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);
  const [provider, setProvider] = useState("gemini");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          temperature,
          maxTokens,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate text");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const presetPrompts = [
    "Write a short story about a robot learning to paint",
    "Explain quantum computing in simple terms",
    "Create a product description for a smart water bottle",
    "Write a professional email declining a meeting",
    "Generate creative names for a coffee shop",
  ];

  const providerInfo = {
    gemini: {
      name: "Google Gemini",
      model: "gemini-1.5-flash",
      description:
        "Google's advanced language model with strong reasoning capabilities",
      color: "blue",
    },
    deepseek: {
      name: "DeepSeek",
      model: "deepseek-chat",
      description:
        "Efficient and capable language model optimized for various tasks",
      color: "purple",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Text Generator
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Generate Text
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(providerInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setProvider(key)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      provider === key
                        ? `border-${info.color}-500 bg-${info.color}-50`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-gray-800">{info.name}</div>
                    <div className="text-sm text-gray-600">{info.model}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="w-full h-32 px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Preset Prompts */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Start Prompts
              </label>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(preset)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {preset.substring(0, 30)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Lower = More focused, Higher = More creative
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens: {maxTokens}
                </label>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="10"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Maximum length of generated text
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                provider === "gemini"
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {loading
                ? "Generating..."
                : `Generate with ${
                    providerInfo[provider as keyof typeof providerInfo].name
                  }`}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Generated Text
            </h2>

            {result ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 whitespace-pre-wrap">
                    {result.text}
                  </p>
                </div>

                {/* Usage Statistics */}
                <div
                  className={`p-4 rounded-lg ${
                    result.provider === "gemini" ? "bg-blue-50" : "bg-purple-50"
                  }`}
                >
                  <h3
                    className={`font-semibold mb-2 ${
                      result.provider === "gemini"
                        ? "text-blue-800"
                        : "text-purple-800"
                    }`}
                  >
                    Generation Info
                  </h3>
                  <div
                    className={`space-y-1 text-sm ${
                      result.provider === "gemini"
                        ? "text-blue-700"
                        : "text-purple-700"
                    }`}
                  >
                    <div>
                      Provider:{" "}
                      {
                        providerInfo[
                          result.provider as keyof typeof providerInfo
                        ].name
                      }
                    </div>
                    <div>Model: {result.model}</div>
                    {result.usage.totalTokens > 0 && (
                      <>
                        <div>Prompt Tokens: {result.usage.promptTokens}</div>
                        <div>
                          Completion Tokens: {result.usage.completionTokens}
                        </div>
                        <div>Total Tokens: {result.usage.totalTokens}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🤖</div>
                <p>Generated text will appear here</p>
                <p className="text-sm mt-2">
                  Try different providers to compare results!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Educational Content */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            AI Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Temperature
              </h3>
              <p className="text-sm text-yellow-700">
                Controls randomness. Lower values (0.1-0.3) for focused
                responses, higher values (0.7-1.0) for creative outputs.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Max Tokens</h3>
              <p className="text-sm text-green-700">
                Limits response length. One token ≈ 4 characters. Adjust based
                on desired response length.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
