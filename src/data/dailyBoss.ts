/**
 * 每日 Boss 战题组与 Boss 人设配置。
 */
import { getBossNicknameByKey, getBossNicknameByTopicType } from './bossNicknames'

export type StageType = 'review' | 'learn' | 'boss'

export interface ChallengeQuestion {
  id: number
  stage: StageType
  question: string
  options: string[]
  correctAnswer: number
  hint: string
  knowledge: string
  knowledgeTag: string
  timeLimitSec: number
  reward: { coins: number; knowledge: number }
  attackDamage: number
}

/** Boss 基础配置（系列立绘 + 题组 + 母题类型 ID） */
export interface DailyBossBaseConfig {
  key: string
  /** 系列 Boss 名（立绘 IP），如「除法史莱姆」 */
  name: string
  emoji: string
  /** 母题类型 ID，关联 bossNicknames.json */
  topicTypeId: string
  maxHp: number
  questions: ChallengeQuestion[]
}

/** 合并外号后的完整 Boss 配置 */
export interface DailyBossConfig extends DailyBossBaseConfig {
  /** 今日外号（母题类型驱动），如「分糖大盗」 */
  dailyNickname: string
  topicTypeLabel: string
  /** 母题类型一句话（非具体算式） */
  motherTopicSummary: string
  topicExamples: string
  taunt: string
  shareHook: string
  classTalk: string
  /**
   * @deprecated 请用 motherTopicSummary；保留兼容旧文案/存储字段
   */
  motherTopic: string
}

const DIVISION_SLIME: DailyBossBaseConfig = {
  key: 'division_slime',
  name: '除法史莱姆',
  emoji: '🟢',
  topicTypeId: 'equal_share_division',
  maxHp: 300,
  questions: [
    {
      id: 1,
      stage: 'review',
      question: '36 ÷ 6 = ?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 1,
      hint: 'Boss弱点：用乘法反推，6×6=36。',
      knowledge: '除法复习',
      knowledgeTag: 'division',
      timeLimitSec: 45,
      reward: { coins: 8, knowledge: 5 },
      attackDamage: 80,
    },
    {
      id: 2,
      stage: 'learn',
      question: '84 ÷ 7 = ?',
      options: ['11', '12', '13', '14'],
      correctAnswer: 1,
      hint: 'Boss弱点：先想 7×12=84。',
      knowledge: '母题变式',
      knowledgeTag: 'division',
      timeLimitSec: 75,
      reward: { coins: 10, knowledge: 8 },
      attackDamage: 100,
    },
    {
      id: 3,
      stage: 'boss',
      question: '小明把84颗糖平均分给7位同学，每人几颗？',
      options: ['11', '12', '13', '14'],
      correctAnswer: 1,
      hint: 'Boss弱点：列式 84÷7，再计算。',
      knowledge: '母题必杀',
      knowledgeTag: 'division',
      timeLimitSec: 120,
      reward: { coins: 18, knowledge: 12 },
      attackDamage: 120,
    },
  ],
}

const MULTIPLY_GOLEM: DailyBossBaseConfig = {
  key: 'multiply_golem',
  name: '乘法石怪',
  emoji: '🪨',
  topicTypeId: 'array_multiply',
  maxHp: 300,
  questions: [
    {
      id: 1,
      stage: 'review',
      question: '7 × 6 = ?',
      options: ['40', '42', '44', '48'],
      correctAnswer: 1,
      hint: 'Boss弱点：7×6=42，口诀「六七四十二」。',
      knowledge: '乘法复习',
      knowledgeTag: 'multiply',
      timeLimitSec: 45,
      reward: { coins: 8, knowledge: 5 },
      attackDamage: 80,
    },
    {
      id: 2,
      stage: 'learn',
      question: '7 × 8 = ?',
      options: ['54', '56', '58', '64'],
      correctAnswer: 1,
      hint: 'Boss弱点：7×8=56。',
      knowledge: '母题变式',
      knowledgeTag: 'multiply',
      timeLimitSec: 75,
      reward: { coins: 10, knowledge: 8 },
      attackDamage: 100,
    },
    {
      id: 3,
      stage: 'boss',
      question: '每盒彩笔7支，买8盒一共多少支？',
      options: ['54', '56', '58', '64'],
      correctAnswer: 1,
      hint: 'Boss弱点：应用题列式 7×8。',
      knowledge: '母题必杀',
      knowledgeTag: 'multiply',
      timeLimitSec: 120,
      reward: { coins: 18, knowledge: 12 },
      attackDamage: 120,
    },
  ],
}

const WORD_DRAGON: DailyBossBaseConfig = {
  key: 'word_dragon',
  name: '应用题巨龙',
  emoji: '🐉',
  topicTypeId: 'two_step_word',
  maxHp: 300,
  questions: [
    {
      id: 1,
      stage: 'review',
      question: '15 + 27 = ?',
      options: ['40', '41', '42', '43'],
      correctAnswer: 2,
      hint: 'Boss弱点：个位5+7=12，进1。',
      knowledge: '加法复习',
      knowledgeTag: 'word',
      timeLimitSec: 45,
      reward: { coins: 8, knowledge: 5 },
      attackDamage: 80,
    },
    {
      id: 2,
      stage: 'learn',
      question: '一本书15元，笔比书贵12元，笔多少钱？',
      options: ['25', '27', '29', '30'],
      correctAnswer: 1,
      hint: 'Boss弱点：笔价=15+12。',
      knowledge: '母题变式',
      knowledgeTag: 'word',
      timeLimitSec: 75,
      reward: { coins: 10, knowledge: 8 },
      attackDamage: 100,
    },
    {
      id: 3,
      stage: 'boss',
      question: '小红有15元，妈妈又给了27元，她一共有多少元？',
      options: ['40', '41', '42', '43'],
      correctAnswer: 2,
      hint: 'Boss弱点：合并用加法 15+27。',
      knowledge: '母题必杀',
      knowledgeTag: 'word',
      timeLimitSec: 120,
      reward: { coins: 18, knowledge: 12 },
      attackDamage: 120,
    },
  ],
}

const BOSS_POOL: DailyBossBaseConfig[] = [DIVISION_SLIME, MULTIPLY_GOLEM, WORD_DRAGON]

const FALLBACK_TAUNT = '今天也要打败我！'

/**
 * 将基础 Boss 配置与母题类型外号合并为完整配置。
 */
export const mergeBossNickname = (base: DailyBossBaseConfig): DailyBossConfig => {
  const profile =
    getBossNicknameByKey(base.key) || getBossNicknameByTopicType(base.topicTypeId)

  if (!profile) {
    return {
      ...base,
      dailyNickname: base.name,
      topicTypeLabel: '今日母题',
      motherTopicSummary: base.name,
      topicExamples: '',
      taunt: FALLBACK_TAUNT,
      shareHook: `今日挑战${base.name}！`,
      classTalk: '记得今天的母题哦！',
      motherTopic: base.name,
    }
  }

  return {
    ...base,
    dailyNickname: profile.dailyNickname,
    topicTypeLabel: profile.topicTypeLabel,
    motherTopicSummary: profile.motherTopicSummary,
    topicExamples: profile.topicExamples,
    taunt: profile.taunt,
    shareHook: profile.shareHook,
    classTalk: profile.classTalk,
    motherTopic: profile.motherTopicSummary,
  }
}

/**
 * 按日期稳定选取当日 Boss（同一天所有用户一致）。
 */
export const getTodayBoss = (date = new Date()): DailyBossConfig => {
  const dayIndex = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  )
  const base = BOSS_POOL[dayIndex % BOSS_POOL.length]
  return mergeBossNickname(base)
}

export const getStageLabel = (stage: StageType): string => {
  if (stage === 'review') return '热身一击'
  if (stage === 'learn') return '连击追击'
  return '母题必杀'
}

/** 连击展示文案（B3） */
export const getComboLabel = (combo: number): string | null => {
  if (combo <= 1) return null
  if (combo === 2) return '2 连击！'
  if (combo >= 3) return '3 连击 · 母题必杀！'
  return null
}

/** 按知识点与阶段映射招式名（答对反馈用）。 */
const MOVE_NAME_BY_TAG: Record<string, Record<StageType, string>> = {
  division: {
    review: '除法斩！',
    learn: '连击除！',
    boss: '母题必杀！',
  },
  multiply: {
    review: '乘法突！',
    learn: '连击乘！',
    boss: '母题必杀！',
  },
  word: {
    review: '热身击！',
    learn: '追击斩！',
    boss: '母题必杀！',
  },
}

/**
 * 获取答对时展示的招式名。
 */
export const getMoveName = (stage: StageType, knowledgeTag: string): string => {
  return MOVE_NAME_BY_TAG[knowledgeTag]?.[stage] || getStageLabel(stage)
}

/** 单题弱点层数上限 */
export const WEAKNESS_MAX = 3

/** 每层弱点对伤害的加成比例（再答同题时生效） */
export const WEAKNESS_DAMAGE_RATE = 0.2

/**
 * 按弱点层数计算实际伤害。
 */
export const calcWeaknessDamage = (baseDamage: number, weaknessLevel: number): number => {
  const level = Math.max(0, Math.min(WEAKNESS_MAX, weaknessLevel))
  return Math.round(baseDamage * (1 + level * WEAKNESS_DAMAGE_RATE))
}

/** 本地 mock：今日全班通关人数（传播钩子文案用）。 */
export const getMockClassClearCount = (): number => {
  const day = new Date().getDate()
  return 2 + (day % 5)
}
