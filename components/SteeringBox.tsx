"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Candidate } from "@/lib/schemas";

type Props = {
  candidate: Candidate;
  onRewrite: (instruction: string) => void;
  isLoading: boolean;
};

const JUDGE_SUGGESTIONS: Record<string, string> = {
  "Persona Judge": "Make the voice sound more authentic and personal",
  "Vertical Fit Judge": "Strengthen the focus on AI tools for solo builders",
  "Platform Judge": "Sharpen the hook and optimize the format for X/Twitter",
  "Commercial Judge": "Add a subtle commercial hook that attracts AI SaaS sponsors",
  "Responsible AI Judge": "Remove or ground all unsupported claims",
  "Anti-AI Judge": "Remove transition words, cut the conclusion, replace complex vocabulary with plain language",
};

const GENERIC_SUGGESTIONS = [
  "Make it sound more like a real solo builder experience",
  "Reduce the tool-list feel — add a narrative arc",
  "Add one concrete, specific use case",
  "Cut it down — make every word earn its place",
];

/** Derive up to 4 contextual suggestions from the candidate's judges + confidence map */
function buildSuggestions(candidate: Candidate): string[] {
  const suggestions: string[] = [];

  // 1. Unsupported claims → highest priority fix
  const unsupportedClaims = candidate.confidenceMap.filter((c) => c.level === "unsupported");
  if (unsupportedClaims.length > 0) {
    const example = unsupportedClaims[0].claim;
    const truncated = example.length > 50 ? example.slice(0, 50) + "…" : example;
    suggestions.push(`Remove the unsupported claim: "${truncated}"`);
  }

  // 2. Inferred claims → suggest grounding
  const inferredClaims = candidate.confidenceMap.filter((c) => c.level === "inferred");
  if (inferredClaims.length > 1 && suggestions.length < 3) {
    suggestions.push("Replace inferred claims with specific, grounded examples from the source material");
  }

  // 3. Lowest-scoring judge (score < 8) → targeted fix
  const sortedJudges = [...candidate.judges].sort((a, b) => a.score - b.score);
  for (const judge of sortedJudges) {
    if (judge.score < 8 && suggestions.length < 3) {
      const suggestion = JUDGE_SUGGESTIONS[judge.judge];
      if (suggestion && !suggestions.includes(suggestion)) {
        suggestions.push(suggestion);
      }
    }
  }

  // 4. Fill remaining slots with generic suggestions not already present
  for (const generic of GENERIC_SUGGESTIONS) {
    if (suggestions.length >= 4) break;
    if (!suggestions.includes(generic)) {
      suggestions.push(generic);
    }
  }

  return suggestions.slice(0, 4);
}

export function SteeringBox({ candidate, onRewrite, isLoading }: Props) {
  const [instruction, setInstruction] = useState("");
  const suggestions = buildSuggestions(candidate);

  function handleRewrite() {
    if (!instruction.trim()) return;
    onRewrite(instruction.trim());
    setInstruction("");
  }

  function handleChip(text: string) {
    setInstruction(text);
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Operator Steering
      </h3>
      {candidate.parentId && (
        <div className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded px-3 py-2">
          This is Version {candidate.version} — rewritten from an earlier version
        </div>
      )}

      {/* Suggestion chips */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs text-slate-500">Suggested fixes based on judge feedback:</p>
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleChip(s)}
              disabled={isLoading}
              className={`text-left text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                instruction === s
                  ? "border-violet-500 bg-violet-500/20 text-violet-200"
                  : "border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Textarea
        className="bg-slate-800 border-slate-700 text-slate-100 text-sm resize-none"
        rows={3}
        placeholder="Or type a custom instruction…"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
      />
      <Button
        onClick={handleRewrite}
        disabled={isLoading || !instruction.trim()}
        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold"
      >
        {isLoading ? "Rewriting..." : "Rewrite with Steering"}
      </Button>
    </div>
  );
}
