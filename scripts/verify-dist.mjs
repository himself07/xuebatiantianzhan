/**
 * 校验 dist 是否已完整编译（微信开发者工具依赖 dist/app.json）。
 */
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const appJson = join(root, 'dist/app.json')

if (!existsSync(appJson)) {
  console.error(
    '\n[verify-dist] 未找到 dist/app.json。\n' +
      '请先执行: npm run rebuild:weapp\n' +
      '微信开发者工具请打开「仓库根目录」或「dist 目录」（须已编译）。\n',
  )
  process.exit(1)
}

console.log('[verify-dist] OK dist/app.json')
