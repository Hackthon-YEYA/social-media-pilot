# Social Media Pilot

> LLM-as-a-Judge for Vertical Content Operations

## 🔗 [social-media-pilot.15010972518.workers.dev](https://social-media-pilot.15010972518.workers.dev/)

**AI made content cheap. It did not make content trustworthy.**

Social Media Pilot turns a vertical account spec and raw materials into social content candidates, then judges each candidate across Persona, Vertical Fit, Platform, Commercial, and Responsible AI dimensions — before a human operator decides to publish, revise, or reject.

## Problem

Most AI tools solve generation. We solve judgment.

As generation becomes commoditized, the bottleneck shifts to deciding which artifacts are on-brand, audience-fit, grounded in facts, and safe to publish. Social Media Pilot is an LLM-as-a-Judge content operations pipeline for that job.

## Solution

```
Account Spec + Source Materials
  ↓
Generate Candidate Posts
  ↓
Content Thunderdome (5 LLM Judges)
  ↓
Confidence Map (Grounded / Inferred / Unsupported)
  ↓
Operator Steering → Rewrite
  ↓
Publish / Revise / Reject
```

## Why LLM-as-a-Judge

Generation is easy. Evaluation is hard. We use separate judge prompts for each quality dimension so the operator can see exactly why a post scores low — and steer it precisely, rather than regenerating blindly.

## Tech Stack

- **Frontend / Backend**: Next.js 16 + TypeScript (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **LLM**: DeepSeek V4 Pro via Cloudflare AI Gateway
- **Deployment**: Cloudflare Workers
- **Storage**: In-memory + JSON fallback data

## How to Run Locally

1. Install dependencies:

```bash
npm install
```

2. Set up your environment in `.env`:

```
CF_AIG_TOKEN=your_cloudflare_ai_gateway_token
LLM_MODEL=deepseek/deepseek-v4-pro
```

3. Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **No token?** The app automatically falls back to pre-built demo data so you can explore the full UI and demo flow without any LLM calls.

## Demo Flow

1. Review the default **Account Spec** (AI Tool Reviewer for Solo Builders) and **Source Materials** (Cursor, Claude Code, Perplexity)
2. Click **Generate Candidates** — produces 3 candidate posts
3. Click a candidate to open the **Content Thunderdome** — 5 judge scores with explanations
4. Review the **Confidence Map** — see which claims are Grounded, Inferred, or Unsupported
5. Enter a **Steering Instruction** (e.g. "Remove the unsupported productivity claims") and click **Rewrite**
6. The rewritten v2 candidate is re-judged automatically

## Responsible AI

- Every claim in a generated post is classified as **Grounded**, **Inferred**, or **Unsupported**
- Unsupported claims are flagged visually and affect the Responsible AI Judge score
- The operator always makes the final publish decision — no auto-posting

## Project Structure

```
app/
  page.tsx               # Main 3-column UI
  api/
    generate/route.ts    # POST /api/generate
    rewrite/route.ts     # POST /api/rewrite

components/
  AccountSpecForm.tsx
  CandidateList.tsx
  CandidateDetail.tsx
  JudgePanel.tsx
  ConfidenceMap.tsx
  SteeringBox.tsx

lib/
  llm.ts                 # OpenAI SDK adapter via Cloudflare AI Gateway
  prompts.ts             # Prompt builder functions
  schemas.ts             # TypeScript types
  demo-data.ts           # Default spec and fallback data
  pipeline.ts            # Generate and rewrite pipelines

data/
  fallback-input.json       # Default account spec + materials
  fallback-candidates.json  # Pre-built candidates with judge scores
```
