import { NextRequest, NextResponse } from "next/server";
import { runRewritePipeline } from "@/lib/pipeline";
import { defaultAccountSpec, defaultMaterials } from "@/lib/demo-data";
import type { RewriteRequest } from "@/lib/schemas";

export async function POST(req: NextRequest) {
  const body: RewriteRequest = await req.json();
  const { candidate, steeringInstruction } = body;

  if (!candidate || !steeringInstruction) {
    return NextResponse.json({ error: "candidate and steeringInstruction are required" }, { status: 400 });
  }

  const result = await runRewritePipeline(
    defaultAccountSpec,
    defaultMaterials,
    candidate,
    steeringInstruction
  );

  return NextResponse.json(result);
}
