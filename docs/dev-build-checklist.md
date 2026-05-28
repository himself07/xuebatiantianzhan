# 小程序开发构建清单

供日常编码、AI 辅助改码、提测前自检使用。**Taro 编译产物仅在 `dist/`，无其它副本目录。**

> 踩坑原因、排查流程与工程方法论见 **[微信小程序开发踩坑与方法论.md](./微信小程序开发踩坑与方法论.md)**。

---

## 编码后必做（强制）

```bash
npm run rebuild:weapp
```

| 项 | 说明 |
|----|------|
| **何时执行** | 每次修改 `src/`、`config/`、`scripts/` 后；提交或交付前必跑 |
| **编译输出** | 仅 **`dist/`**（含 `app.json`、`pages/`、`assets/` 等） |
| **开发者工具** | 编译成功后刷新；见下方导入方式 |

### 与其它命令的区别

| 命令 | 场景 |
|------|------|
| `npm run dev:weapp` | 本地 watch 开发，持续编译到 `dist/` |
| `npm run build:weapp` | 增量构建到 `dist/` |
| `npm run rebuild:weapp` | 清空 `dist` 后全量构建（**编码结束默认命令**） |

---

## 微信开发者工具导入（二选一）

| 方式 | 打开目录 | 说明 |
|------|----------|------|
| **推荐** | **`dist/`** | `app.json` 与 `project.config.json` 同级；**dist 内不要有** `miniprogramRoot: "./"` |
| 可选 | 仓库根 `xuebatiantianzhan/` | 仅用根目录 `project.config.json`，且为 `"miniprogramRoot": "dist/"` |

**勿混用**：根目录配置是 `dist/`；dist 目录配置应**无** `miniprogramRoot` 字段。若 dist 里出现 `"./"`，执行 `npm run sync:project-config` 修复。

**不要**导入 `src/`。`rebuild:weapp` 会先删除 `dist`，编译完成前勿刷新工具。

---

## 报错：`app.json is not found in the project root directory`

1. 执行：`npm run fix:weapp`，须看到 `[verify-dist] OK dist/app.json`。
2. **推荐**：工具中 **关闭项目** → **导入** → 选择 **`dist` 文件夹**。
3. 若从仓库根导入：确认根目录 `project.config.json` 含 `"miniprogramRoot": "dist/"`（`npm run sync:project-config` 会自动写回）。
4. 仍失败：删除工具内旧项目后重新导入。

---

## 提测前快速自检

- [ ] `npm run rebuild:weapp` 成功
- [ ] `dist/app.json` 存在
- [ ] 开发者工具导入 **`dist/`** 或仓库根（且 `miniprogramRoot: dist/`）
- [ ] Boss 立绘、战宝头像正常，无 `getImageInfo:fail file not found`

---

## AI / 协作提醒

改码后执行 `npm run rebuild:weapp`，确认 `dist/app.json` 存在后再交付。
