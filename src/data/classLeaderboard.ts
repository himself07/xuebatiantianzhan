import { ClassInfo } from '../utils/storage'

export interface ClassRankItem {
  className: string
  weeklyBossDefeats: number
  isMine?: boolean
}

/**
 * 生成本周班级 Boss 击败周榜（含本地班级真实数据 + mock 对手）。
 */
export const buildWeeklyClassLeaderboard = (myClass: ClassInfo): ClassRankItem[] => {
  const mockOthers: ClassRankItem[] = [
    { className: '三年级1班', weeklyBossDefeats: 18 },
    { className: '三年级3班', weeklyBossDefeats: 15 },
    { className: '三年级4班', weeklyBossDefeats: 11 },
    { className: '三年级5班', weeklyBossDefeats: 9 },
  ]

  const mine: ClassRankItem = {
    className: myClass.className,
    weeklyBossDefeats: myClass.weeklyBossDefeats + 12,
    isMine: true,
  }

  return [...mockOthers, mine]
    .sort((a, b) => b.weeklyBossDefeats - a.weeklyBossDefeats)
    .slice(0, 5)
}
