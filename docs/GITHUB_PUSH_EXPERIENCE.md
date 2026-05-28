# GitHub 推送经验备忘

> 沉淀自 2026-05-28 将 `aiwriter-r2-duanju` 首次推送到私有仓库的完整过程。  
> 账号与代理等个人信息见 [`personal_account_information.md`](personal_account_information.md)。

---

## 1. 背景与目标

- **目标**：在 GitHub 新建私有仓库，推送本项目代码。
- **环境**：macOS，需代理访问 GitHub（`127.0.0.1:16187`）。
- **初始状态**：项目目录**未** `git init`；本机**未**安装/登录 `gh`；SSH 公钥未配置到 GitHub。

---

## 2. 推荐流程（已成功验证）

```bash
cd /Users/lwb/Desktop/baidudisk/python/aiwriter-r2-duanju

# 1) 代理（访问 GitHub / gh API 必备）
export http_proxy=http://127.0.0.1:16187
export https_proxy=http://127.0.0.1:16187
export HTTP_PROXY=http://127.0.0.1:16187
export HTTPS_PROXY=http://127.0.0.1:16187

# 2) 安装 GitHub CLI（若未安装）
brew install gh

# 3) 在 .env 写入 GITHUB_TOKEN（Classic，勾选 repo 权限）
#    验证 token 是否有效（应返回 200）：
source .env  # 或手动 export GITHUB_TOKEN=...
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user

# 4) 用 token 登录 gh（非交互，适合脚本/Agent）
echo "$GITHUB_TOKEN" | gh auth login --with-token
gh auth status

# 5) 一键创建私有库并推送
bash scripts/push_to_github.sh aiwriter-r2-duanju private
```

**成功结果示例：**

- 仓库：https://github.com/himself07/aiwriter-r2-duanju
- 分支：`main`
- Remote：`origin` → `https://github.com/himself07/aiwriter-r2-duanju.git`

---

## 3. 推送前必做：`.gitignore`

避免密钥与大文件入库。本项目已配置排除：

| 类别 | 路径/规则 |
|------|-----------|
| 密钥 | `.env` |
| 本地向量库/数据库 | `data/processed/*.db`、`vector_index.json`、ingest 日志等 |
| 在线创作完整日志 | `data/outputs/generation_runs/` |
| 对标原书 | `data/raw_books/*.docx` 等 |

**应提交**：`app/`、`scripts/`、`tests/`、`docs/`、`requirements.txt`、`.env.example`、`README.MD`、示例输出（如 `demo_story.md`）。

---

## 4. 项目内自动化脚本

### `scripts/push_to_github.sh`

```bash
# 默认：私有库 aiwriter-r2-duanju
bash scripts/push_to_github.sh

# 指定仓库名 + 可见性
bash scripts/push_to_github.sh my-repo-name private
bash scripts/push_to_github.sh my-repo-name public
```

脚本逻辑：

1. 检查 `gh auth status`，未登录则提示先 `gh auth login` 或 token 登录。
2. 若无 `.git` 则 `git init -b main`。
3. 若无 commit 则自动 `git add -A && git commit`。
4. 若无 `origin` 则 `gh repo create ... --push`；已有 remote 则 `git push -u origin main`。

---

## 5. 踩坑与解法

### 5.1 `gh: command not found`

```bash
brew install gh
# Apple Silicon 常见路径：/opt/homebrew/bin/gh
```

### 5.2 `You are not logged into any GitHub hosts`

两种方式任选：

**A. 浏览器授权（交互）**

```bash
gh auth login --git-protocol https --web
```

**B. Token 非交互（推荐，可写入 .env）**

```bash
echo "$GITHUB_TOKEN" | gh auth login --with-token
```

### 5.3 Token 401 `Bad credentials`

现象：`gh auth login --with-token` 或 `curl api.github.com/user` 返回 401。

常见原因：

1. Token 复制不完整（缺字符、多空格/换行）
2. Token 已过期或被撤销
3. Classic Token 未勾选 **`repo`** 权限
4. Fine-grained Token 权限/资源范围配置不对

**排查命令：**

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user
# 200 = 有效；401 = 需重新生成
```

**本次实测**：第一次 token 401；重新生成 Classic Token（`repo` 权限）后 200，推送成功。

### 5.4 `git@github.com: Permission denied (publickey)`

说明未配置 SSH Key。本项目改用 **HTTPS + gh/token**，无需配 SSH。

### 5.5 Agent/CI 无法交互 `gh auth login --web`

必须用 **PAT + `--with-token`**，或事先在 keyring 完成登录。

### 5.6 代理

未设置代理时，`gh` / `git push` 可能超时或失败。推送前务必 `export http_proxy/https_proxy`。

---

## 6. 首次推送时的 Git 提交

本地已执行（供对照）：

```bash
git init -b main
git add -A
git commit -m "Initial commit: 凤凰引擎 V3 在线故事卡流水线。"
# 后续 docs 等变更再单独 commit
```

Commit 时使用 `-c user.name=... -c user.email=...` 可避免改动全局 git config。

---

## 7. 后续日常更新

```bash
export http_proxy=http://127.0.0.1:16187 https_proxy=http://127.0.0.1:16187

git status
git add -A
git commit -m "说明本次改动"
git push
```

或仓库已存在时：

```bash
bash scripts/push_to_github.sh   # 仅 push，不重复建库
```

---

## 8. 安全清单

- [ ] `.env` 已在 `.gitignore`，**永不提交**
- [ ] `GITHUB_TOKEN`、DeepSeek Key 只放 `.env`，文档里只写变量名
- [ ] Token 泄露 → GitHub Settings 立即 Revoke 并轮换
- [ ] 仓库若改 Public → 检查 `docs/personal_account_information.md` 等是否需脱敏

---

## 9. 相关文件

| 文件 | 说明 |
|------|------|
| `scripts/push_to_github.sh` | 创建仓库 + 推送 |
| `.gitignore` | 排除密钥与大数据 |
| `.env.example` | 环境变量模板 |
| `docs/personal_account_information.md` | 账号、代理、仓库 URL |

---

## 10. 一句话总结

**mac 上带代理 → 安装 `gh` → `.env` 放有效 `GITHUB_TOKEN` → `gh auth login --with-token` → `bash scripts/push_to_github.sh`；Token 401 就重新生成 Classic PAT 并勾选 `repo`。**
