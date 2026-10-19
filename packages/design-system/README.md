# Big Academy shared design system

Workspace package `@big-academy/design-system`. Writing-specific composites stay in `apps/writing`.

Implemented for the Top Bar pilot, with a temporary foundation theme that is not visually approved:

- `BA-UI-001` `BAButton` — React Aria `Button`
- `BA-UI-006` `BATaskProgress` — lesson-local task group; `canOpen` is injected

`npm run build -w @big-academy/design-system` emits `dist/`. The workspace export currently points at TypeScript source so Vite and Storybook compile it directly. Tokens: `src/tokens.css`. Approved token values are marked in that file. Candidate colors are not sign-off.

`react-aria-components` is an Apache-2.0 dependency. It is not vendored, and its license stays with that package.
