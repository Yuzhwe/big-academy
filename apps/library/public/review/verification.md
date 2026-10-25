# Component library verification — 2026-10-25

Status: implemented, ready for designer review. This report is not visual approval.

## Actual checks

- Documentation source check passed.
- TypeScript checks passed for design-system, Writing, Storybook/pilot tests and the new library application.
- Full Vitest run: 14 files, 59 tests passed (52 existing + 7 library tests). Library coverage includes validated scene URLs, refresh restoration, real selection, state/live switching, reset, stable-ID search, navigation focus, feedback copy and read-only approval.
- Production builds passed for design-system, Writing, Storybook and the independent library.
- Writing and Storybook emit existing bundle-size warnings. The library build completes without that warning.
- Tests and builds were invoked with the bundled Node executable and the installed project CLIs because npm/node are unavailable on this shell's default PATH. No dependency install was used for verification.

## Browser checks

Performed in the in-app browser on `http://127.0.0.1:6007/` using the real application.

- Desktop 1440 × 900: own header/sidebar, preview first, six real component pages, no embedded Storybook UI. Captured default screenshots for all six components.
- Tablet 834 × 1112: lesson card page and real title typography; document width remains 834 px. Saved `lesson-tablet.jpg`.
- Mobile 390 × 844: component menu navigation, BAChoice Chinese interface, English long text and correct-unselected state. Document width remains 390 px; long text wraps. `choice-mobile.jpg` is a full-page capture from this viewport, with disclosures collapsed.
- BAChoice: pointer selection and keyboard ArrowDown selection; selected value is reflected in the URL. Copied scene URL includes language, sample and selected value; reload restores the scene. Explicit correct-unselected state and a measured 320 px canvas checked. State matrix renders all seven supported entries.
- BATabs: ArrowRight changes L2 to L3; L3 is disabled in the disabled scenario.
- WordGrid: selecting I think, changing to Nouns and selecting garden produces the local insertion output `I think garden`.
- LessonTopBar: Activity 1 becomes current when selected; later locked activities remain disabled; Back emits a local preview result.
- StairLessonCard: locked CTA is disabled. Website defaults do not replace its Dosis 800 / 24px / 30px title typography.
- BAButton: 90 px setting, click output and busy `data-pending` state checked.
- Feedback: copy includes Contract ID, raw visual status, scene URL, selected checklist items and written notes; does not create an approval record. Desktop evidence images load from local public assets.
- No warning/error console entries were captured during these checks.

## Limits and remaining review

- Designer review is still required for the new website's layout, spacing and interaction choices. Existing component approval is only whatever is recorded in the canonical contract.
- This is a local preview, not a published service. Scenario URLs currently use localhost and are usable on a machine running the app. Public deployment is not performed.
- Douyin licensed assets are not available. Chinese headings currently fall back; Google Fonts need connectivity for their web fonts. Offline font parity is not claimed.
- Width controls adjust the container at original scale; they do not emulate device viewport/media queries. All combinations of component states, widths, locales and browser engines have not been tested.
- No automated axe/WCAG audit, screen-reader session or full Writing Playwright curriculum regression was run. Keyboard and semantic checks above are focused evidence, not full accessibility certification.
- Only six components are indexed in this release. Existing registry entries outside this set remain in Storybook/source.
- URL sharing includes configuration plus BAChoice selection. Other transient demo interactions and feedback drafts are not restored from URLs. There is no saved-comment, assignment, approval or authentication backend.
- No Git metadata was supplied in this workspace; no branch, commit, PR or merge was possible.
