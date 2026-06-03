import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const checks = [
  {
    name: "migration exposes extraction quality fields",
    file: "supabase/migrations/025_editorial_engine_quality.sql",
    mustInclude: [
      "extraction_quality_score",
      "parser_used",
      "content_source",
      "paywall_detected",
      "blocked_reason",
      "event_signature",
      "entity_fingerprint",
      "source_quality_health",
    ],
  },
  {
    name: "shared extractor uses layered parsing and event fingerprints",
    file: "supabase/functions/_shared/pipeline.ts",
    mustInclude: [
      "findArticleJsonLd",
      "sourceRules",
      "chooseReadableScope",
      "scoreExtraction",
      "extractOutboundLinks",
      "entityFingerprintFromSignals",
      "eventSignatureFromArticle",
    ],
  },
  {
    name: "extract function persists full extraction contract",
    file: "supabase/functions/extract-article-content/index.ts",
    mustInclude: [
      "resolved_title",
      "outbound_links",
      "extraction_quality_score",
      "paywall_detected",
      "blocked_reason",
      "entity_fingerprint",
      "event_signature",
    ],
  },
  {
    name: "cluster function combines embedding, entities, events and time",
    file: "supabase/functions/cluster-articles/index.ts",
    mustInclude: [
      "fingerprintOverlap",
      "temporalAffinity",
      "eventAffinity",
      "sameEditorialEvent",
      "topic_keywords",
    ],
  },
  {
    name: "synthesis consumes extraction quality evidence",
    file: "supabase/functions/generate-synthesis/index.ts",
    mustInclude: [
      "extraction_quality_score",
      "paywall_detected",
      "blocked_reason",
      "event_signature",
      "entity_fingerprint",
      "generation_metadata",
      "editorial_validation",
      "claims_matrix",
      "evidence_pack_summary",
    ],
  },
  {
    name: "llm route builds compact evidence and validates tool output",
    file: "supabase/functions/_shared/llm.ts",
    mustInclude: [
      "buildEvidencePack",
      "compactArticleEvidence",
      "estimateEvidenceTokens",
      "submit_editorial_story_draft",
      "tool_choice",
      "repairTrustNewsDraft",
      "evidence_pack_hash",
    ],
  },
  {
    name: "manager surfaces extraction health",
    file: "src/components/manager/DraftReviewPanel.jsx",
    mustInclude: [
      "extractionQualityScore",
      "parserUsed",
      "paywallDetected",
      "blockedReason",
      "Trazabilidad editorial",
      "Cifras y claims",
      "Articulos usados vs omitidos",
    ],
  },
  {
    name: "manager dashboard exposes llm cost and blocked drafts",
    file: "src/components/manager/PipelineDashboard.jsx",
    mustInclude: [
      "Tokens LLM 24h",
      "Repairs LLM",
      "Bloqueos LLM",
    ],
  },
  {
    name: "ingest function reads active RSS sources",
    file: "supabase/functions/ingest-rss/index.ts",
    mustInclude: [
      ".from(\"sources\")",
      ".not(\"rss_url\", \"is\", null)",
      "parseRssFeed(source.rss_url",
      "articles_ingested",
      "error_count",
    ],
  },
];

const failures = [];
for (const check of checks) {
  const content = read(check.file);
  const missing = check.mustInclude.filter((needle) => !content.includes(needle));
  if (missing.length) {
    failures.push(`${check.name}: missing ${missing.join(", ")}`);
  }
}

const catalogSql = read("migrations/020_sources_catalog.sql");
const catalogRows = [...catalogSql.matchAll(/\('([^']+)',\s*\r?\n\s*'([^']+)',\s*\r?\n\s*(null|'[^']*'),\s*\r?\n\s*'([^']+)',\s*'([^']+)',\s*'([^']*)'\)/g)]
  .map((match) => ({
    name: match[1],
    url: match[2],
    rss: match[3] === "null" ? null : match[3].slice(1, -1),
    bias: match[4],
    factuality: match[5],
  }));
if (catalogRows.length < 30) {
  failures.push(`source catalog: expected >=30 versioned sources, found ${catalogRows.length}`);
}
if (catalogRows.filter((source) => source.rss).length < 30) {
  failures.push("source catalog: expected >=30 RSS-enabled sources");
}
for (const source of catalogRows) {
  if (!["izquierda", "centroizquierda", "centro", "centroderecha", "derecha"].includes(source.bias)) {
    failures.push(`source catalog: invalid bias for ${source.name}`);
  }
  if (!source.url.startsWith("https://")) {
    failures.push(`source catalog: non-https url for ${source.name}`);
  }
}

const fixtureChecks = [
  ["tests/fixtures/pipeline/article-with-article.html", ["<article", "application/ld+json", "1.200 millones de euros"]],
  ["tests/fixtures/pipeline/article-without-article.html", ["<main", "story-content", "85 millones de euros"]],
  ["tests/fixtures/pipeline/paywall.html", ["paywall", "Solo para suscriptores"]],
];
for (const [fixture, needles] of fixtureChecks) {
  if (!existsSync(join(root, fixture))) {
    failures.push(`fixture missing: ${fixture}`);
    continue;
  }
  const content = read(fixture);
  for (const needle of needles) {
    if (!content.includes(needle)) failures.push(`fixture ${fixture}: missing ${needle}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`pipeline contract ok (${checks.length} code checks, ${catalogRows.length} catalog sources, ${fixtureChecks.length} fixtures)`);
