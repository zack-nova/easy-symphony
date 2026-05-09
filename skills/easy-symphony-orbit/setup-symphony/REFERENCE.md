# Setup Symphony Reference

## Terms

- Setup workspace: operator-controlled directory where generated config, logs, and handoff notes live.
- Repository setup contract: shallow setup facts extracted from the target repository.
- Setup interview: focused questions for missing or risky setup facts.
- Setup override: operator decision that intentionally replaces repository evidence.
- Smoke Mode: validates config and dispatch safety without real agent work on existing issues.
- Live Mode: starts real Codex app-server agents for scoped issues.
- Browser-safe dashboard port: local HTTP port that Chromium/Codex in-app browser will load; some listening ports, including `4045`, can still be blocked by browser policy.
- Workspace activation: per-issue preparation that makes the cloned target repository usable by the selected execution agent before the first Codex turn.
- Hyard project: target repository with a root `.harness/` directory, which requires Hyard agent activation before Codex can rely on project-provided skills.

## Setup Workspace Layout

Use this layout unless workspace instructions say otherwise:

```text
.symphony-setups/<owner>_<repo>/
├── target/             # cloned target repository for inspection
├── WORKFLOW.md         # generated Symphony workflow
├── OPERATOR_HANDOFF.md # optional durable handoff notes
├── logs/               # Symphony logs
└── workspaces/         # per-issue agent workspaces
```

Generated files may live elsewhere if the current workspace `AGENTS.md` defines a stronger convention.

## Repository Evidence Order

Read only shallow setup sources unless a source points to a specific file:

1. `WORKFLOW.md`
2. `AGENTS.md` and `CLAUDE.md`
3. `.codex/skills/*/SKILL.md`
4. `.harness/manifest.yaml`
5. README setup, validation, and issue workflow sections

Extract facts needed to configure Symphony; do not treat every repository rule as setup input.

## Auth and Secret Handling

GitHub:

```sh
if [ -n "${GITHUB_TOKEN:-}" ]; then
  echo "GITHUB_TOKEN is present"
elif gh auth status -h github.com >/dev/null 2>&1; then
  echo "Use GITHUB_TOKEN=\"$(gh auth token)\" only for the Symphony process"
else
  echo "Ask the operator to authenticate gh or export GITHUB_TOKEN"
fi
```

Linear:

```sh
if [ -n "${LINEAR_API_KEY:-}" ]; then
  echo "LINEAR_API_KEY is present"
else
  echo "Ask the operator to export LINEAR_API_KEY"
fi
```

Never write token values into `WORKFLOW.md`, handoff files, shell profiles, or target repository files.

## GitHub Issues Path

Required facts:

- `tracker.kind: github`
- `tracker.options.repository: owner/repo`
- `tracker.options.scope`
- `tracker.active_states` as complete `state:` label values
- `tracker.terminal_states` as complete `state:` label values

Recommended narrow scope:

```yaml
tracker:
  kind: github
  active_states:
    - state:ready-for-dev
  terminal_states:
    - state:done
    - state:cancelled
    - state:duplicate
  options:
    repository: owner/repo
    api_key: ${GITHUB_TOKEN}
    scope:
      type: label
      label: project:symphony
```

Repository-wide scope is valid but risky. It must still be explicit; do not omit
`tracker.options.scope`.

```yaml
scope:
  type: repository
```

Before changing GitHub metadata:

1. List current labels.
2. Show missing labels and colors/descriptions to create.
3. Ask for confirmation.
4. Create labels only after confirmation.
5. Do not relabel existing issues into scope unless explicitly authorized.

Useful checks:

```sh
gh label list --repo owner/repo --limit 200
gh issue list --repo owner/repo --state open --limit 50 --json number,title,labels,url
```

## Linear Path

Required facts:

- `tracker.kind: linear`
- API key via environment variable `LINEAR_API_KEY`
- project slug or equivalent repository-specific filter
- active workflow state names
- terminal workflow state names

Example:

```yaml
tracker:
  kind: linear
  active_states:
    - Todo
    - In Progress
    - Rework
  terminal_states:
    - Done
    - Closed
    - Cancelled
    - Duplicate
  options:
    project_slug: my-project
    api_key: ${LINEAR_API_KEY}
```

Do not invent Linear workflow states. If repository evidence does not define them, ask the operator. Prefer asking the operator to create missing workflow statuses in Linear rather than mutating team workflow settings automatically.

## State Prompts

State prompts are configured with tracker-native state values and appended to the workflow body for the first turn only.

Ask for a state prompt for every active state unless the repository says to use one generic workflow body prompt.

Example:

```yaml
agent:
  state_prompts:
    state:ready-for-dev: |
      Start fresh implementation work from the issue details. Keep progress in the tracker and move out of the active state when complete or blocked.
    state:to-rework: |
      Address review feedback. Preserve existing progress, update validation evidence, and return the issue to review when done.
```

## Workflow Generation Checklist

Generated `WORKFLOW.md` should include:

- tracker backend and options
- active and terminal state sets
- workspace root under the setup workspace
- `hooks.after_create` that clones the target repository into each issue workspace
- `agent.max_concurrent_agents` and `agent.max_turns`
- state prompts when configured
- `codex.command`
- `codex.approval_policy`
- dashboard `server.port` or CLI `--port`

Use `approval_policy: never` unless repository instructions require another supported policy. If app-server rejects an object-form policy such as `reject`, switch to a supported string policy for the local runtime.

Run generated workflow validation against the actual discovered Symphony binary before starting. Feature support can differ between local runtime branches; for example GitHub repository-wide scope requires `scope: {type: repository}` rather than an omitted scope.

## Workspace Activation Hook

The exact `hooks.after_create` block is part of Live readiness. Test it in a disposable workspace before allowing real issues to be claimed.

Every target needs a clone step. Do not assume every target needs agent activation beyond clone.

Common activation responsibilities:

- Clone the target repository into the empty issue workspace.
- If the target has a root `.harness/` directory, treat it as a Hyard project and run target-owned agent activation commands, for example:

  ```sh
  hyard agent use codex
  mkdir -p .git/orbit/state/agents
  hyard agent apply --project-only --yes --json > .git/orbit/state/agents/codex-apply.json
  ```

Activation preflight proof:

- The exact hook exits zero in a fresh disposable workspace.
- Required project or linked skills exist under `.codex/skills` when the repository evidence or state prompts require them.
- `git status --short` is clean after intentional activation cleanup for Hyard projects.
- Any activation output needed for debugging is written under `.git/` or setup-local logs, not to target-tracked files.

## Smoke Mode

Smoke Mode should avoid claiming existing work.

Preferred approaches:

- Use a dedicated scope label or project/filter created only for the smoke test.
- Use active state values that apply only to a dedicated test issue.
- Use `scripts/smoke_app_server.js` as `codex.command` when the goal is dispatch validation without real Codex work.

Example smoke command:

```yaml
codex:
  command: "node /absolute/path/to/skills/easy-symphony-orbit/setup-symphony/scripts/smoke_app_server.js"
  approval_policy: never
```

Live Mode should use the real Codex app-server command selected by repository or setup workspace instructions.

## Runtime Discovery

Follow current setup workspace instructions first. In Easy Symphony Harness, prefer `.runtime/easy-symphony.env` created by `BOOTSTRAP.md`. If no instructions exist:

1. Prefer an explicit `SYMPHONY_BIN` or documented runtime path.
2. Use `symphony` from `PATH` if available.
3. Use `.runtime/symphony/elixir/bin/symphony` or the `SYMPHONY_RUN_COMMAND` recorded by bootstrap.
4. If the current workspace is a Symphony checkout with `elixir/`, use its documented build/run command.
5. Otherwise stop and run `BOOTSTRAP.md`.

Do not install Elixir, mise, Codex, system packages, or other machine-level tooling without explicit operator approval. Workspace-local Symphony checkout/build belongs to `BOOTSTRAP.md`.

## Dashboard Port And Process Supervision

Do not rely only on "port is listening" when choosing the dashboard port. The operator may need to view it in Chromium or the Codex in-app browser, which rejects unsafe ports such as `4045` with `ERR_UNSAFE_PORT`.

Use the helper when available:

```sh
node skills/easy-symphony-orbit/setup-symphony/scripts/select_dashboard_port.js
```

Then keep all three in sync:

- `server.port` in `WORKFLOW.md`
- the runtime CLI `--port`
- the dashboard URL in `OPERATOR_HANDOFF.md`

Recommended verification:

```sh
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:<port>/
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:<port>/api/v1/state
lsof -nP -iTCP:<port> -sTCP:LISTEN
```

For stop and reload, do not trust the supervisor command alone. `screen -X quit` can leave the shell or BEAM child process alive. After stopping, verify:

```sh
screen -ls
lsof -nP -iTCP:<old-port> -sTCP:LISTEN || true
ps -axo pid,ppid,command | rg '<symphony-bin>|<setup-workspace>/WORKFLOW.md'
```

If the dashboard still responds after the supervisor disappeared, kill only the matching Symphony process for that setup workspace, then recheck the old port before restarting.

## Agent Runtime Readiness

Agent Runtime Readiness is required before Live Mode. It is not just troubleshooting after a failure.

Check these areas:

- Codex executable: path and version
- Codex app-server protocol: `initialize`, `thread/start`, and a minimal `turn/start`
- Codex auth/session: the minimal turn completes without login or account errors
- Approval policy compatibility: avoid unsupported object variants such as `reject` when local app-server expects string variants
- Sandbox policy: thread sandbox, turn sandbox policy, writable roots, network needs, and workspace cwd safety
- Repository trust: warn if project-local `.codex` config, hooks, or policies are disabled until trusted
- Secret propagation: required env vars are visible to the Symphony process and relevant hooks
- Tracker permissions: issue read/update/comment/label permissions for GitHub or Linear
- Tracker tooling path: prove the chosen tracker read/write path works unattended. Use deterministic CLIs or API calls such as `gh` when app connectors or MCP tools require elicitation; use connector tools only when preflight proves they do not block unattended turns.
- Repository access: clone access, and push/PR permissions if Live Mode expects publishing
- Workspace activation hook viability: the exact `hooks.after_create` block can run under the configured sandbox
- Dependency and validation viability: commands such as `mise run fix` and `mise run ci` either run successfully or are reported as blocked by trust/tooling requirements

### Protocol Preflight

Protocol Preflight is mandatory. It must use the real Codex app-server, not `scripts/smoke_app_server.js`.

Minimum proof:

1. Start `codex app-server` in a disposable workspace under the configured workspace root.
2. Send `initialize` and expect a successful response.
3. Send `thread/start` with the configured approval policy and sandbox.
4. Send `turn/start` with a tiny prompt such as `Reply with exactly: symphony preflight ok`.
5. Confirm the turn completes.
6. Record Codex path, version, approval policy, sandbox summary, result, and any warnings.

Do not treat `codex --version` as sufficient proof. Version checks miss app-server protocol, auth, and sandbox failures.

### Capability Preflight

Run Capability Preflight only for capabilities Live Mode expects:

- Tracker write path: create a harmless test comment or use a dedicated smoke issue when safe.
- GitHub label path: list labels; create missing labels only after confirmation.
- Linear path: read project/state metadata; mutate only after confirmation.
- Repository read path: clone the target repo using the exact configured hook.
- Repository write path: check push/PR permissions only if agents are expected to publish branches.
- Network path: verify network is available only if hooks or agents need it.
- Dependency path: run the bootstrap install command in the disposable workspace when it is part of setup.

Capability Preflight should prove access without doing a full real target issue.

### Readiness Remediation

Safe automatic remediation:

- Switch generated approval policy to a supported string such as `never` when object-form policy is rejected.
- Generate workspaceWrite policy with the issue workspace as a writable root.
- Replace literal token values in generated artifacts with environment variable references.
- Choose an available browser-safe dashboard port.
- Create missing setup directories.
- Use the bundled smoke app-server for dispatch-only validation.
- Stop orphaned Symphony processes that match the current setup workspace after a failed stop or reload.

Requires operator confirmation:

- Expand sandbox authority, enable network, or use danger-full-access.
- Add a target repository to Codex trusted projects.
- Create or edit tracker metadata.
- Persist secrets in shell profiles, keychains, `.env`, or repository files.
- Enter Live Mode or allow existing issues to be claimed.

Report as blocker:

- Codex CLI missing or not logged in.
- Symphony runtime missing.
- Required GitHub or Linear token unavailable or under-permissioned.
- Target repository clone, push, or PR permissions missing.
- Linear team/workspace workflow permissions missing.
- Required machine runtimes such as Elixir or mise are missing and the operator has not authorized installation.

## Operator Workflow Map

Do not present a flat state list. Present state flow and ownership:

- Symphony-managed states: every active state in `tracker.active_states`
- Human-managed states: review, decision, blocked, waiting, terminal, or any state not in the active state set
- Exit rule: an issue keeps being claimed while it remains in an active state
- Stop rule: move the issue to a terminal state, remove it from tracker scope, remove the active state, or stop Symphony

Use repository-native state names. Do not invent fallback state names.

## Troubleshooting

`unknown variant reject`:

- The local Codex app-server rejected object-form approval policy.
- Set `codex.approval_policy` to a supported string, commonly `never`, unless workspace instructions require another value.

Issue keeps running:

- The issue is still inside tracker scope and still has an active state.
- Move it to a non-active or terminal state, or remove the scope label/filter.

GitHub issue rejected for label state:

- Each scoped open issue must have exactly one `state:` label.
- Add the missing state label or remove duplicate `state:` labels.

No issues are picked up:

- Check tracker auth, tracker scope, active states, open/closed status, and assignee filters.
- Check `/api/v1/state` and Symphony logs.

`:missing_github_tracker_scope`:

- GitHub tracker config requires an explicit `tracker.options.scope`.
- Use `scope: {type: repository}` for repository-wide Live Mode.
- Use `scope: {type: label, label: project:<name>}` for a narrow project label scope.

Dashboard fails in browser with `ERR_UNSAFE_PORT`:

- The server can be healthy while Chromium blocks the port.
- Move Symphony to an available browser-safe port such as `4050`; update `server.port`, CLI `--port`, and the handoff URL together.
- Verify with both `/` and `/api/v1/state`.

Stop command exits but dashboard still responds:

- The supervisor session may be gone while a child Symphony process remains.
- Find the child by the Symphony binary path and setup workspace `WORKFLOW.md`, kill only that process tree, and verify the port is free before restart.

Codex turn asks for app connector or MCP elicitation:

- The chosen tracker tool path is not safe for unattended workers in this environment.
- Tighten state prompts to use a proven non-interactive path such as `gh issue` and `gh api`, or rerun preflight with a connector configuration that does not elicit.

Project-local Codex config disabled until trusted:

- Skills may still load, but project-local config, hooks, or exec policies are disabled.
- Report this separately from skill availability.
- Ask before adding generated workspaces to Codex trusted projects.

Linear missing project or states:

- Ask the operator for the project slug/filter and exact workflow state names.
- Do not guess state names from generic templates.

## Operator Handoff Template

Keep final responses short:

```md
Symphony is running at <browser-safe-dashboard-url>.

Setup artifacts:
- Workflow: <path>
- Logs: <path>
- Agent workspaces: <path>

Tracker:
- Adapter: <github|linear>
- Scope: <scope>
- Symphony-managed states: <active states>
- Terminal states: <terminal states>
- Secrets required: <env var names only>
- Codex/runtime readiness:
  - Codex: <path> <version>
  - Approval policy: <value>
  - Sandbox: <summary>
  - Protocol Preflight: <pass/fail>
  - Capability Preflight: <checked/skipped/blockers>
  - Workspace Activation Preflight: <pass/fail>
  - Dashboard reachability: <curl/browser-safe verification>
  - Remediation applied: <summary>

Workflow:
<state flow with Symphony vs human ownership>

To test:
<how to create/select a test issue and expected dashboard behavior>

To stop or prevent pickup:
<state/scope changes, process stop command, and orphan-process fallback>
```
