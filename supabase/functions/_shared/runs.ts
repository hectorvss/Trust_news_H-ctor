import { db } from "./supabase.ts";

type RunInput = {
  stage: string;
  source_id?: string | null;
  cluster_id?: string | null;
  story_id?: string | null;
  items_in?: number;
  metadata?: Record<string, unknown>;
};

export const startRun = async (input: RunInput) => {
  const { data } = await db
    .from("pipeline_runs")
    .insert({
      stage: input.stage,
      status: "running",
      source_id: input.source_id || null,
      cluster_id: input.cluster_id || null,
      story_id: input.story_id || null,
      items_in: input.items_in || 0,
      metadata: input.metadata || {},
      started_at: new Date().toISOString(),
    })
    .select("id")
    .maybeSingle();

  return data?.id || null;
};

export const finishRun = async (
  runId: string | null,
  status: "completed" | "failed",
  input: { items_in?: number; items_out?: number; error_message?: string; metadata?: Record<string, unknown> } = {},
) => {
  if (!runId) return;
  await db
    .from("pipeline_runs")
    .update({
      status,
      ...(input.items_in !== undefined ? { items_in: input.items_in } : {}),
      items_out: input.items_out || 0,
      error_message: input.error_message || null,
      metadata: input.metadata || {},
      finished_at: new Date().toISOString(),
    })
    .eq("id", runId);
};
