<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:speed-mode-rules -->
# Strict Fast Execution Rules (Speed Mode)

1. **Direct, Fast Edits**: Make instant, single-step file edits without launching multi-step background loops.
2. **No Unrequested Builds or Typechecks**: NEVER run slow verification commands (e.g. `npx tsc`, `npm run build`, full test suites) unless the user explicitly asks for them.
3. **No Automated Browser Subagents**: Do not spawn browser subagents unless explicitly requested by the user.
4. **No Unnecessary Shell/Git Commands**: Avoid running exploratory shell, git diff, or status checks that delay responses.
5. **Ultra-Concise Responses**: Deliver direct answers and code updates immediately with zero unnecessary fluff.
<!-- END:speed-mode-rules -->

