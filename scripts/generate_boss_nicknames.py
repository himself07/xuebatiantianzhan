#!/usr/bin/env python3
"""
A3：按「母题类型」批量生成 Boss 童趣外号，写入 src/data/bossNicknames.json。

用法：
  export OPENAI_API_KEY=sk-...
  python scripts/generate_boss_nicknames.py --dry-run
  python scripts/generate_boss_nicknames.py --write

未配置 API Key 时输出 Prompt 模板，供即梦/通义/ChatGPT 手工生成后粘贴 JSON。
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
NICKNAME_JSON = ROOT / "src" / "data" / "bossNicknames.json"

# 教研输入：母题类型清单（不是具体数字题）
TOPIC_BATCH: list[dict[str, Any]] = [
    {
        "topicTypeId": "equal_share_division",
        "bossKeys": ["division_slime"],
        "topicTypeLabel": "平均分问题",
        "topicBrief": "总量平均分成若干份，求每份多少（除法应用）",
        "exampleProblems": "84颗糖平分给7人；36个苹果分给6人",
    },
    {
        "topicTypeId": "array_multiply",
        "bossKeys": ["multiply_golem"],
        "topicTypeLabel": "乘法应用（几组几个）",
        "topicBrief": "每份数量×份数=总数",
        "exampleProblems": "每盒7支彩笔买8盒；每行6个座位共5行",
    },
    {
        "topicTypeId": "two_step_word",
        "bossKeys": ["word_dragon"],
        "topicTypeLabel": "两步应用题",
        "topicBrief": "先求中间量，再求最终答案（比较或合并）",
        "exampleProblems": "书15元笔比书贵12元；先给15元再给27元",
    },
    {
        "topicTypeId": "cutting_problem",
        "bossKeys": [],
        "topicTypeLabel": "切刀问题",
        "topicBrief": "切几段要几刀，刀数=段数-1",
        "exampleProblems": "猪肠切8块要几刀；切18块要几刀",
    },
]

SYSTEM_PROMPT = """你是小学2-4年级数学游戏文案策划。
任务：为「母题类型」起童趣 Boss 外号——记住是「一类题」，不是某道具体算式。

命名原则：
1. dailyNickname 4-6字，有画面感，可和同学聊天（如「切猪肉怪」对应切刀问题）
2. 禁止把具体数字硬塞进名字（错误：八四分七怪；正确：切猪肉怪、分糖大盗）
3. motherTopicSummary 一句话说清题型（如「切几段要几刀」）
4. topicExamples 用场景举例，可含数字
5. 不恐怖、不血腥、不低俗
6. 输出严格 JSON 对象，字段：dailyNickname, motherTopicSummary, topicExamples, taunt, shareHook, classTalk
"""


def build_user_prompt(item: dict[str, Any]) -> str:
    """构建单条母题类型的用户 Prompt。"""
    return f"""母题类型：{item['topicTypeLabel']}
类型说明：{item['topicBrief']}
例题场景：{item['exampleProblems']}

请生成 JSON（不要 markdown 代码块）。"""


def call_openai(user_prompt: str) -> dict[str, str]:
    """调用 OpenAI 兼容接口生成外号字段。"""
    try:
        import urllib.request

        api_key = os.environ.get("OPENAI_API_KEY", "")
        base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
        if not api_key:
            raise RuntimeError("未设置 OPENAI_API_KEY")

        body = json.dumps(
            {
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.7,
            }
        ).encode("utf-8")

        req = urllib.request.Request(
            f"{base_url}/chat/completions",
            data=body,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        content = data["choices"][0]["message"]["content"].strip()
        return json.loads(content)
    except Exception as exc:
        raise RuntimeError(f"大模型调用失败: {exc}") from exc


def merge_entry(base: dict[str, Any], generated: dict[str, str]) -> dict[str, Any]:
    """合并教研基础字段与生成文案。"""
    return {
        "topicTypeId": base["topicTypeId"],
        "bossKeys": base["bossKeys"],
        "topicTypeLabel": base["topicTypeLabel"],
        "dailyNickname": generated["dailyNickname"],
        "motherTopicSummary": generated["motherTopicSummary"],
        "topicExamples": generated["topicExamples"],
        "taunt": generated["taunt"],
        "shareHook": generated["shareHook"],
        "classTalk": generated["classTalk"],
    }


def print_prompts_only() -> None:
    """无 API Key 时打印 Prompt 供手工生成。"""
    print("=== A3 手工模式：复制以下 Prompt 到大模型 ===\n")
    print(SYSTEM_PROMPT)
    print()
    for item in TOPIC_BATCH:
        print("---")
        print(build_user_prompt(item))
        print()


def main() -> int:
    parser = argparse.ArgumentParser(description="批量生成母题类型 Boss 外号")
    parser.add_argument("--dry-run", action="store_true", help="仅打印，不写文件")
    parser.add_argument("--write", action="store_true", help="写入 bossNicknames.json")
    parser.add_argument("--prompts", action="store_true", help="仅输出 Prompt 模板")
    args = parser.parse_args()

    if args.prompts or (not args.write and not args.dry_run):
        print_prompts_only()
        return 0

    entries: list[dict[str, Any]] = []
    for item in TOPIC_BATCH:
        user_prompt = build_user_prompt(item)
        if args.dry_run:
            print(f"[dry-run] {item['topicTypeId']}")
            print(user_prompt)
            continue
        generated = call_openai(user_prompt)
        entries.append(merge_entry(item, generated))

    if args.dry_run:
        return 0

    payload = {
        "version": "1.0.0",
        "description": "母题类型 → 童趣 Boss 外号（A3 批量生成，需教研抽检）",
        "entries": entries,
    }
    NICKNAME_JSON.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"已写入 {NICKNAME_JSON}，共 {len(entries)} 条。请教研抽检后提交。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
