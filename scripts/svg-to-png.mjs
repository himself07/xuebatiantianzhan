/**
 * 将 Boss SVG 转为微信小程序可用的 PNG（Image / getImageInfo 不支持 SVG）。
 * 同步写入 dist，便于 watch 模式下未全量 rebuild 时也能加载立绘。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Resvg } from '@resvg/resvg-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../src/assets/bosses')
const distRoot = join(__dirname, '../dist/assets/bosses')

const jobs = [
  { svg: 'portraits/division_slime.svg', png: 'portraits/division_slime.png', width: 512 },
  { svg: 'portraits/multiply_golem.svg', png: 'portraits/multiply_golem.png', width: 512 },
  { svg: 'portraits/word_dragon.svg', png: 'portraits/word_dragon.png', width: 512 },
  { svg: 'mascot_zhanbao.svg', png: 'mascot_zhanbao.png', width: 128 },
]

jobs.forEach(({ svg, png, width }) => {
  const svgPath = join(root, svg)
  const pngPath = join(root, png)
  const svgContent = readFileSync(svgPath, 'utf8')
  const resvg = new Resvg(svgContent, {
    fitTo: { mode: 'width', value: width },
  })
  const rendered = resvg.render()
  const buffer = rendered.asPng()
  writeFileSync(pngPath, buffer)
  const distPngPath = join(distRoot, png)
  const distDir = dirname(distPngPath)
  if (!existsSync(distDir)) {
    mkdirSync(distDir, { recursive: true })
  }
  writeFileSync(distPngPath, buffer)
  console.log('OK', png)
})
