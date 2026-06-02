// Trust News — Ingestion Worker Entry Point
// Run with: node worker/index.js
//
// Loads active sources from Supabase, runs ingestion cycles on a fixed interval.
// One source failure never crashes the worker.

import 'dotenv/config';
import { supabaseAdmin } from './supabaseAdmin.js';
import { runIngestionCycle } from './scheduler.js';

// Interval between full ingestion cycles (default: 15 minutes)
const WORKER_INTERVAL_MS = parseInt(process.env.WORKER_INTERVAL_MS || '', 10) || 15 * 60 * 1000;

function log(msg) {
  const t = new Date().toTimeString().slice(0, 8);
  console.log(`[${t}] [worker] ${msg}`);
}

// Fetch all active sources that have an RSS URL
async function loadActiveSources() {
  const { data, error } = await supabaseAdmin
    .from('sources')
    .select('id, nombre, url, rss_url, bias, factuality')
    .eq('activo', true)
    .not('rss_url', 'is', null);

  if (error) {
    log(`ERROR loading sources: ${error.message}`);
    return [];
  }

  return data || [];
}

// Execute one full ingestion cycle
export async function runIngestionCycleMain() {
  const cycleStart = Date.now();
  log('─── Ingestion cycle starting ───');

  let sources = [];
  try {
    sources = await loadActiveSources();
    log(`Loaded ${sources.length} active sources with RSS`);
  } catch (err) {
    log(`FATAL: Could not load sources: ${err.message}`);
    return;
  }

  if (sources.length === 0) {
    log('No active sources found. Cycle skipped.');
    return;
  }

  try {
    const report = await runIngestionCycle(sources, supabaseAdmin);
    const elapsed = ((Date.now() - cycleStart) / 1000).toFixed(1);
    log(
      `─── Cycle complete in ${elapsed}s | ` +
      `Sources: ${report.sourcesProcessed} | ` +
      `Found: ${report.articlesFound} | ` +
      `New: ${report.articlesNew} | ` +
      `Errors: ${report.errors.length} ───`
    );
    if (report.errors.length > 0) {
      for (const e of report.errors) {
        log(`  Error: ${e.error}${e.sourceId ? ` (source: ${e.sourceId})` : ''}`);
      }
    }
  } catch (err) {
    log(`FATAL: Unhandled error in ingestion cycle: ${err.message}`);
    console.error(err);
  }
}

// Main loop
async function main() {
  log(`Trust News ingestion worker starting (interval: ${WORKER_INTERVAL_MS / 1000}s)`);

  // Run immediately on startup
  await runIngestionCycleMain();

  // Then repeat on interval
  setInterval(async () => {
    await runIngestionCycleMain();
  }, WORKER_INTERVAL_MS);

  // Keep process alive
  process.on('SIGINT', () => {
    log('Received SIGINT — shutting down gracefully.');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('Received SIGTERM — shutting down gracefully.');
    process.exit(0);
  });

  process.on('uncaughtException', err => {
    log(`UNCAUGHT EXCEPTION: ${err.message}`);
    console.error(err);
    // Do not exit — keep the worker running
  });

  process.on('unhandledRejection', (reason) => {
    log(`UNHANDLED REJECTION: ${reason}`);
    // Do not exit — keep the worker running
  });
}

main();
