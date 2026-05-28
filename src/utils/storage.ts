import Taro from '@tarojs/taro'
import { OwnedCard, VALID_CARD_IDS } from '../types/card'

export interface RankInfo {
  level: number // 1-5: 青铜1-青铜3, 6-10: 白银1-白银3, 11-15: 黄金1-黄金3, 16-20: 钻石1-钻石3, 21-25: 王者
  points: number // 段位积分
  seasonStartTime: number
}

export interface SignInInfo {
  lastSignInDate: string // yyyy-MM-dd
  continuousDays: number
  totalSignInDays: number
}

export interface DailyTask {
  id: string
  name: string
  description: string
  target: number
  progress: number
  reward: { coins?: number; energy?: number; petFood?: number }
  completed: boolean
  claimed: boolean
}

export interface ClassInfo {
  classCode: string
  className: string
  weeklyBossDefeats: number
  territoryLevel: number
  weekStartDate: string
}

export interface TodayBossSnapshot {
  bossKey: string
  /** 系列 Boss 名 */
  bossName: string
  /** 今日外号 */
  dailyNickname: string
  topicTypeId: string
  topicTypeLabel: string
  motherTopic: string
  motherTopicSummary: string
  knowledgeTag: string
  date: string
}

export interface GameProgress {
  // 基础资源
  coins: number
  energy: number
  maxEnergy: number
  petFood: number

  // 卡牌
  ownedCards: OwnedCard[]
  cardTeam: number[]
  drawCount: number

  // 每日挑战
  dailyChallengeCompleted: boolean
  dailyChallengeClaimed: boolean
  dailyChallengeCorrectCount: number
  todayAnswerCount: number
  todayCorrectRate: number

  // 签到系统
  signInInfo: SignInInfo

  // 段位系统
  rankInfo: RankInfo

  // 能量恢复时间戳
  lastEnergyRecoverTime: number

  // 每日任务
  dailyTasks: DailyTask[]
  lastTaskResetDate: string

  // 宠物
  petLevel: number
  petExp: number
  petLastFeedTime: number

  // 荣誉与分享
  battleStats: {
    totalBattles: number
    totalWins: number
    bestWinStreak: number
    currentWinStreak: number
    mvpCount: number
    lastBattleAt: number
  }
  shareStats: {
    todayShareCount: number
    todayInviteSuccessCount: number
    lastShareDate: string
    todayShareRewardClaimed: boolean
  }
  // 每日 Boss 战
  todayBoss: TodayBossSnapshot | null
  dailyChallengeDurationSec: number
  dailyChallengePassed: boolean
  // 班级
  classInfo: ClassInfo
  // 竞技场今日母题加成
  todayKnowledgeTag: string
}

const getToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 获取本周一日期字符串（yyyy-MM-dd）。 */
const getWeekStart = () => {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getDefaultDailyTasks = (): DailyTask[] => [
  {
    id: 'daily_quiz_10',
    name: '每日答题',
    description: '完成10道题目',
    target: 10,
    progress: 0,
    reward: { coins: 20, energy: 10 },
    completed: false,
    claimed: false
  },
  {
    id: 'daily_quiz_5_correct',
    name: '正确率挑战',
    description: '答对5道题',
    target: 5,
    progress: 0,
    reward: { coins: 30, petFood: 5 },
    completed: false,
    claimed: false
  },
  {
    id: 'daily_sign',
    name: '每日签到',
    description: '今日签到',
    target: 1,
    progress: 0,
    reward: { coins: 10, energy: 20 },
    completed: false,
    claimed: false
  },
  {
    id: 'daily_feed_pet',
    name: '喂养宠物',
    description: '喂养宠物一次',
    target: 1,
    progress: 0,
    reward: { coins: 15 },
    completed: false,
    claimed: false
  }
]

const DEFAULT_PROGRESS: GameProgress = {
  coins: 100,
  energy: 100,
  maxEnergy: 100,
  petFood: 20,
  ownedCards: [
    { cardId: 1, stars: 1, obtainedAt: Date.now(), level: 1 },
    { cardId: 3, stars: 1, obtainedAt: Date.now(), level: 1 },
    { cardId: 5, stars: 1, obtainedAt: Date.now(), level: 1 },
  ],
  cardTeam: [],
  drawCount: 0,
  dailyChallengeCompleted: false,
  dailyChallengeClaimed: false,
  dailyChallengeCorrectCount: 0,
  todayAnswerCount: 0,
  todayCorrectRate: 0,
  signInInfo: {
    lastSignInDate: '',
    continuousDays: 0,
    totalSignInDays: 0
  },
  rankInfo: {
    level: 1,
    points: 0,
    seasonStartTime: Date.now()
  },
  lastEnergyRecoverTime: Date.now(),
  dailyTasks: getDefaultDailyTasks(),
  lastTaskResetDate: '',
  petLevel: 1,
  petExp: 0,
  petLastFeedTime: Date.now(),
  battleStats: {
    totalBattles: 0,
    totalWins: 0,
    bestWinStreak: 0,
    currentWinStreak: 0,
    mvpCount: 0,
    lastBattleAt: 0
  },
  shareStats: {
    todayShareCount: 0,
    todayInviteSuccessCount: 0,
    lastShareDate: '',
    todayShareRewardClaimed: false
  },
  todayBoss: null,
  dailyChallengeDurationSec: 0,
  dailyChallengePassed: false,
  classInfo: {
    classCode: '302',
    className: '三年级2班',
    weeklyBossDefeats: 0,
    territoryLevel: 0,
    weekStartDate: ''
  },
  todayKnowledgeTag: ''
}

export const RANK_NAMES = ['青铜Ⅰ', '青铜Ⅱ', '青铜Ⅲ', '白银Ⅰ', '白银Ⅱ', '白银Ⅲ', '黄金Ⅰ', '黄金Ⅱ', '黄金Ⅲ', '钻石Ⅰ', '钻石Ⅱ', '钻石Ⅲ', '王者Ⅰ', '王者Ⅱ', '王者Ⅲ']

export const RANK_THRESHOLDS = [
  { min: 0, max: 100, name: '青铜Ⅰ', icon: '🥉' },
  { min: 100, max: 300, name: '青铜Ⅱ', icon: '🥉' },
  { min: 300, max: 600, name: '青铜Ⅲ', icon: '🥉' },
  { min: 600, max: 1000, name: '白银Ⅰ', icon: '🥈' },
  { min: 1000, max: 1500, name: '白银Ⅱ', icon: '🥈' },
  { min: 1500, max: 2100, name: '白银Ⅲ', icon: '🥈' },
  { min: 2100, max: 2800, name: '黄金Ⅰ', icon: '🥇' },
  { min: 2800, max: 3600, name: '黄金Ⅱ', icon: '🥇' },
  { min: 3600, max: 4500, name: '黄金Ⅲ', icon: '🥇' },
  { min: 4500, max: 5500, name: '钻石Ⅰ', icon: '💎' },
  { min: 5500, max: 6600, name: '钻石Ⅱ', icon: '💎' },
  { min: 6600, max: 7800, name: '钻石Ⅲ', icon: '💎' },
  { min: 7800, max: 9100, name: '王者Ⅰ', icon: '👑' },
  { min: 9100, max: 10500, name: '王者Ⅱ', icon: '👑' },
  { min: 10500, max: Infinity, name: '王者Ⅲ', icon: '👑' }
]

export const SIGN_IN_REWARDS = [
  { day: 1, coins: 10, energy: 20 },
  { day: 2, coins: 15, energy: 25 },
  { day: 3, coins: 20, energy: 30 },
  { day: 4, coins: 25, petFood: 5 },
  { day: 5, coins: 30, energy: 40 },
  { day: 6, coins: 35, petFood: 8 },
  { day: 7, coins: 50, energy: 50, petFood: 10 }
]

export class StorageManager {
  private static STORAGE_KEY = 'learningProgress'

  /**
   * 兼容历史缓存：既支持 string 也支持 object。
   */
  private static parseStoredProgress(stored: unknown): Partial<GameProgress> {
    if (!stored) {
      return {}
    }
    if (typeof stored === 'string') {
      try {
        return JSON.parse(stored)
      } catch {
        return {}
      }
    }
    if (typeof stored === 'object') {
      return stored as Partial<GameProgress>
    }
    return {}
  }

  /**
   * 过滤无效卡牌 id，兼容旧版学科卡数据。
   */
  static normalizeOwnedCards(ownedCards: OwnedCard[]): OwnedCard[] {
    const valid = ownedCards.filter((item) => VALID_CARD_IDS.has(item.cardId))
    if (valid.length > 0) {
      return valid
    }
    return DEFAULT_PROGRESS.ownedCards
  }

  static getProgress(): GameProgress {
    const stored = Taro.getStorageSync(this.STORAGE_KEY)
    const parsed = this.parseStoredProgress(stored)
    const merged = { ...DEFAULT_PROGRESS, ...parsed }
    merged.shareStats = { ...DEFAULT_PROGRESS.shareStats, ...(merged.shareStats || {}) }
    merged.classInfo = { ...DEFAULT_PROGRESS.classInfo, ...(merged.classInfo || {}) }
    merged.ownedCards = this.normalizeOwnedCards(merged.ownedCards || [])
    merged.cardTeam = (merged.cardTeam || []).filter((id) => VALID_CARD_IDS.has(id))
    return merged
  }

  static saveProgress(progress: Partial<GameProgress>): void {
    const current = this.getProgress()
    const updated = { ...current, ...progress }
    Taro.setStorageSync(this.STORAGE_KEY, JSON.stringify(updated))
  }

  static updateProgress(updater: (progress: GameProgress) => Partial<GameProgress>): GameProgress {
    const current = this.getProgress()
    const updates = updater(current)
    const updated = { ...current, ...updates }
    Taro.setStorageSync(this.STORAGE_KEY, JSON.stringify(updated))
    return updated
  }

  static checkAndResetDaily() {
    const progress = this.getProgress()
    const today = getToday()
    const yesterday = getYesterday()

    if (progress.lastTaskResetDate !== today) {
      progress.todayAnswerCount = 0
      progress.todayCorrectRate = 0
      progress.dailyChallengeCompleted = false
      progress.dailyChallengeClaimed = false
      progress.dailyChallengeCorrectCount = 0
      progress.dailyTasks = getDefaultDailyTasks()
      progress.lastTaskResetDate = today
      if (!progress.shareStats || progress.shareStats.lastShareDate !== today) {
        progress.shareStats = {
          todayShareCount: 0,
          todayInviteSuccessCount: 0,
          lastShareDate: today,
          todayShareRewardClaimed: false
        }
      }
      progress.todayBoss = null
      progress.dailyChallengeDurationSec = 0
      progress.dailyChallengePassed = false
      progress.todayKnowledgeTag = ''
      const weekStart = getWeekStart()
      if (!progress.classInfo || progress.classInfo.weekStartDate !== weekStart) {
        progress.classInfo = {
          ...(progress.classInfo || DEFAULT_PROGRESS.classInfo),
          weeklyBossDefeats: 0,
          weekStartDate: weekStart
        }
      }
      this.saveProgress(progress)
    }

    if (progress.lastEnergyRecoverTime) {
      const elapsed = Date.now() - progress.lastEnergyRecoverTime
      const recovered = Math.floor(elapsed / (5 * 60 * 1000))
      if (recovered > 0 && progress.energy < progress.maxEnergy) {
        progress.energy = Math.min(progress.maxEnergy, progress.energy + recovered)
        progress.lastEnergyRecoverTime = Date.now() - (elapsed % (5 * 60 * 1000))
        this.saveProgress(progress)
      }
    }
  }

  static signIn(): { success: boolean; reward: any; message: string } {
    const progress = this.getProgress()
    const today = getToday()
    const yesterday = getYesterday()

    if (progress.signInInfo.lastSignInDate === today) {
      return { success: false, reward: null, message: '今日已签到' }
    }

    let continuousDays = 1
    if (progress.signInInfo.lastSignInDate === yesterday) {
      continuousDays = progress.signInInfo.continuousDays + 1
    }

    const dayIndex = (continuousDays - 1) % 7
    const reward = SIGN_IN_REWARDS[dayIndex]

    progress.signInInfo.lastSignInDate = today
    progress.signInInfo.continuousDays = continuousDays
    progress.signInInfo.totalSignInDays += 1
    progress.coins += reward.coins
    progress.energy = Math.min(progress.maxEnergy, progress.energy + (reward.energy || 0))
    progress.petFood += reward.petFood || 0

    const task = progress.dailyTasks.find(t => t.id === 'daily_sign')
    if (task) {
      task.progress = 1
      task.completed = true
    }

    this.saveProgress(progress)
    return { success: true, reward, message: `连续签到${continuousDays}天` }
  }

  static updateTaskProgress(taskId: string, addProgress: number = 1) {
    const progress = this.getProgress()
    const task = progress.dailyTasks.find(t => t.id === taskId)
    if (task && !task.completed) {
      task.progress = Math.min(task.target, task.progress + addProgress)
      if (task.progress >= task.target) {
        task.completed = true
      }
      this.saveProgress(progress)
    }
  }

  static claimTaskReward(taskId: string): { success: boolean; reward: any } {
    const progress = this.getProgress()
    const task = progress.dailyTasks.find(t => t.id === taskId)
    if (!task || !task.completed || task.claimed) {
      return { success: false, reward: null }
    }

    task.claimed = true
    if (task.reward.coins) progress.coins += task.reward.coins
    if (task.reward.energy) progress.energy = Math.min(progress.maxEnergy, progress.energy + task.reward.energy)
    if (task.reward.petFood) progress.petFood += task.reward.petFood

    this.saveProgress(progress)
    return { success: true, reward: task.reward }
  }

  static addPoints(points: number) {
    const progress = this.getProgress()
    progress.rankInfo.points += points

    const newRank = RANK_THRESHOLDS.findIndex(r => progress.rankInfo.points < r.max)
    if (newRank !== -1 && newRank !== progress.rankInfo.level - 1) {
      progress.rankInfo.level = newRank + 1
    }

    this.saveProgress(progress)
    return progress.rankInfo
  }

  static answerQuestion(correct: boolean) {
    const progress = this.getProgress()

    progress.todayAnswerCount += 1

    if (correct) {
      const prevTotal = progress.todayCorrectRate * (progress.todayAnswerCount - 1)
      progress.todayCorrectRate = Math.round((prevTotal + 100) / progress.todayAnswerCount)
      progress.rankInfo.points += 5
      const rankIdx = RANK_THRESHOLDS.findIndex(r => progress.rankInfo.points < r.max)
      if (rankIdx !== -1 && rankIdx !== progress.rankInfo.level - 1) {
        progress.rankInfo.level = rankIdx + 1
      }
      const correctTask = progress.dailyTasks.find(t => t.id === 'daily_quiz_5_correct')
      if (correctTask && !correctTask.completed) {
        correctTask.progress = Math.min(correctTask.target, correctTask.progress + 1)
        if (correctTask.progress >= correctTask.target) {
          correctTask.completed = true
        }
      }
    }

    const quizTask = progress.dailyTasks.find(t => t.id === 'daily_quiz_10')
    if (quizTask && !quizTask.completed) {
      quizTask.progress = Math.min(quizTask.target, quizTask.progress + 1)
      if (quizTask.progress >= quizTask.target) {
        quizTask.completed = true
      }
    }

    this.saveProgress(progress)
    return progress
  }

  /**
   * 保存今日 Boss 快照。
   */
  static saveTodayBoss(snapshot: TodayBossSnapshot): void {
    this.saveProgress({ todayBoss: snapshot })
  }

  /**
   * 记录每日挑战完成状态，并更新班级 Boss 击败数。
   */
  static completeDailyChallenge(params: {
    correctCount: number
    durationSec: number
    passed: boolean
    knowledgeTag: string
  }): GameProgress {
    return this.updateProgress((progress) => {
      const classInfo = { ...(progress.classInfo || DEFAULT_PROGRESS.classInfo) }
      const weekStart = getWeekStart()
      if (classInfo.weekStartDate !== weekStart) {
        classInfo.weeklyBossDefeats = 0
        classInfo.weekStartDate = weekStart
      }
      if (params.passed) {
        classInfo.weeklyBossDefeats += 1
        classInfo.territoryLevel = Math.min(12, classInfo.territoryLevel + 1)
      }
      return {
        dailyChallengeCompleted: true,
        dailyChallengeCorrectCount: params.correctCount,
        dailyChallengeDurationSec: params.durationSec,
        dailyChallengePassed: params.passed,
        todayKnowledgeTag: params.knowledgeTag,
        classInfo
      }
    })
  }

  /**
   * 领取每日挑战奖励（每天一次）。
   */
  static claimDailyChallengeReward(): { success: boolean; message: string; reward?: { coins: number; energy: number; petFood: number } } {
    const progress = this.getProgress()
    if (!progress.dailyChallengeCompleted) {
      return { success: false, message: '请先完成每日挑战' }
    }
    if (progress.dailyChallengeClaimed) {
      return { success: false, message: '今日奖励已领取' }
    }

    const reward = { coins: 50, energy: 10, petFood: 10 }
    progress.dailyChallengeClaimed = true
    progress.coins += reward.coins
    progress.energy = Math.min(progress.maxEnergy, progress.energy + reward.energy)
    progress.petFood += reward.petFood
    this.saveProgress(progress)
    return { success: true, message: '领取成功', reward }
  }

  static addCard(cardId: number): boolean {
    const progress = this.getProgress()
    const isNewCard = !progress.ownedCards.some((c) => c.cardId === cardId)
    progress.ownedCards.push({
      cardId,
      stars: 1,
      obtainedAt: Date.now(),
      level: 1,
    })
    this.saveProgress({ ownedCards: progress.ownedCards })
    return isNewCard
  }

  static hasCard(cardId: number): boolean {
    return this.getProgress().ownedCards.some((c) => c.cardId === cardId)
  }

  static getOwnedCards(): OwnedCard[] {
    return this.getProgress().ownedCards
  }

  static getUniqueCardIds(): number[] {
    return [...new Set(this.getProgress().ownedCards.map((c) => c.cardId))]
  }

  static getCardStars(cardId: number): number {
    const cards = this.getProgress().ownedCards.filter((c) => c.cardId === cardId)
    return cards.length > 0 ? Math.max(...cards.map((c) => c.stars)) : 0
  }

  static mergeCards(sourceIndex: number, targetIndex: number): boolean {
    const progress = this.getProgress()
    const source = progress.ownedCards[sourceIndex]
    const target = progress.ownedCards[targetIndex]
    if (
      source.cardId === target.cardId &&
      source.stars === target.stars &&
      target.stars < 7
    ) {
      target.stars += 1
      progress.ownedCards.splice(sourceIndex, 1)
      this.saveProgress({ ownedCards: progress.ownedCards })
      return true
    }
    return false
  }

  static setCardTeam(teamIds: number[]): void {
    this.saveProgress({ cardTeam: teamIds })
  }

  static getCardTeam(): number[] {
    return this.getProgress().cardTeam
  }

  static getRankInfo() {
    return this.getProgress().rankInfo
  }

  static getSignInInfo() {
    return this.getProgress().signInInfo
  }

  static getDailyTasks() {
    return this.getProgress().dailyTasks
  }

  static useEnergy(amount: number): boolean {
    const progress = this.getProgress()
    if (progress.energy < amount) return false
    progress.energy -= amount
    this.saveProgress(progress)
    return true
  }

  static feedPet(): boolean {
    const progress = this.getProgress()
    if (progress.petFood < 5) return false
    progress.petFood -= 5
    progress.petExp += 10
    progress.petLastFeedTime = Date.now()

    if (progress.petExp >= progress.petLevel * 100) {
      progress.petLevel += 1
      progress.petExp = 0
    }

    this.updateTaskProgress('daily_feed_pet', 1)
    this.saveProgress(progress)
    return true
  }

  static getPetInfo() {
    const progress = this.getProgress()
    return {
      level: progress.petLevel,
      exp: progress.petExp,
      expNeeded: progress.petLevel * 100
    }
  }

  static recordBattleResult(params: { isWin: boolean; isMvp?: boolean }) {
    const progress = this.getProgress()
    const stats = progress.battleStats || DEFAULT_PROGRESS.battleStats
    stats.totalBattles += 1
    stats.lastBattleAt = Date.now()
    if (params.isWin) {
      stats.totalWins += 1
      stats.currentWinStreak += 1
      stats.bestWinStreak = Math.max(stats.bestWinStreak, stats.currentWinStreak)
    } else {
      stats.currentWinStreak = 0
    }
    if (params.isMvp) {
      stats.mvpCount += 1
    }
    this.saveProgress({ battleStats: stats })
    return stats
  }

  static recordShareAction(inviteSuccess = false) {
    const progress = this.getProgress()
    const today = getToday()
    const shareStats = { ...(progress.shareStats || DEFAULT_PROGRESS.shareStats) }
    if (shareStats.lastShareDate !== today) {
      shareStats.todayShareCount = 0
      shareStats.todayInviteSuccessCount = 0
      shareStats.lastShareDate = today
      shareStats.todayShareRewardClaimed = false
    }
    shareStats.todayShareCount += 1
    if (inviteSuccess) {
      shareStats.todayInviteSuccessCount += 1
    }
    this.saveProgress({ shareStats })
    return shareStats
  }

  /**
   * 首次分享当日奖励 +5 金币（仅一次）。
   */
  static claimDailyShareReward(): { success: boolean; message: string; coins?: number } {
    const progress = this.getProgress()
    const today = getToday()
    const shareStats = { ...(progress.shareStats || DEFAULT_PROGRESS.shareStats) }
    if (shareStats.lastShareDate !== today) {
      shareStats.todayShareCount = 0
      shareStats.todayInviteSuccessCount = 0
      shareStats.lastShareDate = today
      shareStats.todayShareRewardClaimed = false
    }
    if (shareStats.todayShareRewardClaimed) {
      return { success: false, message: '今日分享奖励已领取' }
    }
    if (shareStats.todayShareCount < 1) {
      return { success: false, message: '请先分享战绩' }
    }
    shareStats.todayShareRewardClaimed = true
    progress.coins += 5
    this.saveProgress({ coins: progress.coins, shareStats })
    return { success: true, message: '分享奖励 +5 金币', coins: 5 }
  }

  /**
   * 加入班级（班级码）。
   */
  static joinClass(classCode: string, className?: string): void {
    const info = this.getProgress().classInfo || DEFAULT_PROGRESS.classInfo
    this.saveProgress({
      classInfo: {
        ...info,
        classCode,
        className: className || `${classCode}班`
      }
    })
  }

  static getClassInfo(): ClassInfo {
    return this.getProgress().classInfo || DEFAULT_PROGRESS.classInfo
  }

  static getTodayKnowledgeTag(): string {
    return this.getProgress().todayKnowledgeTag || ''
  }
}
