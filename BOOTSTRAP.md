# BOOTSTRAP.md - Easy Symphony Harness

This is an agent-executable first-run checklist. It prepares local Symphony and Codex runtime readiness for this workspace. Target-repository workflow configuration belongs to `setup-symphony`, not here.

## Rules

- Do low-risk inspection and workspace-local writes directly.
- Ask before installing Codex, installing system packages, changing shell profiles, changing global toolchain versions, trusting projects, or persisting credentials.
- Do not write token values to files.
- Keep Symphony implementation state under `.runtime/symphony/`; keep `.runtime/` git ignored.

## Checklist

1. Confirm workspace root:
   - Run `pwd`.
   - Ensure `.gitignore` contains `.runtime/` and `.symphony-setups/`.

2. Inspect prerequisites:
   - Run `command -v git`.
   - Run `command -v mise`.
   - Run `command -v codex`.
   - If `mise` is available, use `mise exec -- elixir --version` after checkout.
   - If `codex` is missing or unusable, ask before helping install it.
   - If Elixir/Erlang tooling is missing and cannot be provided through existing `mise`, ask before changing machine-level tooling.

3. Install or refresh Symphony source checkout:
   - Create `.runtime/`.
   - If `.runtime/symphony/.git` exists, run `git -C .runtime/symphony fetch --all --prune`.
   - Otherwise run `git clone https://github.com/zack-nova/symphony .runtime/symphony`.

4. Build Symphony:
   - Run `cd .runtime/symphony/elixir`.
   - If `mise` is available, run `mise trust` only after operator approval, then `mise install`.
   - Run `mise exec -- mix setup` and `mise exec -- mix build` when using `mise`.
   - If not using `mise`, run `mix setup` and `mix build` only when the installed Elixir/Erlang versions satisfy the checkout requirements.

5. Record local runtime discovery:
   - Write `.runtime/easy-symphony.env` with local paths and commands only.
   - Include at least `SYMPHONY_ROOT`, `SYMPHONY_ELIXIR_DIR`, and `SYMPHONY_RUN_COMMAND`.
   - Do not commit this file.

6. Handoff:
   - Report Symphony checkout path, build result, Codex path/version, blockers, and the next command: invoke `setup-symphony` with a target repository URL.
