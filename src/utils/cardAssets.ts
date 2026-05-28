/**
 * 卡牌静态资源映射与样式工具。
 */

import card01 from '../assets/cards/portraits/card_01.jpg'
import card02 from '../assets/cards/portraits/card_02.jpg'
import card03 from '../assets/cards/portraits/card_03.jpg'
import card04 from '../assets/cards/portraits/card_04.jpg'
import card05 from '../assets/cards/portraits/card_05.jpg'
import card06 from '../assets/cards/portraits/card_06.jpg'
import card07 from '../assets/cards/portraits/card_07.jpg'
import card08 from '../assets/cards/portraits/card_08.jpg'
import card09 from '../assets/cards/portraits/card_09.jpg'
import card10 from '../assets/cards/portraits/card_10.jpg'
import card11 from '../assets/cards/portraits/card_11.jpg'
import card12 from '../assets/cards/portraits/card_12.jpg'
import cardBack from '../assets/cards/backs/card_back.svg'
import type { Card } from '../types/card'

/** 立绘资源表，key 为卡牌 id */
export const CARD_PORTRAIT_MAP: Record<number, string> = {
  1: card01,
  2: card02,
  3: card03,
  4: card04,
  5: card05,
  6: card06,
  7: card07,
  8: card08,
  9: card09,
  10: card10,
  11: card11,
  12: card12,
}

/** 卡背图 */
export const CARD_BACK_SRC = cardBack

/**
 * 获取卡牌立绘地址。
 */
export function getCardPortraitSrc(cardId: number): string {
  return CARD_PORTRAIT_MAP[cardId] || ''
}

/**
 * 根据 Tailwind 风格 color 字段解析渐变起止色。
 */
export function getCardGradient(color: string): { from: string; to: string } {
  const rules: Array<{ key: string; from: string; to: string }> = [
    { key: 'blue', from: '#60A5FA', to: '#2563EB' },
    { key: 'cyan', from: '#22D3EE', to: '#0891B2' },
    { key: 'green', from: '#4ADE80', to: '#16A34A' },
    { key: 'purple', from: '#C084FC', to: '#7C3AED' },
    { key: 'pink', from: '#F472B6', to: '#DB2777' },
    { key: 'orange', from: '#FB923C', to: '#EA580C' },
    { key: 'red', from: '#F87171', to: '#DC2626' },
    { key: 'yellow', from: '#FACC15', to: '#EAB308' },
    { key: 'indigo', from: '#818CF8', to: '#4F46E5' },
  ]
  const fromKey = rules.find((r) => color.includes(r.key))?.from || '#8B5CF6'
  const toParts = color.split('to-')
  const toToken = toParts.length > 1 ? toParts[1].split(' ')[0] : ''
  const toRule = rules.find((r) => toToken.includes(r.key.split('-')[0]))
  const to = toRule?.to || '#EC4899'
  return { from: fromKey, to }
}

/**
 * 稀有度边框与光晕样式。
 */
export function getRarityFrameStyle(rarity: Card['rarity']): {
  borderColor: string
  boxShadow: string
  badgeBg: string
} {
  switch (rarity) {
    case 'SSR':
      return {
        borderColor: '#EF4444',
        boxShadow: '0 0 16px rgba(239,68,68,0.55)',
        badgeBg: 'linear-gradient(90deg,#F59E0B,#EF4444)',
      }
    case 'S':
      return {
        borderColor: '#F97316',
        boxShadow: '0 0 12px rgba(249,115,22,0.45)',
        badgeBg: 'linear-gradient(90deg,#FB923C,#F97316)',
      }
    case 'SR':
      return {
        borderColor: '#A855F7',
        boxShadow: '0 0 10px rgba(168,85,247,0.4)',
        badgeBg: 'linear-gradient(90deg,#C084FC,#A855F7)',
      }
    default:
      return {
        borderColor: '#3B82F6',
        boxShadow: '0 0 8px rgba(59,130,246,0.35)',
        badgeBg: 'linear-gradient(90deg,#60A5FA,#3B82F6)',
      }
  }
}

/** 尺寸预设（宽 x 高，单位 px） */
export const CARD_SIZE_MAP = {
  sm: { width: 72, height: 96 },
  md: { width: 120, height: 160 },
  lg: { width: 160, height: 213 },
  xl: { width: 192, height: 256 },
} as const

export type CardSizeKey = keyof typeof CARD_SIZE_MAP
