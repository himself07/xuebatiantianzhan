#!/usr/bin/env python3
"""
生成卡牌 SVG 立绘与卡背资源。

输出目录：src/assets/cards/
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "src" / "assets" / "cards"
PORTRAITS = OUT / "portraits"
BACKS = OUT / "backs"

# id, 主色, 辅色, 符号(装饰)
CARDS = [
    (1, "#60A5FA", "#2563EB", "+"),
    (2, "#C084FC", "#7C3AED", "×"),
    (3, "#4ADE80", "#16A34A", "△"),
    (4, "#FB923C", "#EA580C", "★"),
    (5, "#F472B6", "#DB2777", "?"),
    (6, "#22D3EE", "#0891B2", "−"),
    (7, "#FACC15", "#CA8A04", "÷"),
    (8, "#818CF8", "#4F46E5", "½"),
    (9, "#F87171", "#DC2626", "♛"),
    (10, "#FDE047", "#EAB308", "⚡"),
    (11, "#FB7185", "#E11D48", "↺"),
    (12, "#A78BFA", "#7C3AED", "☯"),
]


def portrait_svg(card_id: int, c1: str, c2: str, symbol: str) -> str:
    """生成单张 Q 版风格立绘 SVG。"""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <defs>
    <linearGradient id="bg{card_id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{c1}"/>
      <stop offset="100%" style="stop-color:{c2}"/>
    </linearGradient>
    <linearGradient id="shine{card_id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.35"/>
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" rx="24" fill="url(#bg{card_id})"/>
  <ellipse cx="150" cy="340" rx="90" ry="18" fill="#000000" opacity="0.12"/>
  <rect x="40" y="60" width="220" height="280" rx="20" fill="url(#shine{card_id})"/>
  <circle cx="150" cy="130" r="52" fill="#FFE4C4"/>
  <circle cx="130" cy="125" r="6" fill="#1F2937"/>
  <circle cx="170" cy="125" r="6" fill="#1F2937"/>
  <path d="M 135 148 Q 150 158 165 148" stroke="#1F2937" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="150" cy="250" rx="58" ry="70" fill="#FFFFFF" opacity="0.92"/>
  <ellipse cx="150" cy="250" rx="48" ry="58" fill="{c2}" opacity="0.25"/>
  <text x="150" y="265" text-anchor="middle" font-size="56" font-weight="bold" fill="{c2}" font-family="Arial,sans-serif">{symbol}</text>
  <circle cx="95" cy="200" r="14" fill="#FFE4C4"/>
  <circle cx="205" cy="200" r="14" fill="#FFE4C4"/>
</svg>'''


def card_back_svg() -> str:
    """生成卡背 SVG。"""
    return '''<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
  <defs>
    <linearGradient id="backBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED"/>
      <stop offset="50%" style="stop-color:#DB2777"/>
      <stop offset="100%" style="stop-color:#EA580C"/>
    </linearGradient>
  </defs>
  <rect width="300" height="400" rx="24" fill="url(#backBg)"/>
  <rect x="20" y="20" width="260" height="360" rx="18" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>
  <polygon points="150,100 185,175 265,175 200,225 225,305 150,260 75,305 100,225 35,175 115,175" fill="#FDE047" opacity="0.95"/>
  <text x="150" y="355" text-anchor="middle" font-size="22" fill="#FFFFFF" font-family="Arial,sans-serif" font-weight="bold">学霸卡牌</text>
</svg>'''


def main() -> None:
    """写入全部 SVG 资源文件。"""
    PORTRAITS.mkdir(parents=True, exist_ok=True)
    BACKS.mkdir(parents=True, exist_ok=True)
    for card_id, c1, c2, symbol in CARDS:
        path = PORTRAITS / f"card_{card_id:02d}.svg"
        path.write_text(portrait_svg(card_id, c1, c2, symbol), encoding="utf-8")
        print(f"Wrote {path}")
    back_path = BACKS / "card_back.svg"
    back_path.write_text(card_back_svg(), encoding="utf-8")
    print(f"Wrote {back_path}")


if __name__ == "__main__":
    main()
