/**
 * 修复微信开发者工具 project.config.json。
 * - 仓库根：miniprogramRoot 指向 dist/（从根目录导入时用）
 * - dist/：删除 miniprogramRoot（直接导入 dist 时 app.json 与配置同级，勿用 "./"）
 */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distAppJson = join(root, 'dist/app.json')
const rootConfigPath = join(root, 'project.config.json')
const distConfigPath = join(root, 'dist/project.config.json')
const privateConfigPath = join(root, 'project.private.config.json')

const ROOT_MINIPROGRAM_ROOT = 'dist/'

if (!existsSync(distAppJson)) {
  console.error(
    '\n[sync-project-config] 缺少 dist/app.json，请先执行: npm run rebuild:weapp\n',
  )
  process.exit(1)
}

/**
 * 合并并写回 JSON。
 */
function writeJson(path, patch) {
  const raw = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {}
  const next = { ...raw, ...patch }
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`)
}

writeJson(rootConfigPath, {
  miniprogramRoot: ROOT_MINIPROGRAM_ROOT,
  compileType: 'miniprogram',
})

writeJson(privateConfigPath, {
  miniprogramRoot: ROOT_MINIPROGRAM_ROOT,
})

if (existsSync(distConfigPath)) {
  const distCfg = JSON.parse(readFileSync(distConfigPath, 'utf8'))
  delete distCfg.miniprogramRoot
  distCfg.compileType = 'miniprogram'
  writeFileSync(distConfigPath, `${JSON.stringify(distCfg, null, 2)}\n`)
}

const distReadme = join(root, 'dist/README-微信导入.txt')
writeFileSync(
  distReadme,
  `【微信开发者工具】推荐直接导入本 dist 文件夹。
编译：仓库根目录执行 npm run rebuild:weapp
注意：dist/project.config.json 不应含 miniprogramRoot（构建后已自动删除）。
`,
)

console.log(
  '[sync-project-config] OK 根目录 miniprogramRoot=dist/；dist/ 内已移除 miniprogramRoot',
)
