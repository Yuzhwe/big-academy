# Writing Hi-Fi Integration v1.0

Mac：双击根目录 `Start Big Academy.command`，打开 http://127.0.0.1:5174/ 。

[完整交付、验收证据与已知限制](apps/writing/docs/INTEGRATION_V1.md)。本次只实现 L2 / G2-O / Lesson 1 的八屏完整流程，等待一次性设计验收。

# Big Academy — baseline v0.1

Code-first K–12 education product workspace. Writing is the active pilot.

## Authoritative sources

1. [Writing PRODUCT.md](apps/writing/PRODUCT.md) — product requirements, lesson content, grading, navigation, persistence and acceptance criteria.
2. [DESIGN.md](DESIGN.md) — global visual system and detailed spacing, radius, motion, accessibility and component styling rules.
3. [Design Tokens](packages/design-system/src/tokens.css) — executable color, type, space, radius and motion values.
4. [Component Contracts](apps/writing/contracts/components.json) — IDs, props, events, states and component ownership.

[AGENTS.md](AGENTS.md) explains contribution rules. [HANDOFF.md](docs/HANDOFF.md) records current implementation gaps and validation status.

## Development

```sh
npm ci
npm run check:docs
npm run typecheck
npm test
npm run dev
```

Writing uses React Aria Components and a shared Big Academy design-system package. The active implementation target is eight Activity Screens in L2/G2-O Lesson 1. Existing UI/code is a prototype and **does not imply the new written contracts are implemented or visually approved**.

New development should branch from `main`, update contracts/tokens when required, run checks and submit a PR. Prior experimental branches are not authorities.

## 固定本地网址

这台 Mac 已配置后台启动：

- 组件库：http://localhost:6007/
- 高保真 Writing UI：http://localhost:5174/

登录后自动启动，关闭终端不受影响。电脑开机、已登录且没有睡眠时即可访问。页面来自当前构建的验收版本；修改源码后，需要重新构建并执行 `npm run local-sites:install` 更新，网址保持不变。
