import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { runGeneratePipeline, runRewritePipeline } from "../lib/pipeline";
import type { AccountSpec, SourceMaterial, Candidate } from "../lib/schemas";

type Persona = {
  slug: string;
  accountSpec: AccountSpec;
  materials: SourceMaterial[];
  steeringInstruction: string;
};

const personas: Persona[] = [
  {
    slug: "ai-tool-reviewer",
    accountSpec: {
      name: "AI Tool Reviewer for Solo Builders",
      vertical: "AI tools for solo builders",
      audience: "indie hackers, solo founders, AI tool users",
      platform: "x",
      commercialGoal: "Attract AI SaaS sponsorships and affiliate opportunities",
      tone: "direct, practical, honest",
      contentPillars: ["AI tool reviews", "solo builder productivity", "AI workflow tips", "tool comparisons"],
    },
    materials: [
      {
        id: "m1",
        title: "Cursor AI Editor",
        content:
          "Cursor is an AI-first code editor built on VS Code. It features tab completion, a chat interface for code generation, and the ability to edit multiple files at once. Pricing starts at $20/month for Pro. Many solo builders report it significantly speeds up development, particularly for boilerplate and refactoring tasks.",
      },
      {
        id: "m2",
        title: "Claude Code",
        content:
          "Claude Code is Anthropic's agentic coding tool that runs in the terminal. It can read, write, and execute code autonomously. It's included with Claude Pro at $20/month. It excels at large-scale refactors and understanding complex codebases. Some users report it can make unexpected changes if instructions are ambiguous.",
      },
      {
        id: "m3",
        title: "Perplexity AI",
        content:
          "Perplexity is an AI-powered search engine that cites sources in real time. Pro costs $20/month. It's particularly useful for research-heavy tasks like competitive analysis and market research. Solo builders use it to quickly validate ideas without drowning in browser tabs.",
      },
    ],
    steeringInstruction: "更强调个人使用体验，少一些功能罗列，让读者感觉是一个真实用户在分享",
  },
  {
    slug: "marathon-runner",
    accountSpec: {
      name: "跑者装备站",
      vertical: "马拉松跑步装备评测与训练",
      audience: "马拉松爱好者、长跑入门者、跑步装备发烧友",
      platform: "x",
      commercialGoal: "推广马拉松装备品牌合作与电商导购",
      tone: "热情、专业、接地气",
      contentPillars: ["跑鞋评测", "马拉松训练计划", "跑步装备推荐", "赛事分享"],
    },
    materials: [
      {
        id: "m1",
        title: "Nike Vaporfly 3",
        content:
          "Nike Vaporfly 3 是一款顶级碳板竞速跑鞋，采用 ZoomX 泡棉中底搭配全掌碳纤维板，回弹率超过 85%。重量约 198g（男款 US9），适合全马 sub-3:30 以内的跑者。售价 ¥1,899。多位精英跑者在 2024 年柏林马拉松中穿着此鞋创造 PB。但也有跑者反馈鞋面包裹性一般，宽脚跑者建议加半码。",
      },
      {
        id: "m2",
        title: "SIS GO Isotonic 能量胶",
        content:
          "SIS GO Isotonic 能量胶是一款等渗配方能量胶，无需额外饮水即可直接吞服。每支含 22g 碳水化合物和电解质。推荐在马拉松比赛中每 30-45 分钟补充一支。口味包括柠檬青柠、热带水果等。价格约 ¥12/支。许多跑者反馈它不会引起胃部不适，是长距离跑步的首选补给之一。",
      },
      {
        id: "m3",
        title: "Garmin Forerunner 265",
        content:
          "Garmin Forerunner 265 是一款面向进阶跑者的 GPS 运动手表。搭载 AMOLED 屏幕，支持多卫星定位（GPS + GLONASS + Galileo），定位精度在城市环境下误差小于 3 米。续航约 13 天（智能模式）或 20 小时（GPS 模式）。支持训练状态评估、HRV、跑步动态等功能。售价 ¥3,280。不少跑者评价它是「不买 Fenix 系列的最佳选择」。",
      },
    ],
    steeringInstruction: "加入赛前一周的具体训练和装备准备建议，让读者觉得可以直接照做",
  },
  {
    slug: "beginner-investor",
    accountSpec: {
      name: "小白理财笔记",
      vertical: "基金定投与指数基金入门",
      audience: "投资小白、刚工作的年轻人、想开始理财的上班族",
      platform: "x",
      commercialGoal: "吸引基金平台和理财 App 的广告合作",
      tone: "轻松活泼、通俗易懂、不说教",
      contentPillars: ["指数基金入门", "基金定投实操", "理财心态", "新手避坑"],
    },
    materials: [
      {
        id: "m1",
        title: "沪深300指数基金",
        content:
          "沪深300指数基金追踪 A 股市值最大的 300 家公司，覆盖约 60% 的 A 股总市值。过去 10 年年化收益约 7-9%（含分红再投资）。管理费通常在 0.15%-0.5% 之间。适合不想花时间选股的投资者。定投沪深300被称为「懒人投资法」，核心逻辑是通过定期定额买入来平摊成本、降低择时风险。",
      },
      {
        id: "m2",
        title: "基金定投策略",
        content:
          "基金定投是指定期（如每周或每月）以固定金额购买同一只基金的投资方式。优点是纪律性强、不需要择时。定投最重要的是坚持，建议至少坚持 3 年以上才能看到效果。常见误区：亏损就停止定投（其实下跌时买入更多份额反而有利）、频繁更换基金、定投金额超出承受范围。建议用每月收入的 10%-20% 来定投。",
      },
      {
        id: "m3",
        title: "货币基金与余额宝",
        content:
          "货币基金是风险最低的基金类型，年化收益通常在 1.5%-2.5% 之间。余额宝本质是天弘基金的货币基金。适合存放紧急备用金（建议 3-6 个月生活费）。货币基金的优点是随时可赎回、几乎不会亏损。但长期来看，货币基金收益难以跑赢通胀，不适合作为主要的长期投资工具。",
      },
    ],
    steeringInstruction: "语气更轻松活泼，多用比喻和生活化的例子，适合 95 后年轻人阅读",
  },
];

type StoryResult = {
  persona: string;
  slug: string;
  accountSpec: AccountSpec;
  materials: SourceMaterial[];
  steeringInstruction: string;
  candidates: Candidate[];
  rewriteCandidate: Candidate | null;
  usedFallback: { generate: boolean; rewrite: boolean };
};

async function runPersona(persona: Persona): Promise<StoryResult> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  Persona: ${persona.accountSpec.name}`);
  console.log(`${"=".repeat(60)}`);

  console.log("  [1/2] Generating candidates...");
  const generateResult = await runGeneratePipeline(persona.accountSpec, persona.materials);
  console.log(`  Generated ${generateResult.candidates.length} candidates (fallback: ${generateResult.usedFallback})`);

  for (const c of generateResult.candidates) {
    const unsupported = c.confidenceMap.filter((ci) => ci.level === "unsupported").length;
    console.log(`    - "${c.title}" | score: ${c.overallScore} | ${c.recommendation} | unsupported: ${unsupported}`);
  }

  let rewriteCandidate: Candidate | null = null;
  let rewriteFallback = false;

  if (generateResult.candidates.length > 0) {
    const target = generateResult.candidates[0];
    console.log(`  [2/2] Rewriting "${target.title}" with steering: "${persona.steeringInstruction}"`);
    const rewriteResult = await runRewritePipeline(
      persona.accountSpec,
      persona.materials,
      target,
      persona.steeringInstruction
    );
    rewriteCandidate = rewriteResult.candidate;
    rewriteFallback = rewriteResult.usedFallback;

    const unsupported = rewriteCandidate.confidenceMap.filter((ci) => ci.level === "unsupported").length;
    console.log(
      `    Rewritten: "${rewriteCandidate.title}" | score: ${rewriteCandidate.overallScore} | ${rewriteCandidate.recommendation} | unsupported: ${unsupported}`
    );
  }

  return {
    persona: persona.accountSpec.name,
    slug: persona.slug,
    accountSpec: persona.accountSpec,
    materials: persona.materials,
    steeringInstruction: persona.steeringInstruction,
    candidates: generateResult.candidates,
    rewriteCandidate,
    usedFallback: { generate: generateResult.usedFallback, rewrite: rewriteFallback },
  };
}

function printSummary(results: StoryResult[]) {
  console.log(`\n${"=".repeat(80)}`);
  console.log("  STORYBOOK SUMMARY");
  console.log(`${"=".repeat(80)}\n`);

  for (const r of results) {
    console.log(`Persona: ${r.persona}`);
    console.log(`  Fallback used: generate=${r.usedFallback.generate}, rewrite=${r.usedFallback.rewrite}`);
    console.log("  Candidates:");
    for (const c of r.candidates) {
      const unsupported = c.confidenceMap.filter((ci) => ci.level === "unsupported").length;
      const grounded = c.confidenceMap.filter((ci) => ci.level === "grounded").length;
      console.log(
        `    [${c.recommendation.toUpperCase().padEnd(7)}] ${c.overallScore.toFixed(1)} | "${c.title}" | grounded: ${grounded}, unsupported: ${unsupported}`
      );
    }
    if (r.rewriteCandidate) {
      const rc = r.rewriteCandidate;
      const unsupported = rc.confidenceMap.filter((ci) => ci.level === "unsupported").length;
      const grounded = rc.confidenceMap.filter((ci) => ci.level === "grounded").length;
      console.log(
        `  Rewrite: [${rc.recommendation.toUpperCase().padEnd(7)}] ${rc.overallScore.toFixed(1)} | "${rc.title}" | grounded: ${grounded}, unsupported: ${unsupported}`
      );
    }
    console.log();
  }
}

async function main() {
  const outDir = path.join(__dirname, "storybook-results");
  fs.mkdirSync(outDir, { recursive: true });

  const results: StoryResult[] = [];

  for (const persona of personas) {
    const result = await runPersona(persona);
    results.push(result);

    const outFile = path.join(outDir, `${persona.slug}.json`);
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2), "utf-8");
    console.log(`  Saved: ${outFile}`);
  }

  printSummary(results);
  console.log(`\nResults saved to: ${outDir}`);
}

main().catch((err) => {
  console.error("Storybook failed:", err);
  process.exit(1);
});
