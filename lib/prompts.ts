import type { AccountSpec, SourceMaterial, Candidate } from "./schemas";
import type { LLMMessage } from "./llm";

/**
 * Anti-AI writing rules applied to both generation and rewrite prompts.
 * Goal: produce content that sounds like a real person wrote it, not a language model.
 */
const ANTI_AI_WRITING_RULES = `Anti-AI writing rules (apply strictly):
- Use only the most basic conjunctions and transitions: "and", "but", "so", "because", "then". Never use: Furthermore, Moreover, Additionally, Consequently, Subsequently, Notably, In conclusion, In summary, As a result, It is worth noting, It is important to highlight.
- Use plain everyday vocabulary. Never use: leverage, utilize, delve, robust, comprehensive, streamline, facilitate, paradigm, transformative, game-changing, cutting-edge, revolutionize, empower, seamlessly.
- Let the logic flow from sentence content, not from connective filler. If two sentences are related, place them next to each other — do not glue them with a transition phrase.
- Do not write a conclusion or summary paragraph at the end. Stop when the point is made.`;

export function buildGenerateCandidatesPrompt(
  accountSpec: AccountSpec,
  materials: SourceMaterial[]
): LLMMessage[] {
  return [
    {
      role: "user",
      content: `You are a content strategist for a vertical social media account.

Account Spec:
- Name: ${accountSpec.name}
- Vertical: ${accountSpec.vertical}
- Audience: ${accountSpec.audience}
- Platform: ${accountSpec.platform}
- Commercial Goal: ${accountSpec.commercialGoal}
- Tone: ${accountSpec.tone}
- Content Pillars: ${accountSpec.contentPillars.join(", ")}

Source Materials:
${materials.map((m) => `### ${m.title}\n${m.content}`).join("\n\n")}

Generate exactly 3 candidate posts for ${accountSpec.platform}. Each must be grounded in the source materials.

Each candidate must be a complete, self-contained post. Do not write teasers, previews, or "Part 1 of N" stubs.
If the format is "thread-starter", write the full thread content (all parts) as one continuous post, not just the opening hook.
The content should be substantive — at least 150 characters of useful information, not just a headline or a call-to-action.

${ANTI_AI_WRITING_RULES}

Return a JSON array of candidates with this exact shape:
[
  {
    "title": "short title",
    "content": "the post content",
    "format": "one of: thread-starter, listicle, personal-story, hot-take, how-to"
  }
]`,
    },
  ];
}

export function buildJudgePrompt(
  accountSpec: AccountSpec,
  candidate: { title: string; content: string; format: string }
): LLMMessage[] {
  return [
    {
      role: "user",
      content: `You are a content quality judge. Evaluate this social media post across 6 dimensions for the given account spec.

Account:
- Name: ${accountSpec.name}
- Vertical: ${accountSpec.vertical}
- Audience: ${accountSpec.audience}
- Platform: ${accountSpec.platform}
- Commercial Goal: ${accountSpec.commercialGoal}
- Tone: ${accountSpec.tone}

Post to judge:
Title: ${candidate.title}
Content: ${candidate.content}

Score each dimension 1-10 and provide a brief comment. Also provide a final recommendation.

Anti-AI Judge rubric — flag any of the following patterns and lower the score accordingly:
- Formal transition words: Furthermore, Moreover, Additionally, Consequently, Subsequently, Notably, In conclusion, In summary, As a result
- Corporate/AI vocabulary: leverage, utilize, delve, robust, comprehensive, streamline, facilitate, paradigm, transformative, game-changing
- A concluding summary paragraph that restates what was already said
- Overly polished sentence structure with no variation — reads like a generated document, not a real person
- Absence of any personal or specific detail that only a real practitioner would include
If none of these patterns are present, score 9-10.

Return JSON with this exact shape:
{
  "judges": [
    { "judge": "Persona Judge", "score": 8, "comment": "..." },
    { "judge": "Vertical Fit Judge", "score": 7, "comment": "..." },
    { "judge": "Platform Judge", "score": 9, "comment": "..." },
    { "judge": "Commercial Judge", "score": 6, "comment": "..." },
    { "judge": "Responsible AI Judge", "score": 8, "comment": "..." },
    { "judge": "Anti-AI Judge", "score": 7, "comment": "Cite the specific words or patterns that triggered the score, e.g. 'Uses furthermore and a summary paragraph'" }
  ],
  "recommendation": "publish" | "revise" | "reject",
  "overallScore": 7.6
}`,
    },
  ];
}

export function buildConfidenceMapPrompt(
  candidate: { content: string },
  materials: SourceMaterial[]
): LLMMessage[] {
  return [
    {
      role: "user",
      content: `You are a fact-checking assistant. Analyze the claims in this social media post and classify each claim as grounded, inferred, or unsupported based on the source materials.

Definitions:
- grounded: claim is directly supported by the source materials
- inferred: claim is a reasonable inference from the source materials but not stated explicitly
- unsupported: claim is not supported by the source materials, is speculative, or could be misleading

Post content:
${candidate.content}

Source Materials:
${materials.map((m) => `### ${m.title}\n${m.content}`).join("\n\n")}

Identify 3-6 distinct claims from the post and classify each. Return JSON:
{
  "confidenceMap": [
    {
      "claim": "the specific claim text",
      "level": "grounded" | "inferred" | "unsupported",
      "reason": "brief explanation"
    }
  ]
}`,
    },
  ];
}

export function buildRewritePrompt(
  accountSpec: AccountSpec,
  candidate: Candidate,
  steeringInstruction: string
): LLMMessage[] {
  return [
    {
      role: "user",
      content: `You are a content editor. Rewrite the following social media post based on the operator's steering instruction.

Account:
- Name: ${accountSpec.name}
- Vertical: ${accountSpec.vertical}
- Tone: ${accountSpec.tone}
- Platform: ${accountSpec.platform}

Original post (Version ${candidate.version}):
Title: ${candidate.title}
Content: ${candidate.content}

Judge Feedback (Content Thunderdome):
${candidate.judges.map((j) => `- ${j.judge}: ${j.score}/10 — "${j.comment}"`).join("\n")}

Confidence Map:
${candidate.confidenceMap.map((ci) => `- [${ci.level}] "${ci.claim}" — ${ci.reason}`).join("\n")}

Operator steering instruction:
${steeringInstruction}

Rules:
- Fix or remove claims marked as "unsupported" in the confidence map. Do not introduce new claims that are not grounded in the source materials.
- Address low-scoring dimensions from the judge feedback where possible.
- Follow the operator's steering instruction.
- ${ANTI_AI_WRITING_RULES}

Rewrite the post following these rules while keeping it grounded in facts and appropriate for the account. Return JSON:
{
  "title": "new title",
  "content": "rewritten content",
  "format": "${candidate.format}"
}`,
    },
  ];
}
