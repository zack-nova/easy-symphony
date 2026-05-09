---
name: setup-symphony
description: Configure, validate, and start Symphony for a target repository from repository evidence plus a short setup interview. Use when a user gives a repository URL and asks to set up, configure, run, test, or onboard Symphony with GitHub Issues or Linear.
---

# Setup Symphony

Use this skill to act as the operator-side setup agent for Symphony. The user may provide only a repository URL; inspect the repository and the current setup workspace, ask only at real setup decision points, generate the final workflow in the setup workspace, start Symphony, and hand off how the operator should work with it.

Before running, read `docs/easy-symphony-orbit/symphony-rules.md`. If local Symphony runtime discovery is missing, run `BOOTSTRAP.md` first.

## Operating Rules

- Treat this as an operator-side skill. Do not require installation in the target repository.
- Store generated setup artifacts in a setup workspace, not in the target repository, unless the user explicitly asks to write back.
- Do not persist tracker tokens. Generated workflows must reference environment variables named `GITHUB_TOKEN` or `LINEAR_API_KEY`; inject values only into the running process.
- Default to Smoke Mode. Enter Live Mode only after the operator confirms tracker scope and active states may be claimed by real agents; never infer Live Mode from "test", "run", or "start".
- Use repository evidence first. If it conflicts with the operator's answer, call out the conflict and document the setup override.
- Treat Codex app-server, sandbox policy, credentials, and permissions as setup gates, not optional troubleshooting.
- Do low-risk inspection without prompting. Ask only at setup decision points.

## Workflow

1. **Create the setup workspace**
   - Read the current workspace `AGENTS.md`, `BOOTSTRAP.md`, `.runtime/easy-symphony.env`, or equivalent local overlay to discover the Symphony runtime location.
   - If runtime discovery is missing, stop and run `BOOTSTRAP.md` before target setup.
   - Create `.symphony-setups/<owner>_<repo>/` under the current workspace unless a setup workspace is already specified.
   - Clone or fetch the target repository into `target/` for inspection.

2. **Extract the repository setup contract**
   - Read shallow setup sources in this order: `WORKFLOW.md`, `AGENTS.md`/`CLAUDE.md`, `.codex/skills/*/SKILL.md`, `.harness/manifest.yaml`, then README setup/test sections.
   - Extract only setup-relevant facts: tracker backend, tracker options, tracker scope, active and terminal state sets, state prompts, workspace activation commands, validation commands, and operator workflow notes.

3. **Run the setup interview**
   - Ask when backend, scope, state sets, state prompts, secrets, runtime, tracker mutations, or Live Mode are unknown or risky.
   - Support both GitHub Issues and Linear. A GitHub repository URL proves repository host only; it does not choose the tracker.
   - Confirm the first-turn state prompt for every Symphony-managed active state unless the repository intentionally uses only the workflow body prompt.

4. **Prepare tracker metadata**
   - Check auth and metadata without changing anything first.
   - For GitHub, check required `state:` labels, optional `project:` scope label, and ordinary labels such as `type:`.
   - For Linear, prefer existing workflow states; do not create or edit workflow statuses unless the operator explicitly authorizes it.
   - Show the mutation plan and wait for confirmation before changing tracker metadata.

5. **Generate workflow and smoke validate**
   - Write `WORKFLOW.md` into the setup workspace.
   - Validate against the actual discovered Symphony runtime, including supported tracker scope variants and state prompt support; do not assume the local runtime matches the latest spec.
   - Pick an available browser-safe dashboard port and keep `server.port`, the CLI `--port`, and the handoff URL in sync.
   - Prefer `approval_policy: never` for current Codex app-server compatibility unless repository instructions require otherwise.
   - In Smoke Mode, use a narrow dedicated test scope and, when useful, this skill's `scripts/smoke_app_server.js` as the `codex.command` to validate dispatch without real agent work.
   - Run configuration validation or start Symphony only after required secrets and runtime are available.

6. **Check agent runtime readiness**
   - Run Protocol Preflight with the real Codex app-server before Live Mode.
   - Run Workspace Activation Preflight with the exact `hooks.after_create` commands when repository evidence requires activation beyond clone; for Hyard projects, verify target skills are visible to Codex.
   - Run Capability Preflight for the configured live-run abilities: tracker writes with the chosen non-interactive path, repo clone/push/PR, network access, bootstrap hooks, and dependency installation.
   - Apply safe readiness remediation automatically; ask before expanding sandbox authority, trusting projects, changing tracker metadata, persisting secrets, or enabling Live Mode.
   - Report blockers for missing tools, auth, repo access, tracker permissions, or machine runtimes that need external action.

7. **Start Symphony and hand off**
   - Start the discovered Symphony runtime with the generated workflow and dashboard port.
   - Verify the dashboard responds on the browser-safe URL and that `/api/v1/state` returns JSON.
   - On stop or reload, verify the supervisor session is gone, no orphan Symphony process remains, and the old port is no longer listening before restarting.
   - Provide an operator handoff: key configuration, dashboard URL, workspace root, runtime readiness summary, how to create/select work, state flow ownership, how to stop or prevent claiming, and where setup artifacts live.

## Decision Points

Ask the operator before choosing or changing:

- Tracker adapter: GitHub Issues vs Linear
- Tracker scope: repository-wide, `project:` label, Linear project/filter
- Active and terminal state sets
- State prompts for active states
- Tracker metadata mutations
- Missing setup secrets
- Dashboard port changes when an existing operator URL would change
- Symphony runtime location if workspace instructions do not resolve it
- Readiness remediation that expands authority or persists credentials
- Live Mode or any setup that would let real agents claim existing issues

## Handoff Shape

Keep the final answer concise. Include:

- Browser-safe dashboard URL, stop command, and any stop fallback for orphaned processes
- Generated workflow path and agent workspace root
- Tracker adapter, scope, active states, terminal states, and setup secrets by environment variable name
- Agent runtime readiness: Codex path/version, approval policy, sandbox summary, Protocol Preflight result, Capability Preflight results, blockers, trust warnings, and applied remediation
- Operator workflow map: which states Symphony handles, which states humans handle, and how work exits active states
- Smoke test or live-use instructions for creating an issue and observing pickup

## Reference

See [REFERENCE.md](REFERENCE.md) for tracker-specific checks, workflow snippets, troubleshooting, and handoff details.
