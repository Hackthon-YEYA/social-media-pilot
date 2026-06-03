import type { AccountSpec, SourceMaterial, Candidate } from "./schemas";
import fallbackInput from "../data/fallback-input.json";
import fallbackCandidates from "../data/fallback-candidates.json";

export const defaultAccountSpec: AccountSpec = fallbackInput.accountSpec as AccountSpec;

export const defaultMaterials: SourceMaterial[] = fallbackInput.materials as SourceMaterial[];

export const fallbackCandidateList: Candidate[] = fallbackCandidates as Candidate[];
