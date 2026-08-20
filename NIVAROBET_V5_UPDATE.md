# NivaroBet V5 update

## Included
- AI Import V2 rendered extraction fallback with Firecrawl when direct extraction is weak.
- Existing Gemini normalization, confidence, Needs Review and safe non-erasing field mapping retained.
- Existing AI offer suggestions automatically sync into Bonus / Promo Code records on Save Casino.
- Dark / Light mode toggle with saved preference and no-flash initialization.
- Mobile hero, search bar, spacing and header controls made more compact.
- Lightweight CSS motion/polish only; no video, canvas, WebGL or heavy animation dependency.
- Reduced-motion accessibility and content-visibility performance behavior retained.

## Environment
Keep your existing environment variables. Add this in local `.env.local` and Vercel Environment Variables:

FIRECRAWL_API_KEY=your_firecrawl_api_key

Without this key AI Import still uses the existing direct extractor + Gemini. With the key it automatically uses rendered Firecrawl extraction only when the direct source is too weak.

## Validation
`tsc --noEmit` passes in the prepared source. A full Next build could not be completed in the packaging environment because the uploaded Windows node_modules requires Next to download the Linux SWC binary and outbound npm access is unavailable. Run `npm install` and `npm run build` on the target machine as usual.
