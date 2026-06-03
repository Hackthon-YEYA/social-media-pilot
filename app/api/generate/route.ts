import { NextRequest, NextResponse } from "next/server";
import { runGeneratePipeline } from "@/lib/pipeline";
import type { GenerateRequest } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const body: GenerateRequest = await req.json();
  const { accountSpec, materials } = body;

  if (!accountSpec || !materials || materials.length === 0) {
    return NextResponse.json({ error: "accountSpec and materials are required" }, { status: 400 });
  }

  const result = await runGeneratePipeline(accountSpec, materials);
  return NextResponse.json(result);
}
