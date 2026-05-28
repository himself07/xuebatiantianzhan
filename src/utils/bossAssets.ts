/**
 * Boss 立绘与主题色资源映射。
 * PNG 经 webpack 打包（与 cardAssets 一致），避免页面相对路径解析到 pages/当前页/assets。
 */

import Taro from '@tarojs/taro'
import divisionSlimePng from '../assets/bosses/portraits/division_slime.png'
import multiplyGolemPng from '../assets/bosses/portraits/multiply_golem.png'
import wordDragonPng from '../assets/bosses/portraits/word_dragon.png'
import mascotZhanbaoPng from '../assets/bosses/mascot_zhanbao.png'

/** Boss 静态立绘（由 npm run gen:boss-png 从 SVG 生成） */
const BOSS_PORTRAIT_SRC = {
  division_slime: divisionSlimePng,
  multiply_golem: multiplyGolemPng,
  word_dragon: wordDragonPng,
} as const

export type BossPortraitKey = keyof typeof BOSS_PORTRAIT_SRC

/**
 * 已入库的 idle APNG（未放入前勿配置，否则会触发 getImageInfo 报错）。
 * 文件就绪后在此增加 import 与映射，例如：
 * import divisionSlimeIdle from '../assets/bosses/portraits/division_slime_idle.apng'
 */
const BOSS_IDLE_APNG_SRC: Partial<Record<BossPortraitKey, string>> = {}

export interface BossPortraitResolved {
  src: string
  /** 是否使用 APNG（否则为 PNG + CSS 呼吸动效） */
  animated: boolean
}

export const MASCOT_PORTRAIT_SRC = mascotZhanbaoPng

/** 海报与 UI 主题色 */
export const BOSS_THEME_MAP: Record<
  string,
  { primary: string; secondary: string; accent: string; glow: string }
> = {
  division_slime: {
    primary: '#10b981',
    secondary: '#064e3b',
    accent: '#6ee7b7',
    glow: 'rgba(16,185,129,0.45)',
  },
  multiply_golem: {
    primary: '#78716c',
    secondary: '#292524',
    accent: '#fbbf24',
    glow: 'rgba(251,191,36,0.4)',
  },
  word_dragon: {
    primary: '#ea580c',
    secondary: '#7c2d12',
    accent: '#fdba74',
    glow: 'rgba(249,115,22,0.45)',
  },
}

/**
 * 获取 Boss 立绘地址（供 Image / getImageInfo 使用）。
 */
export function getBossPortraitSrc(bossKey: string): string {
  return BOSS_PORTRAIT_SRC[bossKey as BossPortraitKey] || ''
}

/**
 * 解析战斗用立绘：有 APNG 则用 APNG，否则 PNG。
 */
export function resolveBossPortraitDisplaySrc(bossKey: string): Promise<BossPortraitResolved> {
  const png = getBossPortraitSrc(bossKey)
  const apng = BOSS_IDLE_APNG_SRC[bossKey as BossPortraitKey]
  if (!png) {
    return Promise.resolve({ src: '', animated: false })
  }
  if (!apng) {
    return Promise.resolve({ src: png, animated: false })
  }
  return new Promise((resolve) => {
    Taro.getImageInfo({
      src: apng,
      success: () => resolve({ src: apng, animated: true }),
      fail: () => resolve({ src: png, animated: false }),
    })
  })
}

/**
 * 获取 Boss 主题色。
 */
export function getBossTheme(bossKey: string) {
  return (
    BOSS_THEME_MAP[bossKey] || {
      primary: '#7c3aed',
      secondary: '#4f46e5',
      accent: '#c4b5fd',
      glow: 'rgba(124,58,237,0.4)',
    }
  )
}

/**
 * 解析为 canvas 可用的本地路径（getImageInfo 成功时返回 path）。
 */
export function resolveBossImageLocalPath(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!src) {
      reject(new Error('empty boss image'))
      return
    }
    Taro.getImageInfo({
      src,
      success: (res) => resolve(res.path || src),
      fail: (err) => reject(err),
    })
  })
}
