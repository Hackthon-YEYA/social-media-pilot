"use client";

import { useState } from "react";
import { AccountSpecForm } from "@/components/AccountSpecForm";
import { CandidateList } from "@/components/CandidateList";
import { CandidateDetail } from "@/components/CandidateDetail";
import { defaultAccountSpec, defaultMaterials } from "@/lib/demo-data";
import type { AccountSpec, Candidate, SourceMaterial } from "@/lib/schemas";

export default function Home() {
  const [accountSpec, setAccountSpec] = useState<AccountSpec>(defaultAccountSpec);
  const [materials, setMaterials] = useState<SourceMaterial[]>(defaultMaterials);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    setSelectedCandidate(null);
    setUsedFallback(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountSpec, materials }),
      });
      const data = await res.json();
      setCandidates(data.candidates);
      setUsedFallback(!!data.usedFallback);
      if (data.candidates.length > 0) {
        setSelectedCandidate(data.candidates[0]);
      }
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRewrite(instruction: string) {
    if (!selectedCandidate) return;
    setIsRewriting(true);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate: selectedCandidate, steeringInstruction: instruction }),
      });
      const data = await res.json();
      const newCandidate: Candidate = data.candidate;
      setCandidates((prev) => [...prev, newCandidate]);
      setSelectedCandidate(newCandidate);
      if (data.usedFallback) setUsedFallback(true);
    } finally {
      setIsRewriting(false);
    }
  }

  function handleSelectCandidate(c: Candidate) {
    setSelectedCandidate(c);
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      <header className="border-b border-slate-800 px-6 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Social Media Pilot
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              LLM-as-a-Judge · Content Operations Pipeline
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 italic">
              AI made content cheap. It did not make content trustworthy.
            </p>
          </div>
        </div>
        {usedFallback && (
          <div className="mt-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-1.5">
            LLM unavailable — showing fallback demo data
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="w-72 shrink-0 border-r border-slate-800 p-4 overflow-hidden flex flex-col">
          <AccountSpecForm
            accountSpec={accountSpec}
            materials={materials}
            onAccountSpecChange={setAccountSpec}
            onMaterialsChange={setMaterials}
            onGenerate={handleGenerate}
            isLoading={isGenerating}
          />
        </div>

        <div className="w-72 shrink-0 border-r border-slate-800 p-4 overflow-hidden flex flex-col">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Generating candidates...</p>
            </div>
          ) : (
            <CandidateList
              candidates={candidates}
              selectedId={selectedCandidate?.id ?? null}
              onSelect={handleSelectCandidate}
            />
          )}
        </div>

        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          {selectedCandidate ? (
            <CandidateDetail
              candidate={selectedCandidate}
              onRewrite={handleRewrite}
              isRewriting={isRewriting}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
              <div className="text-center">
                <p className="text-4xl mb-3">⚡</p>
                <p className="text-sm font-medium">Most tools generate content.</p>
                <p className="text-sm font-bold text-slate-300">We judge content.</p>
                <p className="text-xs text-slate-600 mt-3">
                  Select a candidate to see the Content Thunderdome
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
