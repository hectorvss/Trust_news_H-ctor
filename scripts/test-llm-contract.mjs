import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");
const readJson = (path) => JSON.parse(read(path));

const requiredFields = [
  "title",
  "category",
  "summary",
  "full_content",
  "factuality",
  "consensus",
  "impact",
  "desglose",
  "contexto",
  "perspectivas_info",
  "consenso_narrativo",
  "blind_spot",
  "cifras_clave",
  "verificacion_info",
  "origen_info",
  "impacto_social",
  "impacto_sistemico",
  "documentos_info",
  "protagonistas_info",
  "preguntas_info",
  "analytical_snippet",
  "articles",
  "evidence_quality",
  "claims_matrix",
  "missing_evidence",
  "llm_confidence",
  "source_trace",
];

const evidenceArticleIds = new Set(["art-1", "art-2", "art-3", "art-4", "art-5"]);

const asArray = (value) => Array.isArray(value) ? value : [];
const asText = (value) => value == null ? "" : String(value);

const validateFixtureDraft = (payload) => {
  const errors = [];
  for (const field of requiredFields) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === "") errors.push(`missing ${field}`);
  }
  if (asText(payload.title).length < 12) errors.push("title too short");
  if (asText(payload.summary).length < 80) errors.push("summary too short");
  if (asText(payload.full_content).length < 300) errors.push("full_content too short");
  if (asText(payload.consenso_narrativo).split("|").length !== 3) errors.push("bad consenso_narrativo");
  if (!["ALTA", "MIXTA", "BAJA"].includes(payload.factuality)) errors.push("invalid factuality");
  if (!["ALTO", "MEDIO", "BAJO", "POLARIZADO"].includes(payload.consensus)) errors.push("invalid consensus");
  if (!["ALTO", "MEDIO", "BAJO"].includes(payload.impact)) errors.push("invalid impact");

  const validateRefs = (items, path) => {
    for (const [index, item] of asArray(items).entries()) {
      const articleId = item?.source_article_id || item?.article_id || item?.supporting_article_id || asArray(item?.supporting_article_ids)[0] || asArray(item?.supporting_articles)[0];
      if (!articleId) errors.push(`${path}[${index}] missing source_article_id`);
      else if (!evidenceArticleIds.has(articleId)) errors.push(`${path}[${index}] unknown article_id`);
      if (!item?.source) errors.push(`${path}[${index}] missing source`);
      if (!item?.url) errors.push(`${path}[${index}] missing url`);
      if (!item?.confidence) errors.push(`${path}[${index}] missing confidence`);
    }
  };

  validateRefs(payload.cifras_clave, "cifras_clave");
  validateRefs(payload.documentos_info, "documentos_info");
  validateRefs(payload.claims_matrix, "claims_matrix");
  for (const [index, article] of asArray(payload.articles).entries()) {
    if (!article?.article_id) errors.push(`articles[${index}] missing article_id`);
    else if (!evidenceArticleIds.has(article.article_id)) errors.push(`articles[${index}] unknown article_id`);
  }
  return errors;
};

const failures = [];

const llmSource = read("supabase/functions/_shared/llm.ts");
for (const needle of [
  "buildEvidencePack",
  "compactArticleEvidence",
  "estimateEvidenceTokens",
  "validateTrustNewsDraft",
  "repairTrustNewsDraft",
  "submit_editorial_story_draft",
  "tool_choice",
  "source_article_id",
  "evidence_pack_hash",
  "token_usage",
  "repair_used",
  "prompt_version",
]) {
  if (!llmSource.includes(needle)) failures.push(`llm helper missing ${needle}`);
}

const synthesisSource = read("supabase/functions/generate-synthesis/index.ts");
for (const needle of [
  "editorial_validation",
  "generation_metadata",
  "schema_failed",
  "analysis_failed",
  "claims_matrix",
  "source_trace",
  "evidence_pack_summary",
]) {
  if (!synthesisSource.includes(needle)) failures.push(`generate-synthesis missing ${needle}`);
}

const serviceSource = read("src/supabaseService.js");
for (const needle of [
  "llmTokens24h",
  "llmRepairs24h",
  "llmSchemaFailures24h",
  "llmBlockedDrafts24h",
  "weak_evidence_without_explanation",
  "unreferenced_figures",
  "fetchDraftReview",
  "generationMetadata",
  "editorialValidation",
]) {
  if (!serviceSource.includes(needle)) failures.push(`manager service missing ${needle}`);
}

const reviewPanelSource = read("src/components/manager/DraftReviewPanel.jsx");
for (const needle of [
  "Trazabilidad editorial",
  "Cifras y claims",
  "Articulos usados vs omitidos",
  "repair",
  "validationErrors",
  "missingEvidence",
]) {
  if (!reviewPanelSource.includes(needle)) failures.push(`DraftReviewPanel missing ${needle}`);
}

const queueSource = read("src/components/manager/ReviewQueue.jsx");
for (const needle of ["FALLO SCHEMA", "REPAIR APLICADO", "EVIDENCIA BAJA", "LISTA REVISION"]) {
  if (!queueSource.includes(needle)) failures.push(`ReviewQueue missing ${needle}`);
}

const valid = readJson("tests/fixtures/llm/trust-news-draft-valid.json");
const missing = readJson("tests/fixtures/llm/trust-news-draft-missing-field.json");
const unreferenced = readJson("tests/fixtures/llm/trust-news-draft-unreferenced-figure.json");
const invalidEnum = readJson("tests/fixtures/llm/trust-news-draft-invalid-enum.json");

if (validateFixtureDraft(valid).length) failures.push(`valid draft failed: ${validateFixtureDraft(valid).join(", ")}`);
if (!validateFixtureDraft(missing).some((error) => error.startsWith("missing "))) failures.push("missing-field fixture did not fail required fields");
if (!validateFixtureDraft(unreferenced).some((error) => error.includes("missing source_article_id"))) failures.push("unreferenced figure fixture did not fail references");
if (!validateFixtureDraft(invalidEnum).some((error) => error.includes("invalid factuality"))) failures.push("invalid enum fixture did not fail enum validation");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("llm contract ok (schema, evidence trace, manager traceability)");
