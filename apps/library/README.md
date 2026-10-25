# Big Academy Design Library

Independent designer-facing application. Run `npm run dev:library` from the repository root, then open `http://127.0.0.1:6007/`. Build with `npm run build:library`; deploy the contents of `apps/library/dist` to a static host when publishing is requested. Query-string navigation works without server route rewrites.

Storybook remains a separate developer/test entry (`npm run storybook`, port 6006). This app imports the real shared components; it does not embed Storybook or duplicate component visuals. The local preview does not depend on the Storybook server.

## Designer flow

1. Search by Chinese name, English name, or stable Contract ID. Open a component directly into an interactive preview.
2. Explore live interaction or select a visual state. Change the component's interface language, container width, supported control size and text sample; the English learning material stays English.
3. Expand state comparisons, usage/contracts, source, and review evidence only when needed.
4. Copy a scenario URL or a feedback summary. Approval status is read directly from the existing contracts. Review checkboxes and notes are temporary drafts, cleared on switching components; they never write approval or learner records.

The R2 library includes BAChoice, BAButton, BATabs, LessonTopBar, StairLessonCard and WordGrid. BAChoice includes a current-scene usage example; all six expose their actual source. Product gating, grading and persistence remain owned by Writing.

## Source boundaries

- `src/catalog.ts`: six curated entries and validated query parameters; contract data imports `apps/writing/contracts/components.json`.
- `src/Preview.tsx`: adapters around actual components. Adapters only provide sample data and local event output.
- `src/App.tsx`: site navigation, preview controls, disclosures and feedback drafts.
- `src/library.css`: website shell styles; low-specificity defaults preserve imported component styles.
- Shared website values live in `packages/design-system/src/tokens.css` under the library section and are marked [E]. Root DESIGN.md remains the only design authority.
- `public/review`: browser screenshots and dated verification record. These are fixed evidence, not current-state screenshots or design approval.

Scene URLs preserve all R2 controls, BAChoice selections/submission, active tabs, WordGrid selections, answer order and demo feedback. Topbar navigation, button notices and feedback drafts are transient. Fixed width changes the preview container, not the browser viewport: components using media queries must also be checked at actual viewport sizes. Deterministic Choice and WordGrid examples are explicitly separate from course scoring; there is no approval backend.

## Verification

See `public/review/r2/verification.md` for R2 checks, screenshots, scene URLs and limitations. No new dependency install is required. This local snapshot has no `.git`; the GitHub connector maintains the isolated `feat/component-library-r2` review branch from the verified current component-workbench baseline. No main merge or deployment is authorized.

## R2 entry points

- Colors: `?view=foundations`, all scoped color definitions read directly from shared CSS.
- Component pages: `?component=button`, `tabs`, `choice`, `lesson`, `words`.
- WordGrid: A–H scenario buttons; selection, evaluation and disabled remain independent.
- Outline, Dark Tabs, extended WordGrid feedback and current-card emphasis require visual approval. Three-line card titles are opt-in; existing Writing path retains two lines.
- The standalone free-build demo permits undo. Writing screen 5 keeps its ordered/no-undo rule.

Review screenshots are local-only by user decision. They are excluded from the review commit. The site detects their presence at build/dev startup and shows the text report without broken image placeholders in other checkouts.
