import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

//  Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

// --- OpenAI Configuration ---
// async function callOpenAIAPI(
//   prompt: string,
//   temperature: number,
//   maxTokens: number
// ) {
//   const response = await fetch("https://api.openai.com/v1/chat/completions", {  t
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       temperature: temperature,
//       max_tokens: maxTokens,
//     } ),
//   });

//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.error?.message || "OpenAI API error");
//   }

//   return response.json();
// }

// DeepSeek

async function callDeepSeekAPI(
  prompt: string,
  temperature: number,
  maxTokens: number
) {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "DeepSeek API error");
  }

  return response.json();
}

// Gemini API
async function callGeminiAPI(
  prompt: string,
  temperature: number,
  maxTokens: number
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return {
    text,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      temperature = 0.7,
      maxTokens = 150,
      provider = "gemini",
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let result;

    if (provider === "deepseek") {
      //  DeepSeek API
      const deepseekResponse = await callDeepSeekAPI(
        prompt,
        temperature,
        maxTokens
      );
      result = {
        text: deepseekResponse.choices[0]?.message?.content || "",
        usage: {
          promptTokens: deepseekResponse.usage?.prompt_tokens || 0,
          completionTokens: deepseekResponse.usage?.completion_tokens || 0,
          totalTokens: deepseekResponse.usage?.total_tokens || 0,
        },
        model: "deepseek-chat",
        provider: "deepseek",
      };
    } else {
      //  Gemini API
      const geminiResponse = await callGeminiAPI(
        prompt,
        temperature,
        maxTokens
      );
      result = {
        text: geminiResponse.text,
        usage: geminiResponse.usage,
        model: "gemini-1.5-flash",
        provider: "gemini",
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API error:", error);

    if (error.message?.includes("API key")) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate text: ${error.message}` },
      { status: 500 }
    );
  }
}
