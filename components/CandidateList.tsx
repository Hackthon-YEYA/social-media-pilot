"use client";

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

/** Build version chains: each entry is [root, v2, v3, …] */
function buildGroups(candidates: Candidate[]): Candidate[][] {
  const byId = new Map(candidates.map((c) => [c.id, c]));
  // Roots are candidates whose parentId is absent or not in the list
  const roots = candidates.filter((c) => !c.parentId || !byId.has(c.parentId));

  return roots.map((root) => {
    const chain: Candidate[] = [root];
    let current = root;
    // Follow the chain: find the candidate whose parentId === current.id
    while (true) {
      const child = candidates.find((c) => c.parentId === current.id);
      if (!child) break;
      chain.push(child);
      current = child;
    }
    return chain;
  });
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

  const groups = buildGroups(candidates);
  // Count original (root) candidates only
  const rootCount = groups.length;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider shrink-0">
        Candidates ({rootCount})
      </h2>

      {groups.map((chain, groupIndex) => {
        const root = chain[0];
        const latest = chain[chain.length - 1];
        const hasRewrites = chain.length > 1;

        return (
          <div key={root.id} className="flex flex-col gap-1.5">
            {/* Label */}
            <span className="text-xs text-slate-600 font-medium uppercase tracking-wider px-0.5">
              {String.fromCharCode(65 + groupIndex)}
            </span>

            {/* Version chain */}
            {chain.map((c, vIdx) => {
              const isLatest = vIdx === chain.length - 1;
              const isSelected = selectedId === c.id;

              return (
                <button
                  key={c.id}
                  onClick={() => onSelect(c)}
                  className={`text-left rounded-lg border transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  } ${vIdx > 0 ? "ml-3 p-3" : "p-4"}`}
                >
                  {/* Connector line for rewrites */}
                  {vIdx > 0 && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-xs text-blue-400 font-medium">↳ v{c.version}</span>
                      {isLatest && (
                        <span className="text-xs text-slate-600">latest</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`font-medium leading-snug ${
                        vIdx === 0 ? "text-sm text-slate-100" : "text-xs text-slate-200"
                      }`}
                    >
                      {c.title}
                    </span>
                    <span className={`font-bold shrink-0 ${vIdx === 0 ? "text-lg" : "text-sm"} ${scoreColor(c.overallScore)}`}>
                      {c.overallScore.toFixed(1)}
                    </span>
                  </div>

                  {vIdx === 0 && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{c.content}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${recommendationColor(
                        c.recommendation
                      )}`}
                    >
                      {c.recommendation}
                    </span>
                    {vIdx === 0 && (
                      <span className="text-xs text-slate-500 capitalize">{c.format}</span>
                    )}
                  </div>
                </button>
              );
            })}

            {/* Rewrite count hint for un-expanded root when no rewrites exist */}
            {!hasRewrites && (
              <p className="text-xs text-slate-600 px-1">No rewrites yet</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
