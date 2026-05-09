---
name: operate-symphony
description: Inspect and lightly operate an already configured Symphony target. Use when the user asks for Symphony status, start, stop, reload, logs, dashboard, or readiness recheck after setup is complete.
---

# Operate Symphony

Use this skill only after `setup-symphony` has configured a target repository or when the workspace already contains a valid Symphony setup package.

Before running, read `docs/easy-symphony-orbit/symphony-rules.md`.

## Allowed Actions

- Show configured targets and setup workspace paths.
- Check whether a Symphony process or dashboard is running.
- Start Symphony for an existing generated `WORKFLOW.md`.
- Stop a Symphony process that belongs to this workspace.
- Reload by stopping and starting the configured instance, verifying the old process and port are gone before restart.
- Show recent logs.
- Rerun narrow readiness checks for Codex path/version, required env vars, tracker auth presence, and dashboard reachability.

## Boundaries

Do not redesign workflow policy, regenerate `WORKFLOW.md`, change tracker metadata, change active/terminal states, edit state prompts, install system dependencies, persist secrets, or do broad failure diagnosis.

If the requested action needs those changes, stop and tell the operator to run `setup-symphony` for that target.

## Workflow

1. Locate runtime discovery from `.runtime/easy-symphony.env`, `AGENTS.md`, `BOOTSTRAP.md`, or explicit user input.
2. Locate the target setup workspace, normally `.symphony-setups/<owner>_<repo>/`.
3. Verify the generated `WORKFLOW.md` exists before start/reload.
4. For start/reload, use the existing generated workflow as-is.
5. For stop/reload, stop the supervisor and then verify no matching Symphony child process remains and the old dashboard port is not listening.
6. Perform only the requested narrow operation.
7. Report the dashboard URL, process status, relevant log path, and any blocker.

## Stop Criteria

Stop and ask for `setup-symphony` when:

- No setup workspace exists for the target.
- Runtime discovery is missing.
- The generated workflow is missing or stale.
- Required secrets are absent.
- Tracker scope, state mapping, or prompts need changes.
- Workspace activation, target skills, or tracker tool prompts need changes.
- The failure requires code or configuration debugging beyond a readiness recheck.
