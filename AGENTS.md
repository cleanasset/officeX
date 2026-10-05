<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:gsd-core-rules -->
# GSD (Get Shit Done) Empirical Verification Protocol

1. **Proof Before Done (Empirical Validation)**:
   - NEVER mark a task, fix, or feature as complete based on assumptions or "it should work".
   - Always run a direct empirical verification (targeted API curl, node test, route check, or DB query) to prove that the code executes without runtime exceptions.
   - Show the concrete verification result (HTTP status code, returned data, or DB record) in the response.

2. **Root-Cause Verification**:
   - Always verify dependencies, imports, and schema compatibility (especially Supabase Auth, PostgreSQL types, and Next.js App Router exports) before concluding any edit.

3. **Strict Git Safety**:
   - NEVER execute `git push`. All Git commits and pushes to remote repositories are strictly reserved for the USER to run.

4. **GSD Workflow Commands**:
   - Automatically adhere to GSD commands when invoked:
     - `/verify` — The Auditor: Validate requirements with empirical evidence.
     - `/plan` — The Strategist: Decompose into executable phases before writing code.
     - `/execute` — The Engineer: Wave-based task execution with checkpoint testing.
     - `/debug` — The Debugger: Systematic 3-strike root-cause isolation.
     - `/progress` — Track state and roadmap status.

5. **Direct & Action-Oriented**:
   - Deliver clear, concise code updates without unrequested fluff.
<!-- END:gsd-core-rules -->

