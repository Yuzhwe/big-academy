# Elevation / Shadow · Figma 15:5

Source: https://www.figma.com/design/06PPYhEQn3CqVYGlfopJWx/Big-Academy-Design-System?node-id=15-5

| Style | Figma CSS expression |
|---|---|
| 100 | `0 0 2px rgba(7,46,81,.05), 0 2px 4px rgba(7,46,81,.10)` |
| 200 | `0 4px 16px rgba(7,46,81,.05)` |
| 300 | `0 2px 2px rgba(7,46,81,.05), 0 8px 24px rgba(7,46,81,.10)` |
| 400 | `0 0 2px rgba(7,46,81,.15), 0 8px 24px rgba(7,46,81,.15)` |
| Blur/Background/20 | Figma effect radius 20 → exported CSS `blur(10px)` |

CSS values live only in `packages/design-system/src/tokens.css`. Reuse `--ba-effect-elevation-*` and `--ba-effect-blur-background-20`; do not duplicate numeric shadow declarations. Product component assignments and visual acceptance require designer approval. Button's 3px lower stroke is a different treatment.
