# Easy Symphony Rules

## Purpose

Easy Symphony Harness prepares and operates Symphony for target repositories. It owns setup workflow, local runtime readiness, configuration projection, runtime start/stop handoff, and operator handoff. It does not own Symphony implementation code, target-repository delivery work, or execution-agent delivery skills.

## Runtime State

- Local Symphony implementation state lives under `.runtime/symphony/` by default.
- `.runtime/` and `.symphony-setups/` are local machine state and must stay git ignored.
- Local runtime discovery should be recorded in `.runtime/easy-symphony.env` or equivalent local overlay.
- Token values must never be written to workflow files, handoff notes, shell profiles, or target repositories.

## Setup

`setup-symphony` is the main configuration workflow. It reads repository evidence first, asks only at setup decision points, generates Symphony configuration in the setup workspace, validates Codex/runtime/tracker readiness, starts Symphony, and gives the operator a concise handoff.

The default setup workspace is `.symphony-setups/<owner>_<repo>/` unless stronger workspace instructions exist.

Generated target workflow files are Symphony Configuration Projections. Manual edits create projection drift unless the setup contract defines an explicit override path.

## Operation

`operate-symphony` is intentionally narrow. It may check status, start, stop, reload, show logs, and rerun readiness checks for an already configured target. It must not redesign workflow policy, rewrite target packages, mutate tracker metadata, or perform broad troubleshooting. Redirect those changes to `setup-symphony`.

## Tracker And States

The harness supports GitHub Issues and Linear. A GitHub repository URL proves repository host only; it must not imply GitHub Issues as the tracker.

`setup-symphony` maps repository-owned state rules into Symphony active states, terminal states, state prompts, and human-owned states. The operator handoff must show which states Symphony will claim and which states require human action.
