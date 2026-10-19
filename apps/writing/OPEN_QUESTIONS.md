# Open questions

Not decided here. Candidate visuals are labeled candidate. Nothing in this list is `validated`.

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
- P6 focus color, Word Grid overlay, and hamburger underline are not in this slice.
- P5/P6 coach-anchor notes stay exploratory. They are not implemented.

## Prototype hooks kept visible

- `?skills=` and `?allowskip=` still follow Alex `Skip.fromUrl`. That is the prototype's skill-status input, not a new student control.
- A saved `unlockAll` flag is cleared when the student session loads. The teacher switch is not on this page.
