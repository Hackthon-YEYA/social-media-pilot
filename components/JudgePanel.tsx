"use client";

import type { JudgeResult, Recommendation } from "@/lib/schemas";

type Props = {
  judges: JudgeResult[];
  recommendation: Recommendation;
  overallScore: number;
};

function scoreBar(score: number) {
  const pct = (score / 10) * 100;
  const color =
    score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden flex-1">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function recommendationStyle(r: Recommendation) {
  if (r === "publish") return "bg-emerald-500 text-white";
  if (r === "revise") return "bg-amber-500 text-white";
  return "bg-red-500 text-white";
}

export function JudgePanel({ judges, recommendation, overallScore }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Content Thunderdome
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Overall</span>
          <span
            className={`text-base font-bold ${
              overallScore >= 8
                ? "text-emerald-400"
                : overallScore >= 6
                ? "text-amber-400"
                : "text-red-400"
            }`}
          >
            {overallScore.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {judges.map((j) => (
          <div key={j.judge} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-medium text-slate-300 flex-1">{j.judge}</span>
              <div className="flex items-center gap-2 w-28">
                {scoreBar(j.score)}
                <span
                  className={`text-xs font-bold w-6 text-right ${
                    j.score >= 8
                      ? "text-emerald-400"
                      : j.score >= 6
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {j.score}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{j.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3 border border-slate-700">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Recommendation
        </span>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${recommendationStyle(
            recommendation
          )}`}
        >
          {recommendation}
        </span>
      </div>
    </div>
  );
}
