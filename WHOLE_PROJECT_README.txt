TopPick PRO — WHOLE PROJECT bundle

This archive contains the full TopPick project source plus node_modules so the folder is a complete local project bundle.

Git/GitHub:
- node_modules is intentionally ignored by .gitignore and should NOT be committed.
- Upload/commit the project root with normal git commands; Git will exclude node_modules.
- Do not copy Nivaro source into this project. Only the matching dependency installation was reused to make this bundle self-contained.

Run locally:
  npm run dev

Before production:
- configure .env.local / Vercel environment variables
- run Supabase migrations
- run npm run typecheck
- run npm run build on your Windows machine or GitHub CI
