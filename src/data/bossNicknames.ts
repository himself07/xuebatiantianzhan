/**
 * 母题类型 Boss 外号配置：按「题型」而非具体数字命名。
 */
import nicknamesJson from './bossNicknames.json'

/** 单条母题类型外号（A1 词库 / A3 批量生成写入 JSON） */
export interface BossNicknameEntry {
  topicTypeId: string
  bossKeys: string[]
  topicTypeLabel: string
  dailyNickname: string
  motherTopicSummary: string
  topicExamples: string
  taunt: string
  shareHook: string
  classTalk: string
}

interface BossNicknamesFile {
  version: string
  description: string
  entries: BossNicknameEntry[]
}

const NICKNAME_FILE = nicknamesJson as BossNicknamesFile

const byTopicTypeId = new Map<string, BossNicknameEntry>()
const byBossKey = new Map<string, BossNicknameEntry>()

NICKNAME_FILE.entries.forEach((entry) => {
  byTopicTypeId.set(entry.topicTypeId, entry)
  entry.bossKeys.forEach((key) => byBossKey.set(key, entry))
})

/**
 * 按 Boss key 获取母题类型外号配置。
 */
export const getBossNicknameByKey = (bossKey: string): BossNicknameEntry | undefined =>
  byBossKey.get(bossKey)

/**
 * 按母题类型 ID 获取外号配置。
 */
export const getBossNicknameByTopicType = (topicTypeId: string): BossNicknameEntry | undefined =>
  byTopicTypeId.get(topicTypeId)

/**
 * 获取全部外号条目（供脚本与教研导出）。
 */
export const getAllBossNicknameEntries = (): BossNicknameEntry[] => [...NICKNAME_FILE.entries]

/**
 * 双名展示：今日外号（主）+ 系列 Boss 名（副）。
 */
export const formatBossDualName = (dailyNickname: string, seriesName: string): string =>
  `${dailyNickname}（${seriesName}）`

/**
 * 分享标题（E6）：突出外号 + 母题类型摘要。
 */
export const formatShareTitle = (
  durationSec: number,
  dailyNickname: string,
  motherTopicSummary: string
): string =>
  `我${durationSec}秒击败${dailyNickname}！母题：${motherTopicSummary}，敢挑战吗？`
