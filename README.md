
# 学霸天天战产品原型设计

这是一个腾讯小程序项目。

This is a code bundle for 学霸天天战产品原型设计. The original project is available at [Figma 原型链接](https://www.figma.com/design/QQN4BqYnKRRcWjfnL4iS29/%E5%AD%A6%E9%9C%B8%E5%A4%A9%E5%A4%A9%E6%88%98%E4%BA%A7%E5%93%81%E5%8E%9F%E5%9E%8B%E8%AE%BE%E8%AE%A1).

## 竞技场模式变更

- 竞技场由“做题对抗”升级为“卡牌对战”。
- 每张卡牌包含 `攻击`、`防御`、`生命值`、`技能倍率` 属性。
- 竞技场升级为队伍对战：最多选择5张卡牌出战，双方卡牌轮流出列自动战斗。
- 每张卡牌普攻两次后会释放一次主动技能，技能类型支持伤害、治疗、增益。
- 对战过程提供出列高亮、受击反馈、技能提示与实时战斗日志，整体更具动感。
- 战斗内支持 `1x/2x` 倍速切换与“暂停/继续”控制，便于课堂演示与个体观察。

## 页面体系整理

- 当前仅保留并维护小程序页面体系：`src/pages`。
- 历史 Web 原型体系已物理迁移至 `archive/web-app`（见 `archive/web-app/ARCHIVED.md`）。
- 小程序主入口与路由分别为 `src/app.tsx` 与 `src/app.config.ts`。

## 导航与跳转优化

- 小程序默认页调整为 `MainWorldPage`，减少“默认页与主页面”认知冲突。
- 主世界补充了 `学习乐园` 与 `校长室` 入口，避免功能页不可达。
- 子页面返回统一采用“优先 `navigateBack`，无历史栈时 `switchTab` 回主世界”的策略，避免重复压栈和返回链路混乱。
- 主导航升级为原生 `tabBar`（首页/任务/卡牌/我的），跨主栏目统一使用 `switchTab` 语义。
- Tab 页顶部交互统一为“回首页/关闭”规范：任务/卡牌/我的页提供“回首页”，首页提供“关闭”。

## 视觉与可达性优化

- 首页与学习乐园改为更简洁的“卡片+快捷入口”布局，主功能可一屏直达。
- 主色调调整为明亮糖果系，圆角和留白增大，更符合低龄用户审美。
- 主页优先呈现核心动作（挑战、任务、卡牌、竞技），降低进入门槛。

## 三项“小而明显”体验增强

- 统一按钮系统：主按钮、次按钮、文本按钮的圆角、间距和色彩语义统一，跨页操作感受更一致。
- 页面密度分级：首页与学习乐园默认仅展示核心入口，非高频功能改为“展开/收起”，避免首屏过载。
- 关键动效微增强：主入口按钮加入轻量呼吸动效，强化视觉引导但不干扰阅读。

## 仓库与性能优化（最新）

- 卡牌仓库新增“一键可合成”可视标记：当同名同星材料满足升级条件时，卡片会展示可合成角标。
- 仓库列表新增“可合成 N 种”统计，并在不可合成卡片上显示材料进度（如 `1/2`）。
- 首页与学习乐园移除 `setInterval` 驱动的整页重渲染动效，改为静态重点样式，提升点击响应速度。

## 每日挑战奖励修复（最新）

- 修复 `claimDailyChallengeReward is not a function` 报错，补齐存储层领奖接口并统一返回结构。
- 每日挑战改为统一走 `StorageManager.completeDailyChallenge()` 与 `StorageManager.claimDailyChallengeReward()`，避免页面直接手写 JSON 导致状态错乱。
- 日切重置中补充每日挑战领奖状态重置（完成标记、已领奖标记、答对题数）。

## 导航超时修复（最新）

- 新增 `src/utils/navigation.ts` 统一安全导航：自动识别 tab 页、导航并发锁、防重复点击触发。
- 针对 tab 页跳转失败增加 `reLaunch` 兜底，修复 `switchTab:fail timeout` 场景。
- 主世界、学习乐园、卡牌仓库改为统一使用安全导航，点击卡牌中心更稳定。

## 每日入门流程（最新）

- 移除「学习乐园」页面，避免与首页功能重叠。
- 小程序启动后先进入 `DailyGatePage`：签到领取金币和体力，再进入每日挑战。
- 每日挑战完成后点击「进入首页」，才进入主世界（tabBar 首页）。
- 当日已完成挑战的用户，再次打开小程序将直接进入首页。

## 产品沉淀文档

- **[儿童教育游戏化方法论 — PM 总纲](docs/PM-儿童教育游戏化方法论.md)**（**建议先读**）：酷感/记忆/传播公式、五维框架、母题类型命名原则、最小闭环与体验包 ABC、验证指标、本次沟通决策时间线。
- **[开发构建清单（编码后必做）](docs/dev-build-checklist.md)**：每次改码后执行 `npm run rebuild:weapp`，避免 `dist` 过期导致图片/编译异常。
- **[微信小程序开发踩坑与方法论](docs/微信小程序开发踩坑与方法论.md)**：`app.json` / `miniprogramRoot`、Boss 立绘 PNG、导入 `dist` 等联调经验与排查流程。
- **[酷感与传播升级 — PM 参考](docs/PM-酷感传播升级沉淀.md)**：问题诊断、三周节奏、传播飞轮、指标、小程序踩坑与后续优先级（供产品/运营/设计查阅）。
- **[小学生产品升级策略 — PM 参考](docs/PM-小学生产品升级策略.md)**：五维升级（更酷/更好玩/更有效/更特色/更传播）、教育闭环、四周节奏、传播文案库、PM 优化经验沉淀。
- **[母题类型 Boss 命名 — PM 参考](docs/PM-母题类型Boss命名.md)**：按「题型」起童趣外号（如切猪肉怪）、双名体系、A1/A3 流程、最小闭环验证指标。

## 母题类型 Boss 外号（最新）

- **命名原则**：外号绑「母题类型」（如切刀问题→切猪肉怪），**不**把 `84÷7` 等数字硬编进名字。
- **双名展示**：今日外号（主）+ 系列 Boss 名（副），见 `src/data/bossNicknames.json`、`mergeBossNickname`。
- **最小闭环**：Gate 通缉令（B2）、连击 UI（B3）、全链路外号（A6）、分享标题（E6）、结算「记住两个词」卡片。
- **A3 批量生成**：`python scripts/generate_boss_nicknames.py --prompts` / `--write`（需 `OPENAI_API_KEY`，写入前教研抽检）。

## 包 A：Boss 动效与弱点条（最新）

- **Boss idle**：`BossPortrait` 优先加载 `*_idle.apng`，无文件时用 PNG + 呼吸动效（见 `src/assets/bosses/portraits/README.md`）。
- **弱点条**：答错点亮 1～3 格弱点；同题再答伤害每层 +20%（`calcWeaknessDamage`）。
- **再打一拳**：错答后可「弱点再打一拳」或「先打下一题」。

## P0 主链路手感升级（最新）

- **招式化反馈**：答对显示「除法斩！」「连击除！」等招式名（`getMoveName` in `src/data/dailyBoss.ts`）。
- **战宝 IP 统一**：Gate / Boss 战 / 结算 / 战宝小屋统一 mascot 与 `MascotBubble` 组件。
- **Boss 动效**：立绘 idle 浮动、受击闪白、招式名飘字（`src/components/BossBattle/BossHeader.tsx`）。
- **音效包**：`src/utils/sfx.ts` + `src/assets/sfx/*.wav`（`npm run gen:sfx`）；默认静音，Boss 战页可切换。
- **Gate 开场预告**：Boss 立绘 + 大号「母题」+ 挑衅语，已签到用户预览约 1.4s 后进入战斗。

## 酷感与传播升级

- **今日 Boss 战**：每日闯关改为 Boss 血条对战，答对触发伤害数字、震动与「母题必杀」动画（`src/data/dailyBoss.ts`、`src/pages/DailyChallengePage`）。
- **战绩海报分享**：结算页 canvas 生成 **1500×2400 高清 PNG**（2 倍导出），嵌入 Boss 立绘 + 战宝 mascot；支持预览与 `onShareAppMessage`；首次分享 +5 金币（`src/utils/sharePoster.ts`）。
- **Boss 高清立绘**：源文件为 SVG，经 `npm run gen:boss-png` 生成 PNG；`bossAssets.ts` 通过 webpack `import` 引用（与卡牌立绘一致）。首次克隆或更新 SVG 后请执行 `npm run gen:assets` 再编译。
- **IP 统一**：固定 mascot「战宝」贯穿 Gate/闯关/结算；奖励文案使用「学霸力」；卡牌名称去教务化（`src/constants/theme.ts`、`src/types/card.ts`）。
- **班级传播 MVP**：班级周榜（Boss 击败数）、领地 12 格点亮、班级码加入（`src/pages/ClassroomPage`、`StorageManager.classInfo`）。
- **竞技场联动**：完成 Boss 战后，匹配母题属性的卡牌攻击 +10%（`CARD_KNOWLEDGE_TAGS` + `ArenaPage`）。
- **抽卡高光**：SSR 抽中全屏 2 秒展示（`CardCenterPage`）。
- **Boss 战前热身**：首页「更多功能」新增 `FunQuizPage` 入口。
- **通关仪式感**：Gate 完成后进入主世界前 toast「校园大门已打开」。

## 项目轻量化（最新）

- 移除 Figma Web 原型遗留依赖（MUI、Radix、Vite、Tailwind 等），`package.json` 仅保留 Taro + React 核心。
- 删除 H5 双构建入口（`vite.config.ts`、`index.html`、`src/main.tsx`），项目专注微信小程序。
- 路由配置以 `src/app.config.ts` 为唯一来源，不再在 `config/index.ts` 重复维护 `pages`。
- 构建编译器保留 Webpack5（Vite 编译器与当前 Taro 4.2 存在兼容问题，待后续升级再切换）。

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev:weapp` to start WeChat mini-program watch build.

Run `npm run build:weapp` to generate mini-program files in `dist/`（增量，不清空 `dist`）。

### 编码后必做（强制）

```bash
npm run rebuild:weapp
```

每次修改 `src/` 或构建相关配置后执行：清空 `dist` → 生成 Boss PNG / 音效 → 全量编译。详见 **[docs/dev-build-checklist.md](docs/dev-build-checklist.md)**。

编译产物仅在 **`dist/`**。微信开发者工具推荐直接导入 **`dist` 文件夹**；亦可导入仓库根目录（`miniprogramRoot` 指向 `dist/`）。须先 `npm run fix:weapp`。

## 卡牌素材升级（最新）

- 统一以 `src/types/card.ts` 的 **12 张数学主题卡** 为唯一数据源，抽卡中心、仓库、竞技场、教室页共用。
- 新增 `src/assets/cards/` 本地高清立绘（JPEG）与卡背；占位 SVG 可由 `scripts/generate_card_assets.py` 重新生成。
- 新增共享组件 `src/components/GameCard`，按稀有度展示边框、立绘与属性，未获得卡显示卡背/剪影。
- 旧版学科卡 `ownedCards` 会在读取进度时自动过滤无效 id，避免仓库空白。

### 替换立绘

1. 将新图命名为 `card_01.jpg` … `card_12.jpg` 放入 `src/assets/cards/portraits/`（建议宽 720px、单张 &lt; 150KB）。
2. 执行 `npm run rebuild:weapp` 重新编译。

## 验证与测试清单

- 金币一致性：在个人页与抽卡页来回切换，金币应一致实时刷新。
- 队伍对战流程：选择5张卡牌后开战，应为当前上阵卡牌持续战斗，被击倒后下一张补位。
- 技能规则：每张卡牌普攻2次后触发1次主动技能（伤害/治疗/增益）。
- Tab 交互：任务/卡牌/我的顶部“回首页”应可直达首页；首页“关闭”应弹确认。
- 构建校验：执行 `npm run rebuild:weapp`，确认编译通过且 `dist/app.json` 正常生成。
- 抽卡入库校验：连续抽卡后进入仓库，`我的卡牌` 数量应与抽取结果一致，不再出现空仓库。
- 合成升级校验：同名同星卡牌达到消耗条件后，可在升级弹窗中选择材料并完成升级。
- 卡牌立绘校验：抽卡中心、仓库、竞技场选队应显示立绘卡片（非纯 emoji），未获得卡显示卡背或「未获得」。
  