import { nanoid } from "nanoid";
import { callLLMJSON } from "./llm";
import {
  buildGenerateCandidatesPrompt,
  buildJudgePrompt,
  buildConfidenceMapPrompt,
  buildRewritePrompt,
} from "./prompts";
import { fallbackCandidateList } from "./demo-data";
import type { AccountSpec, SourceMaterial, Candidate, JudgeResult, ConfidenceItem, Recommendation } from "./schemas";

type RawCandidate = { title: string; content: string; format: string };
type JudgeResponse = { judges: JudgeResult[]; recommendation: Recommendation; overallScore: number };
type ConfidenceResponse = { confidenceMap: ConfidenceItem[] };

async function generateCandidates(
  accountSpec: AccountSpec,
  materials: SourceMaterial[]
): Promise<RawCandidate[]> {
  const messages = buildGenerateCandidatesPrompt(accountSpec, materials);
  return callLLMJSON<RawCandidate[]>(messages);
}

async function judgeCandidate(
  accountSpec: AccountSpec,
  candidate: RawCandidate
): Promise<JudgeResponse> {
  const messages = buildJudgePrompt(accountSpec, candidate);
  return callLLMJSON<JudgeResponse>(messages);
}

async function buildConfidenceMap(
  candidate: RawCandidate,
  materials: SourceMaterial[]
): Promise<ConfidenceResponse> {
  const messages = buildConfidenceMapPrompt(candidate, materials);
  return callLLMJSON<ConfidenceResponse>(messages);
}

export async function runGeneratePipeline(
  accountSpec: AccountSpec,
  materials: SourceMaterial[]
): Promise<{ candidates: Candidate[]; usedFallback: boolean }> {
  try {
    const rawCandidates = await generateCandidates(accountSpec, materials);

    const candidates = await Promise.all(
      rawCandidates.map(async (raw) => {
        const [judgeResult, confidenceResult] = await Promise.all([
          judgeCandidate(accountSpec, raw),
          buildConfidenceMap(raw, materials),
        ]);

        const candidate: Candidate = {
          id: nanoid(),
          version: 1,
          title: raw.title,
          content: raw.content,
          format: raw.format,
          judges: judgeResult.judges,
          confidenceMap: confidenceResult.confidenceMap,
          recommendation: judgeResult.recommendation,
          overallScore: judgeResult.overallScore,
        };

        return candidate;
      })
    );

    return { candidates, usedFallback: false };
  } catch {
    return { candidates: fallbackCandidateList.filter((c) => !c.parentId), usedFallback: true };
  }
}

export async function runRewritePipeline(
  accountSpec: AccountSpec,
  materials: SourceMaterial[],
  candidate: Candidate,
  steeringInstruction: string
): Promise<{ candidate: Candidate; usedFallback: boolean }> {
  try {
    const rewriteMessages = buildRewritePrompt(accountSpec, candidate, steeringInstruction);
    const rewritten = await callLLMJSON<RawCandidate>(rewriteMessages);

    const [judgeResult, confidenceResult] = await Promise.all([
      judgeCandidate(accountSpec, rewritten),
      buildConfidenceMap(rewritten, materials),
    ]);

    const newCandidate: Candidate = {
      id: nanoid(),
      parentId: candidate.id,
      version: candidate.version + 1,
      title: rewritten.title,
      content: rewritten.content,
      format: rewritten.format,
      judges: judgeResult.judges,
      confidenceMap: confidenceResult.confidenceMap,
      recommendation: judgeResult.recommendation,
      overallScore: judgeResult.overallScore,
    };

    return { candidate: newCandidate, usedFallback: false };
  } catch {
    const fallbackRewrite = fallbackCandidateList.find((c) => c.parentId === candidate.id);
    if (fallbackRewrite) {
      return { candidate: fallbackRewrite, usedFallback: true };
    }

    const fallbackCandidate: Candidate = {
      id: nanoid(),
      parentId: candidate.id,
      version: candidate.version + 1,
      title: `${candidate.title} (Revised)`,
      content: candidate.content,
      format: candidate.format,
      judges: candidate.judges,
      confidenceMap: candidate.confidenceMap,
      recommendation: candidate.recommendation,
      overallScore: candidate.overallScore,
    };
    return { candidate: fallbackCandidate, usedFallback: true };
  }
}
