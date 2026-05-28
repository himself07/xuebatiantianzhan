import { DailyBossConfig } from '../data/dailyBoss'
import { formatBossDualName } from '../data/bossNicknames'

/**
 * 对外展示用的 Boss 名称信息（双名体系 A5）。
 */
export interface BossDisplayInfo {
  /** 系列 Boss 名，如「除法史莱姆」 */
  seriesName: string
  /** 今日外号，如「分糖大盗」 */
  dailyNickname: string
  /** 主展示名：外号（系列名） */
  primaryTitle: string
  /** 母题类型标签，如「平均分问题」 */
  topicTypeLabel: string
  /** 母题类型一句话，如「分东西每人几份」 */
  motherTopicSummary: string
  /** 题型举例（聊天话题） */
  topicExamples: string
  shareHook: string
  classTalk: string
  taunt: string
}

/**
 * 从完整 Boss 配置提取 UI / 分享用展示字段。
 */
export const getBossDisplayInfo = (boss: DailyBossConfig): BossDisplayInfo => ({
  seriesName: boss.name,
  dailyNickname: boss.dailyNickname,
  primaryTitle: formatBossDualName(boss.dailyNickname, boss.name),
  topicTypeLabel: boss.topicTypeLabel,
  motherTopicSummary: boss.motherTopicSummary,
  topicExamples: boss.topicExamples,
  shareHook: boss.shareHook,
  classTalk: boss.classTalk,
  taunt: boss.taunt,
})
