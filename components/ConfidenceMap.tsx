"use client";

import type { ConfidenceItem, ConfidenceLevel } from "@/lib/schemas";

type Props = {
  items: ConfidenceItem[];
};

function levelStyle(level: ConfidenceLevel) {
  if (level === "grounded") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (level === "inferred") return "bg-amber-500/20 text-amber-300 border-amber-500/40";
  return "bg-red-500/20 text-red-300 border-red-500/40";
}

function levelLabel(level: ConfidenceLevel) {
  if (level === "grounded") return "Grounded";
  if (level === "inferred") return "Inferred";
  return "Unsupported";
}

export function ConfidenceMap({ items }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Confidence Map
      </h3>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-lg p-3 border border-slate-700"
          >
            <div className="flex items-start gap-2 mb-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${levelStyle(
                  item.level
                )}`}
              >
                {levelLabel(item.level)}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium mb-1 leading-snug">
              &ldquo;{item.claim}&rdquo;
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">{item.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
