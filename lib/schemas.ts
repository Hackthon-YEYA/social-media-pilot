export type AccountSpec = {
  name: string;
  vertical: string;
  audience: string;
  platform: "x";
  commercialGoal: string;
  tone: string;
  contentPillars: string[];
};

export type SourceMaterial = {
  id: string;
  title: string;
  content: string;
};

export type ConfidenceLevel = "grounded" | "inferred" | "unsupported";

export type ConfidenceItem = {
  claim: string;
  level: ConfidenceLevel;
  reason: string;
};

export type JudgeResult = {
  judge: string;
  score: number;
  comment: string;
};

export type Recommendation = "publish" | "revise" | "reject";

export type Candidate = {
  id: string;
  parentId?: string;
  version: number;
  title: string;
  content: string;
  format: string;
  judges: JudgeResult[];
  confidenceMap: ConfidenceItem[];
  recommendation: Recommendation;
  overallScore: number;
};

export type GenerateRequest = {
  accountSpec: AccountSpec;
  materials: SourceMaterial[];
  operatorGoal?: string;
};

export type GenerateResponse = {
  candidates: Candidate[];
  usedFallback?: boolean;
};

export type RewriteRequest = {
  accountSpec: AccountSpec;
  materials: SourceMaterial[];
  candidate: Candidate;
  steeringInstruction: string;
};

export type RewriteResponse = {
  candidate: Candidate;
  usedFallback?: boolean;
};
