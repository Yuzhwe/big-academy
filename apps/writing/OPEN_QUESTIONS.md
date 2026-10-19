# Open questions

Not decided here. Candidate visuals are labeled candidate. Nothing in this list is `validated`.

## Conflicts (do not silently pick a winner)

- **Warm Frame only vs Agent A A/B switch.** Approved Writing direction is A · Warm Frame + White Canvas, and `apps/writing/DESIGN.md` says not to build a comparison. Agent A’s `feat/agent-a-e01-staircase-ab` added an explore-only switch: variant A is the historical dusk platform/beam, variant B is Warm Frame. This branch keeps that switch, defaults to B, and does not treat A as the product theme. Removing it would overwrite Agent A’s review artifact; promoting A would overturn the approved direction.
- **One root DESIGN.md vs `apps/writing/DESIGN.md`.** `docs/unified-design-and-token-audit` says the only design spec is `/DESIGN.md` and product apps should not keep their own. This lineage already had `apps/writing/DESIGN.md`. Both now exist. Approved `[A]` text in `/DESIGN.md` wins. The Writing file still records the slice.
- **Root AGENTS.md was not replaced.** The audit-branch copy is `docs/reference/unified-design/AGENTS.md`.
- **Shared button tokens.** `/DESIGN.md` asks shared components to read semantic aliases such as `--ba-color-action-primary`. `BAButton` on this branch still uses `--ba-writing-accent` directly. That file was not edited here, because it is a shared Agent A / pilot component.
- **Old prompts.** Dark-brown staircase and activity prompts, a 1024px minimum width, demo unlock, and a second `writing-ui-lang` store are not product rules. See the audit.
- **P6 plan check.** Alex calls the original read-through before `Check my plan` can finish the page. This slice does not invent that result, so `plan.check` cannot be marked done.
- **Word grid on P4/P5.** Alex would show a grid on several apply and sentence screens. This slice hides those grids until a real editor exists, so a tap cannot insert into nowhere. Plan layers do insert, using `Engine.smartInsert`.

## Pending Alex

- **Q-M06 · Level Goal formula.** The goal marker is on the path and is not scored. Q-M06 is this formula, not the skip-revocation case.
- **Q-M05 · Several milestones newly reached together.** The slice does not auto-play a sequence. It shows an open notice.
- **Skip or other revocation, then the milestone is reached again.** The alignment notes do not give this its own id. The first auto-play is not repeated. Whether it should be is open.
- **Q-P01 · P1 Save my paragraph / Print.** Not built in this slice. Do not drop them when P1 is ported.
- **Q-P02 · Unit click destination and other levels.** Unit headings are not links. Non-playable lessons do not invent activities. A locked or later-level card explains why and stays on the path.
- **Menu features removed from the top bar.** Index, Analytics, and the old menu still need a home.
- **Task vs Page.** The shared top bar still says Task / 任务. Alex `Shell.step` says Page.

## Pending designer

- `#FEF9EF`, card radius, milestone shape, and 0.5px borders on the new path and workspace. Candidate only.
- Top bar height, tag clipping, and whether Dosis on the title is the final treatment. `BA-WR-001` stays temporary foundation, not validated.
- Douyin Sans is not shipped. Chinese titles use the fallback stack `Douyin Sans, PingFang SC, Noto Sans SC, Microsoft YaHei`.
- Dosis ExtraBold, Jost, and Noto Sans SC are requested from Google Fonts. If that request fails, the fallback is Arial Narrow / Noto Sans / system sans.
- P6 focus color, Word Grid overlay height, and hamburger layer tints (`#f6e7cf`, `#f3f0ea`, `#ead9c4`, focus shifts) are candidate only. They are in the slice for review. They are not approved.
- P5/P6 coach-anchor notes stay exploratory. They are not implemented.

## Prototype hooks kept visible

- `?skills=` and `?allowskip=` still follow Alex `Skip.fromUrl`. That is the prototype's skill-status input, not a new student control.
- A saved `unlockAll` flag is cleared when the student session loads. The teacher switch is not on this page.
