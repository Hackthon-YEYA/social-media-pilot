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

export function SteeringBox({ candidate, onRewrite, isLoading }: Props) {
  const [instruction, setInstruction] = useState("");

  function handleRewrite() {
    if (!instruction.trim()) return;
    onRewrite(instruction.trim());
    setInstruction("");
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
      <Textarea
        className="bg-slate-800 border-slate-700 text-slate-100 text-sm resize-none"
        rows={3}
        placeholder='e.g. "Make it sound more like a real solo builder experience" or "Remove the unsupported claims"'
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
