const LLM_BASE_URL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o";

export type LLMMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function callLLM(messages: LLMMessage[]): Promise<string> {
  const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

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
