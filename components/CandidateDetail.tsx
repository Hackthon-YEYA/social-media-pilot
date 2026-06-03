"use client";

import { Separator } from "@/components/ui/separator";
import { JudgePanel } from "@/components/JudgePanel";
import { ConfidenceMap } from "@/components/ConfidenceMap";
import { SteeringBox } from "@/components/SteeringBox";
import type { Candidate } from "@/lib/schemas";

type Props = {
  candidate: Candidate;
  onRewrite: (instruction: string) => void;
  isRewriting: boolean;
};

export function CandidateDetail({ candidate, onRewrite, isRewriting }: Props) {
  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-base font-semibold text-slate-100">{candidate.title}</h2>
          {candidate.version > 1 && (
            <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded px-2 py-0.5">
              v{candidate.version}
            </span>
          )}
        </div>
        <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-800 rounded-lg p-4 border border-slate-700">
          {candidate.content}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-slate-500 capitalize">{candidate.format}</span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-500">{candidate.content.length} chars</span>
        </div>
      </div>

      <Separator className="bg-slate-700" />

      <JudgePanel
        judges={candidate.judges}
        recommendation={candidate.recommendation}
        overallScore={candidate.overallScore}
      />

      <Separator className="bg-slate-700" />

      <ConfidenceMap items={candidate.confidenceMap} />

      <Separator className="bg-slate-700" />

      <SteeringBox candidate={candidate} onRewrite={onRewrite} isLoading={isRewriting} />
    </div>
  );
}
