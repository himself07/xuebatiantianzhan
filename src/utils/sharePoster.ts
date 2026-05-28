import Taro from '@tarojs/taro'
import { RANK_THRESHOLDS } from './storage'
import {
  getBossPortraitSrc,
  getBossTheme,
  MASCOT_PORTRAIT_SRC,
  resolveBossImageLocalPath,
} from './bossAssets'

export interface DailyPosterPayload {
  bossKey: string
  /** 今日外号（海报主标题） */
  dailyNickname: string
  /** 系列 Boss 名（副标题） */
  seriesName: string
  correctCount: number
  totalCount: number
  durationSec: number
  /** 母题类型一句话 */
  motherTopicSummary: string
  topicTypeLabel: string
  rankPoints: number
  classClearHint: string
  passed: boolean
}

export const SHARE_CANVAS_ID = 'dailySharePosterCanvas'
/** 微信分享推荐比例 5:8 */
export const POSTER_WIDTH = 750
export const POSTER_HEIGHT = 1200
const EXPORT_SCALE = 2

interface CanvasNodeResult {
  node: WechatMiniprogram.Canvas
  width: number
  height: number
}

/**
 * 获取当前段位展示名。
 */
const getRankLabel = (points: number): string => {
  const rank = RANK_THRESHOLDS.find((item) => points < item.max)
  return rank ? rank.name : '青铜Ⅰ'
}

/**
 * 查询同层 Canvas 2D 节点。
 */
const queryCanvasNode = (canvasId: string): Promise<CanvasNodeResult> =>
  new Promise((resolve, reject) => {
    Taro.createSelectorQuery()
      .select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        const item = res?.[0] as CanvasNodeResult | undefined
        if (!item?.node) {
          reject(new Error('canvas 2d node not found'))
          return
        }
        resolve(item)
      })
  })

/**
 * 加载图片到 Canvas 2D。
 */
const loadCanvasImage = (
  canvas: WechatMiniprogram.Canvas,
  src: string
): Promise<WechatMiniprogram.Image> =>
  new Promise((resolve, reject) => {
    const image = canvas.createImage()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

/**
 * 绘制圆角矩形并填充。
 */
const fillRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fillStyle: string
) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.fillStyle = fillStyle
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arc(x + w - radius, y + radius, radius, -Math.PI / 2, 0)
  ctx.lineTo(x + w, y + h - radius)
  ctx.arc(x + w - radius, y + h - radius, radius, 0, Math.PI / 2)
  ctx.lineTo(x + radius, y + h)
  ctx.arc(x + radius, y + h - radius, radius, Math.PI / 2, Math.PI)
  ctx.lineTo(x, y + radius)
  ctx.arc(x + radius, y + radius, radius, Math.PI, (Math.PI * 3) / 2)
  ctx.closePath()
  ctx.fill()
}

/**
 * 导出 Canvas 为临时 PNG 路径。
 */
const exportCanvasToTempFile = (canvas: WechatMiniprogram.Canvas): Promise<string> =>
  new Promise((resolve, reject) => {
    Taro.canvasToTempFilePath({
      canvas,
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      destWidth: POSTER_WIDTH * EXPORT_SCALE,
      destHeight: POSTER_HEIGHT * EXPORT_SCALE,
      fileType: 'png',
      quality: 1,
      success: (res) => resolve(res.tempFilePath),
      fail: (err) => reject(err),
    })
  })

/**
 * 绘制每日 Boss 战绩分享海报（Canvas 2D，1500×2400 导出）。
 */
export const generateDailyChallengePoster = async (
  payload: DailyPosterPayload,
  canvasId = SHARE_CANVAS_ID
): Promise<string> => {
  const theme = getBossTheme(payload.bossKey)
  const bossSrc = getBossPortraitSrc(payload.bossKey)

  const [bossPath, mascotPath] = await Promise.all([
    bossSrc ? resolveBossImageLocalPath(bossSrc).catch(() => '') : Promise.resolve(''),
    MASCOT_PORTRAIT_SRC ? resolveBossImageLocalPath(MASCOT_PORTRAIT_SRC).catch(() => '') : Promise.resolve(''),
  ])

  const { node: canvas } = await queryCanvasNode(canvasId)
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!ctx) {
    throw new Error('canvas 2d context unavailable')
  }

  const W = POSTER_WIDTH
  const H = POSTER_HEIGHT
  const dpr = Taro.getWindowInfo?.().pixelRatio || Taro.getSystemInfoSync().pixelRatio || 2

  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)

  const bgGrad = ctx.createLinearGradient(0, 0, W, H)
  bgGrad.addColorStop(0, theme.secondary)
  bgGrad.addColorStop(0.55, '#1e1b4b')
  bgGrad.addColorStop(1, '#0f172a')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = theme.glow
  ctx.beginPath()
  ctx.arc(W * 0.82, H * 0.12, 120, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(W * 0.15, H * 0.55, 90, 0, Math.PI * 2)
  ctx.fill()

  fillRoundRect(ctx, 36, 48, W - 72, H - 96, 32, 'rgba(255,255,255,0.97)')

  const headerGrad = ctx.createLinearGradient(36, 48, W - 36, 200)
  headerGrad.addColorStop(0, theme.primary)
  headerGrad.addColorStop(1, theme.secondary)
  fillRoundRect(ctx, 36, 48, W - 72, 156, 32, theme.primary)
  ctx.fillStyle = theme.secondary
  ctx.fillRect(36, 140, W - 72, 64)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 34px sans-serif'
  ctx.fillText(payload.passed ? '今日 Boss 已击败' : '今日 Boss 战报', W / 2, 108)

  ctx.font = '22px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.fillText('学霸天天战', W / 2, 148)

  const portraitSize = 300
  const portraitX = (W - portraitSize) / 2
  const portraitY = 200
  fillRoundRect(ctx, portraitX - 8, portraitY - 8, portraitSize + 16, portraitSize + 16, 24, theme.accent)

  if (bossPath) {
    try {
      const bossImg = await loadCanvasImage(canvas, bossPath)
      ctx.drawImage(bossImg, portraitX, portraitY, portraitSize, portraitSize)
    } catch {
      // 立绘加载失败时跳过，不影响海报其余内容
    }
  }

  ctx.fillStyle = '#111827'
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(payload.dailyNickname, W / 2, portraitY + portraitSize + 48)
  ctx.fillStyle = '#6b7280'
  ctx.font = '22px sans-serif'
  ctx.fillText(payload.seriesName, W / 2, portraitY + portraitSize + 78)

  const statY = portraitY + portraitSize + 108
  const statW = (W - 120) / 2
  fillRoundRect(ctx, 60, statY, statW - 10, 130, 20, '#f5f3ff')
  fillRoundRect(ctx, 60 + statW + 10, statY, statW - 10, 130, 20, '#eff6ff')

  ctx.textAlign = 'center'
  ctx.fillStyle = theme.primary
  ctx.font = 'bold 56px sans-serif'
  ctx.fillText(`${payload.correctCount}/${payload.totalCount}`, 60 + statW / 2 - 5, statY + 62)
  ctx.fillStyle = '#2563eb'
  ctx.fillText(`${payload.durationSec}`, 60 + statW + statW / 2 + 5, statY + 62)

  ctx.fillStyle = '#6b7280'
  ctx.font = '24px sans-serif'
  ctx.fillText('答对题数', 60 + statW / 2 - 5, statY + 102)
  ctx.fillText('通关秒数', 60 + statW + statW / 2 + 5, statY + 102)

  const topicY = statY + 160
  fillRoundRect(ctx, 60, topicY, W - 120, 88, 16, '#fef3c7')
  ctx.fillStyle = '#92400e'
  ctx.font = '28px sans-serif'
  ctx.fillText(`母题类型：${payload.topicTypeLabel}`, W / 2, topicY + 36)
  ctx.font = '24px sans-serif'
  ctx.fillText(payload.motherTopicSummary, W / 2, topicY + 68)

  ctx.textAlign = 'left'
  ctx.fillStyle = '#374151'
  ctx.font = '26px sans-serif'
  ctx.fillText(`段位 ${getRankLabel(payload.rankPoints)}`, 72, topicY + 118)
  ctx.fillStyle = '#7c3aed'
  ctx.fillText(payload.classClearHint, 72, topicY + 156)

  const footerY = H - 130
  fillRoundRect(ctx, 60, footerY, W - 120, 88, 20, '#eef2ff')
  if (mascotPath) {
    try {
      const mascotImg = await loadCanvasImage(canvas, mascotPath)
      ctx.drawImage(mascotImg, 76, footerY + 12, 64, 64)
    } catch {
      // ignore
    }
  }
  ctx.fillStyle = '#4338ca'
  ctx.font = 'bold 28px sans-serif'
  ctx.fillText('扫码挑战今日 Boss', 156, footerY + 38)
  ctx.fillStyle = '#6366f1'
  ctx.font = '22px sans-serif'
  ctx.fillText('长按识别小程序 · 同学都在玩', 156, footerY + 72)

  fillRoundRect(ctx, W - 148, footerY + 14, 72, 72, 12, '#ffffff')
  ctx.strokeStyle = '#c7d2fe'
  ctx.lineWidth = 3
  ctx.strokeRect(W - 148, footerY + 14, 72, 72)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#94a3b8'
  ctx.font = '18px sans-serif'
  ctx.fillText('挑战', W - 112, footerY + 56)

  return exportCanvasToTempFile(canvas)
}

export const SHARE_CANVAS_STYLE = {
  width: `${POSTER_WIDTH}px`,
  height: `${POSTER_HEIGHT}px`,
  position: 'fixed' as const,
  left: '-9999px',
  top: '0',
}
