# HUMANS.md - Easy Symphony Harness

Use this harness when you want an agent to make Symphony usable for a target repository and explain how to operate it.

Start with `BOOTSTRAP.md` once per workspace. Then invoke `setup-symphony` with a target repository URL. Use `operate-symphony` only after a target has already been configured.

Available skills:

- `setup-symphony`: configure, validate, start, and hand off Symphony for a target repository.
- `operate-symphony`: check status, start, stop, reload, show logs, and rerun readiness checks for an already configured target.

You may be asked to confirm tracker backend, tracker scope, active states, first-turn prompts, tracker metadata changes, missing secrets, Codex installation, or Live Mode.

The harness should leave you with a dashboard URL, generated workflow path, stop command, state ownership map, runtime readiness summary, and instructions for creating or selecting test work.
