# Boss 立绘资源

## 静态立绘（必需）

| 文件 | 说明 |
|------|------|
| `division_slime.png` | 由 `npm run gen:boss-png` 从 SVG 生成；改码后执行 `npm run rebuild:weapp`（见 `docs/dev-build-checklist.md`） |
| `multiply_golem.png` | 同上 |
| `word_dragon.png` | 同上 |

## Idle 循环动画（可选，包 A）

将 AI 生成的 APNG 放入本目录，命名：

- `division_slime_idle.apng`
- `multiply_golem_idle.apng`
- `word_dragon_idle.apng`

放入 APNG 后需在 `src/utils/bossAssets.ts` 的 `BOSS_IDLE_APNG_SRC` 中注册；**未注册则直接用 PNG + CSS 呼吸动效**（避免对不存在文件调用 `getImageInfo` 报错）。

出图 Prompt 见项目根目录 `docs/boss-ai-prompts.md` 各 Boss 的「视频 → idle.apng」章节。
