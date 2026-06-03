"use client";

import { Badge } from "@/components/ui/badge";
import type { Candidate, Recommendation } from "@/lib/schemas";

type Props = {
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (candidate: Candidate) => void;
};

function recommendationColor(r: Recommendation) {
  if (r === "publish") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (r === "revise") return "bg-amber-500/20 text-amber-300 border-amber-500/40";
  return "bg-red-500/20 text-red-300 border-red-500/40";
}

function scoreColor(score: number) {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  return "text-red-400";
}

export function CandidateList({ candidates, selectedId, onSelect }: Props) {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
        <span className="text-4xl">⚡</span>
        <p className="text-sm">Generate candidates to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Candidates ({candidates.length})
      </h2>
      {candidates.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className={`text-left rounded-lg border p-4 transition-all ${
            selectedId === c.id
              ? "border-blue-500 bg-blue-500/10"
              : "border-slate-700 bg-slate-800 hover:border-slate-600"
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-slate-100 leading-snug">{c.title}</span>
            <span className={`text-lg font-bold ${scoreColor(c.overallScore)} shrink-0`}>
              {c.overallScore.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{c.content}</p>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${recommendationColor(
                c.recommendation
              )}`}
            >
              {c.recommendation}
            </span>
            <span className="text-xs text-slate-500 capitalize">{c.format}</span>
            {c.version > 1 && (
              <span className="text-xs text-blue-400">v{c.version}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
