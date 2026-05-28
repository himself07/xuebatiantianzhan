# 《学霸天天战》三 Boss + 战宝 — AI 出图/出视频 Prompt 清单

> 用途：即梦、可灵、通义万相、Midjourney 等工具直接复制。  
> 产出文件命名见 [`小学生产品升级策略`](../.cursor/plans/) Sprint A.2 目录规范。

---

## 0. 全局风格锚定（三张 Boss 必加）

**统一后缀（英文，Midjourney / 可灵国际）**：

```text
elementary school math game boss character, Xueba Tiantianzhan style,
3D cartoon render, Pixar Disney style, soft studio lighting, rim light,
candy colors, round friendly shapes, full body front view, centered,
transparent background, PNG cutout, high detail, 1024x1024,
cute not scary, no blood, no horror, no realistic violence, no text, no watermark
--ar 1:1
```

**统一后缀（中文，即梦 / 通义万相）**：

```text
小学数学教育游戏Boss角色，学霸天天战风格，3D卡通渲染，皮克斯质感，
柔光棚拍，糖果色系，圆润可爱，正面全身居中，透明背景抠图，
高清细节，适合8-10岁儿童，不恐怖不血腥，无文字无水印，1:1方图
```

**全局负向提示词**：

```text
low quality, blurry, jpeg artifacts, realistic photo, horror, gore, teeth monster,
dark evil, weapon blood, text, logo, watermark, multiple characters, side view only,
busy background, classroom, UI frame
```

**风格统一技巧**：先定稿「除法史莱姆」主立绘 → 另两个 Boss 用 **图生图 + 参考图**（上传史莱姆成图，权重 0.3～0.5）只换主体。

---

## 1. 除法史莱姆 `division_slime`

| 字段 | 内容 |
|------|------|
| 中文名 | 除法史莱姆 |
| 主题色 | 翠绿 `#10b981` / 深绿 `#064e3b` / 浅绿 `#6ee7b7` |
| 人设 | 软萌绿色史莱姆，半透明果冻质感，头顶可有小问号或除号符号（符号要圆润卡通） |

### 1.1 静态立绘 `division_slime.png`

**即梦 / 通义（中文）**：

```text
可爱的绿色除法史莱姆怪兽Boss，果冻半透明身体，大眼睛傻笑表情，
头顶有圆润的除号符号装饰，翠绿色主色浅绿高光，
小学数学游戏角色，3D卡通皮克斯风格，正面全身，透明背景，
柔光体积感，糖果色，儿童向，不吓人
```

**Midjourney / 可灵（英文）**：

```text
cute green division slime monster boss, jelly translucent body, big friendly eyes,
goofy smile, small rounded division symbol on head, emerald green #10b981 palette,
elementary math game boss character, Xueba Tiantianzhan style, 3D cartoon Pixar,
full body front view, transparent background, soft studio lighting, candy colors,
cute not scary, no blood --ar 1:1
```

### 1.2 视频 → `division_slime_idle.apng`

**可灵图生视频（上传 1.1 成图）**：

```text
史莱姆轻轻上下弹跳，眨眼，身体微微晃动，果冻质感，
无缝循环，镜头固定，3D卡通，绿色柔光，2秒循环
```

**英文**：

```text
green slime gently bounces up and down, blinks, wobbles like jelly,
seamless loop, static camera, 3D cartoon game character, soft green lighting, 2s
```

### 1.3 视频 → `division_slime_hit.apng`

```text
史莱姆被击中，身体压扁又弹回，冒星星，轻微后仰，
单次动作不循环，0.5秒，3D卡通，透明背景感
```

```text
slime gets hit, squashes and rebounds, cartoon stars pop, slight knockback,
one-shot animation not loop, 0.5s, 3D cartoon
```

### 1.4 视频 → `division_slime_finisher.apng`

```text
史莱姆被母题必杀击败，旋转缩小消失，绿色光爆碎片，
夸张可爱爆炸，无血腥，1.5秒单次，3D卡通全屏感
```

```text
slime defeated by special attack, spins shrinks and pops into green light particles,
cute exaggerated explosion no gore, 1.5s one-shot, 3D cartoon
```

---

## 2. 乘法石怪 `multiply_golem`

| 字段 | 内容 |
|------|------|
| 中文名 | 乘法石怪 |
| 主题色 | 岩石灰 `#78716c` / 深褐 `#292524` / 金黄 `#fbbf24` |
| 人设 | 圆滚滚石头人，身体有乘法符号刻痕，金色眼睛，憨厚凶萌（不恐怖） |

### 2.1 静态立绘 `multiply_golem.png`

**中文**：

```text
可爱的乘法石头怪Boss，圆滚岩石身体，短手短腿，
身上有圆润的乘号刻痕，金黄色眼睛，灰褐色岩石质感带金色高光，
小学数学游戏角色，3D卡通皮克斯风格，正面全身，透明背景，儿童向不恐怖
```

**英文**：

```text
cute multiply golem stone monster boss, round rocky body, short arms legs,
rounded multiplication symbol carved on chest, golden yellow eyes #fbbf24,
gray brown stone texture, elementary math game boss, Xueba style, 3D Pixar cartoon,
full body front, transparent background, friendly not scary --ar 1:1
```

### 2.2 idle → `multiply_golem_idle.apng`

```text
石怪缓慢呼吸，眼睛眨动，身体轻微左右摇摆，灰尘粒子很少，
无缝循环，固定镜头，2秒，3D卡通
```

```text
stone golem slow breathing, eyes blink, slight sway, minimal dust,
seamless loop, static camera, 2s, 3D cartoon
```

### 2.3 hit → `multiply_golem_hit.apng`

```text
石怪被击中，身体裂开又合上，掉小石块，后仰震动，
单次0.5秒，可爱不血腥
```

```text
golem hit, cracks then seals, small pebbles fall, knockback shake,
one-shot 0.5s, cartoon no gore
```

### 2.4 finisher → `multiply_golem_finisher.apng`

```text
石怪被必杀击碎成可爱石块，金色光芒散开，石怪变矮消失，
1.5秒单次，夸张卡通，无血腥
```

```text
golem shattered by finisher, cute rock chunks golden glow, collapses,
1.5s one-shot, exaggerated cartoon
```

---

## 3. 应用题巨龙 `word_dragon`

| 字段 | 内容 |
|------|------|
| 中文名 | 应用题巨龙 |
| 主题色 | 橙红 `#ea580c` / 深橙 `#7c2d12` / 浅橙 `#fdba74` |
| 人设 | Q版小龙，圆头圆身，火焰是卡通橙色光团（非写实火），可叼卷轴/铅笔 |

### 3.1 静态立绘 `word_dragon.png`

**中文**：

```text
可爱的应用题Q版巨龙Boss，圆头圆身短翅膀，
橙色卡通火焰光团绕身（非写实火），叼着卷轴或铅笔，
小学数学游戏角色，3D皮克斯卡通，正面全身，透明背景，友善不吓人
```

**英文**：

```text
cute chibi word problem dragon boss, round head round body small wings,
cartoon orange flame glow not realistic fire, holds scroll or pencil,
elementary math game boss, orange #ea580c palette, 3D Pixar style,
full body front, transparent background, friendly --ar 1:1
```

### 3.2 idle → `word_dragon_idle.apng`

```text
Q版小龙轻轻扇翅膀，尾巴摆动，火焰光团脉动，
无缝循环，固定镜头，2秒，3D卡通
```

```text
chibi dragon flaps wings slowly, tail sways, cartoon flame pulses,
seamless loop, static camera, 2s, 3D cartoon
```

### 3.3 hit → `word_dragon_hit.apng`

```text
小龙被击中，翅膀收起，头上冒星星，身体后仰，
单次0.5秒，可爱风格
```

```text
dragon hit, wings tuck, cartoon stars, knockback,
one-shot 0.5s, cute style
```

### 3.4 finisher → `word_dragon_finisher.apng`

```text
小龙被母题必杀击败，变成橙色光点飞散，卷轴飘落，
1.5秒单次，华丽但儿童向，无恐怖
```

```text
dragon defeated, dissolves into orange light particles, scroll floats down,
1.5s one-shot, sparkly kid-friendly
```

---

## 4. 战宝（必杀幕配角，可选）`mascot_zhanbao.png`

| 字段 | 内容 |
|------|------|
| 角色 | 狐狸学霸 mascot，与 Boss 同套 3D 风格 |

**中文**：

```text
可爱的橙色狐狸学霸吉祥物，戴小眼镜，穿小学制服，
3D皮克斯卡通，正面半身，自信胜利姿势，透明背景，
与数学游戏Boss同一画风，儿童向
```

**英文**：

```text
cute orange fox scholar mascot, small glasses, elementary uniform,
3D Pixar cartoon, front upper body victory pose, transparent background,
same style as math game bosses, kid-friendly --ar 1:1
```

---

## 5. 导出与合成备忘

| 步骤 | 命令/操作 |
|------|-----------|
| 抽帧 | `ffmpeg -i idle.mp4 -vf fps=10 frames/%03d.png` |
| 合成 APNG | `apngasm -o division_slime_idle.apng frames/*.png` |
| 压体积 | TinyPNG / Squoosh，单 Boss 四文件合计 < 680KB |
| 入库 | `src/assets/bosses/portraits/*.png` + `animations/*.apng` |

**出图自检**：透明底干净、主体居中、10 岁能 3 秒认出是谁、与另外两个 Boss 画风一致。

---

## 6. 文件对照表

| Boss key | 立绘 | idle | hit | finisher |
|----------|------|------|-----|----------|
| division_slime | division_slime.png | division_slime_idle.apng | division_slime_hit.apng | division_slime_finisher.apng |
| multiply_golem | multiply_golem.png | multiply_golem_idle.apng | multiply_golem_hit.apng | multiply_golem_finisher.apng |
| word_dragon | word_dragon.png | word_dragon_idle.apng | word_dragon_hit.apng | word_dragon_finisher.apng |
