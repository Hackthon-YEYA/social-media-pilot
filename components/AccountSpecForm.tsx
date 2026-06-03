"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { AccountSpec, SourceMaterial } from "@/lib/schemas";

type Props = {
  accountSpec: AccountSpec;
  materials: SourceMaterial[];
  onAccountSpecChange: (spec: AccountSpec) => void;
  onMaterialsChange: (materials: SourceMaterial[]) => void;
  onGenerate: () => void;
  isLoading: boolean;
};

export function AccountSpecForm({
  accountSpec,
  materials,
  onAccountSpecChange,
  onMaterialsChange,
  onGenerate,
  isLoading,
}: Props) {
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialContent, setNewMaterialContent] = useState("");

  function updateSpec(field: keyof AccountSpec, value: string | string[]) {
    onAccountSpecChange({ ...accountSpec, [field]: value });
  }

  function updateMaterial(id: string, field: keyof SourceMaterial, value: string) {
    onMaterialsChange(
      materials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }

  function removeMaterial(id: string) {
    onMaterialsChange(materials.filter((m) => m.id !== id));
  }

  function addMaterial() {
    if (!newMaterialTitle.trim() || !newMaterialContent.trim()) return;
    const newMaterial: SourceMaterial = {
      id: `m${Date.now()}`,
      title: newMaterialTitle.trim(),
      content: newMaterialContent.trim(),
    };
    onMaterialsChange([...materials, newMaterial]);
    setNewMaterialTitle("");
    setNewMaterialContent("");
  }

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto">
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Account Spec
        </h2>
        <div className="flex flex-col gap-3">
          <div>
            <Label className="text-xs text-slate-300">Account Name</Label>
            <Input
              className="mt-1 bg-slate-800 border-slate-700 text-slate-100 text-sm"
              value={accountSpec.name}
              onChange={(e) => updateSpec("name", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-300">Vertical</Label>
            <Input
              className="mt-1 bg-slate-800 border-slate-700 text-slate-100 text-sm"
              value={accountSpec.vertical}
              onChange={(e) => updateSpec("vertical", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-300">Audience</Label>
            <Input
              className="mt-1 bg-slate-800 border-slate-700 text-slate-100 text-sm"
              value={accountSpec.audience}
              onChange={(e) => updateSpec("audience", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-300">Commercial Goal</Label>
            <Input
              className="mt-1 bg-slate-800 border-slate-700 text-slate-100 text-sm"
              value={accountSpec.commercialGoal}
              onChange={(e) => updateSpec("commercialGoal", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-300">Tone</Label>
            <Input
              className="mt-1 bg-slate-800 border-slate-700 text-slate-100 text-sm"
              value={accountSpec.tone}
              onChange={(e) => updateSpec("tone", e.target.value)}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-300">Content Pillars (comma-separated)</Label>
            <Input
              className="mt-1 bg-slate-800 border-slate-700 text-slate-100 text-sm"
              value={accountSpec.contentPillars.join(", ")}
              onChange={(e) =>
                updateSpec(
                  "contentPillars",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Source Materials
        </h2>
        <div className="flex flex-col gap-3">
          {materials.map((m) => (
            <div key={m.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <Input
                  className="bg-slate-700 border-slate-600 text-slate-100 text-sm font-medium flex-1 mr-2"
                  value={m.title}
                  onChange={(e) => updateMaterial(m.id, "title", e.target.value)}
                />
                <button
                  onClick={() => removeMaterial(m.id)}
                  className="text-slate-500 hover:text-red-400 text-xs"
                >
                  ✕
                </button>
              </div>
              <Textarea
                className="bg-slate-700 border-slate-600 text-slate-300 text-xs resize-none"
                rows={3}
                value={m.content}
                onChange={(e) => updateMaterial(m.id, "content", e.target.value)}
              />
            </div>
          ))}

          <div className="bg-slate-800/50 rounded-lg p-3 border border-dashed border-slate-700">
            <Input
              className="bg-slate-700 border-slate-600 text-slate-100 text-sm mb-2"
              placeholder="Material title..."
              value={newMaterialTitle}
              onChange={(e) => setNewMaterialTitle(e.target.value)}
            />
            <Textarea
              className="bg-slate-700 border-slate-600 text-slate-300 text-xs resize-none mb-2"
              rows={3}
              placeholder="Paste material content..."
              value={newMaterialContent}
              onChange={(e) => setNewMaterialContent(e.target.value)}
            />
            <button
              onClick={addMaterial}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              + Add material
            </button>
          </div>
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold mt-2"
      >
        {isLoading ? "Generating..." : "Generate Candidates"}
      </Button>
    </div>
  );
}
