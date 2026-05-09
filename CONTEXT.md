# Easy Symphony Harness

Easy Symphony Harness is the operator-side context for preparing and operating Symphony against target repositories. It defines setup vocabulary, ownership boundaries, and handoff language so setup skills do not drift into Symphony implementation or target delivery work.

## Language

**Target Repository**:
The repository that Symphony will inspect, clone, and run tracker-driven work against.
_Avoid_: local repo, project repo

**Setup Workspace**:
The operator-controlled local directory that contains generated workflow files, logs, handoff notes, and per-issue workspaces for one target setup.
_Avoid_: target workspace, working copy

**Repository Setup Contract**:
The shallow setup facts extracted from target repository evidence and operator decisions.
_Avoid_: full project rules, implementation plan

**Workspace Activation**:
The per-issue preparation performed after cloning a target repository and before the first execution-agent turn.
_Avoid_: clone hook, bootstrap

**Hyard Project**:
A target repository with a root `.harness/` directory that requires Hyard agent activation before Codex can rely on project-provided skills.
_Avoid_: every repository, any repo with skills

**Browser-Safe Dashboard Port**:
A local dashboard port that is both available to the OS and loadable by Chromium or the Codex in-app browser.
_Avoid_: free port

**Live Mode**:
A setup mode where Symphony may claim real tracker issues and launch real execution agents.
_Avoid_: smoke test, dry run

**Smoke Mode**:
A setup mode that validates dispatch and configuration without claiming real target work.
_Avoid_: live test

## Relationships

- A **Setup Workspace** belongs to exactly one **Target Repository** setup.
- A **Target Repository** may or may not be a **Hyard Project**.
- A **Hyard Project** requires **Workspace Activation** beyond cloning.
- **Live Mode** uses the **Repository Setup Contract** to decide which tracker issues Symphony may claim.
- **Smoke Mode** proves setup readiness before **Live Mode**.
- A **Browser-Safe Dashboard Port** must be reflected consistently in the generated workflow, runtime start command, and operator handoff.

## Example Dialogue

> **Dev:** "Should every `hooks.after_create` run `hyard agent apply` after cloning?"
> **Domain expert:** "No. Every target needs cloning, but Hyard activation only applies when the **Target Repository** is a **Hyard Project** with a root `.harness/` directory."

> **Dev:** "The server is listening on `4045`; is the dashboard ready?"
> **Domain expert:** "Not necessarily. Readiness needs a **Browser-Safe Dashboard Port**, because the Codex in-app browser can reject unsafe ports even when the process is healthy."

## Flagged Ambiguities

- "hook" was used to mean both cloning and **Workspace Activation**; resolved: cloning is universal, activation is conditional on repository evidence.
- "free port" was used to mean both OS-available and browser-loadable; resolved: use **Browser-Safe Dashboard Port** when the operator must open the dashboard.
- "GitHub connector" was treated as categorically unsafe for unattended Codex; resolved: choose the tracker tool path from preflight evidence, using CLI/API paths when connectors elicit or block.
- "Easy Symphony Orbit" and "Easy Symphony Harness" both named this operator-side context; resolved: use **Easy Symphony Harness** for the context name and avoid Orbit except in legacy paths.
