import OpenAI from "openai";

const LLM_MODEL = process.env.LLM_MODEL || "deepseek/deepseek-v4-pro";

const client = new OpenAI({
  apiKey: process.env.CF_AIG_TOKEN,
  baseURL: "https://gateway.ai.cloudflare.com/v1/bc6f3ab61d8bd82e5407bc6a53a57a8e/demo/compat",
});

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callLLM(messages: LLMMessage[]): Promise<string> {
  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    messages,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("LLM returned empty content");
  }

  return content;
}

export async function callLLMJSON<T>(messages: LLMMessage[]): Promise<T> {
  const systemJsonInstruction: LLMMessage = {
    role: "system",
    content: "You must respond with valid JSON only. No markdown, no explanation, no code blocks. Pure JSON.",
  };

  const messagesWithInstruction = [systemJsonInstruction, ...messages];
  const raw = await callLLM(messagesWithInstruction);

  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(`Failed to parse LLM JSON response: ${cleaned.slice(0, 200)}`);
  }
}
