import { NextRequest, NextResponse } from "next/server";
import { runRewritePipeline } from "@/lib/pipeline";
import type { RewriteRequest } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const body: RewriteRequest = await req.json();
  const { accountSpec, materials, candidate, steeringInstruction } = body;

  if (!accountSpec || !materials || materials.length === 0 || !candidate || !steeringInstruction) {
    return NextResponse.json({ error: "accountSpec, materials, candidate and steeringInstruction are required" }, { status: 400 });
  }

  const result = await runRewritePipeline(
    accountSpec,
    materials,
    candidate,
    steeringInstruction
  );

  return NextResponse.json(result);
}
