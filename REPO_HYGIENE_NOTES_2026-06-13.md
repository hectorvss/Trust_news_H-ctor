# Repo Hygiene Notes - 2026-06-13

This document classifies local untracked files found during the SaaS audit. They were not removed because they may contain user work, generated review material, or recovery context from a previous agent.

## Keep For Review

- `.claude/`: local Claude/Codex workspace metadata.
- `.figma_audit/`: generated visual audit material.
- `old_story_detail.jsx`: likely recovery copy for the story detail UI.
- `src/mockData.js`: local/mock dataset that may still be useful for offline demos.

## Script Candidates

These look like one-off schema or seed scripts. They should either move under `scripts/` with clear names or be deleted after confirming they are obsolete.

- `check_schema.js`
- `final_seed.js`
- `list.js`
- `seed.js`

## Decision Needed

Before a cleanup commit, decide whether these files are:

1. product code that should be renamed and tracked,
2. local-only utilities that should be ignored,
3. obsolete scratch files that can be removed.

No destructive cleanup was performed in this audit.
