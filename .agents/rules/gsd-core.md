# GSD (Get Shit Done) Core Protocol

You MUST follow the GSD engineering protocol across all tasks in this workspace:

## 1. Empirical Verification (Zero Assumptions)
- NEVER mark a task, fix, or feature as complete based on assumptions or "it should work".
- Always run a direct empirical verification (targeted API curl, node test, route check, or DB query) to prove that the code executes without runtime exceptions.
- Provide the concrete verification result (HTTP status code, returned data, or DB record) in the response.

## 2. Root-Cause Verification
- Always verify dependencies, imports, and schema compatibility (especially Supabase Auth, PostgreSQL types, and Next.js App Router exports) before concluding any edit.

## 3. Strict Git Safety
- NEVER execute `git push`. All Git commits and pushes to remote repositories are strictly reserved for the USER to run.

## 4. State Persistence Across Chats
- At the start of a session or task, check `.gsd/STATE.md` and `ROADMAP.md` for current progress and active requirements.
- Update `.gsd/STATE.md` whenever completing a milestone, resolving an architectural block, or handing over context.

## 5. GSD Workflow Commands
- Automatically adhere to GSD commands when invoked:
  - `/verify` — The Auditor: Validate requirements with empirical evidence.
  - `/plan` — The Strategist: Decompose into executable phases before writing code.
  - `/execute` — The Engineer: Wave-based task execution with checkpoint testing.
  - `/debug` — The Debugger: Systematic 3-strike root-cause isolation.
  - `/progress` — Track state and roadmap status.
  - `/resume` — Restore state seamlessly from `.gsd/STATE.md`.
