import { OwnedCard } from '../types/card';

export interface GameProgress {
  coins: number;
  energy: number;
  petFood: number;
  ownedCards: OwnedCard[]; // 改为OwnedCard数组以支持升星
  cardTeam: number[];
  drawCount: number;
  dailyChallengeCompleted?: boolean;
  todayAnswerCount?: number;
  todayCorrectRate?: number;
}

const DEFAULT_PROGRESS: GameProgress = {
  coins: 100,
  energy: 100,
  petFood: 20,
  ownedCards: [
    { cardId: 1, stars: 1, obtainedAt: Date.now(), level: 1 },
    { cardId: 3, stars: 1, obtainedAt: Date.now(), level: 1 },
    { cardId: 5, stars: 1, obtainedAt: Date.now(), level: 1 },
  ],
  cardTeam: [],
  drawCount: 0,
};

export class StorageManager {
  private static STORAGE_KEY = 'learningProgress';

  static getProgress(): GameProgress {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_PROGRESS;
      }
    }
    return DEFAULT_PROGRESS;
  }

  static saveProgress(progress: Partial<GameProgress>): void {
    const current = this.getProgress();
    const updated = { ...current, ...progress };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
  }

  static updateProgress(updater: (progress: GameProgress) => Partial<GameProgress>): GameProgress {
    const current = this.getProgress();
    const updates = updater(current);
    const updated = { ...current, ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static addCard(cardId: number): boolean {
    const progress = this.getProgress();
    const isNewCard = !progress.ownedCards.some((c) => c.cardId === cardId);

    // 总是添加新的卡牌实例，不自动合成
    progress.ownedCards.push({
      cardId,
      stars: 1,
      obtainedAt: Date.now(),
      level: 1,
    });
    this.saveProgress({ ownedCards: progress.ownedCards });

    // 返回是否是新卡牌（用于UI显示）
    return isNewCard;
  }

  static hasCard(cardId: number): boolean {
    return this.getProgress().ownedCards.some((c) => c.cardId === cardId);
  }

  static getOwnedCards(): OwnedCard[] {
    return this.getProgress().ownedCards;
  }

  static getOwnedCardsList(): OwnedCard[] {
    return this.getProgress().ownedCards;
  }

  static getUniqueCardIds(): number[] {
    return [...new Set(this.getProgress().ownedCards.map((c) => c.cardId))];
  }

  static getCardStars(cardId: number): number {
    const cards = this.getProgress().ownedCards.filter((c) => c.cardId === cardId);
    // 返回该卡牌的所有副本中最高的星级
    return cards.length > 0 ? Math.max(...cards.map((c) => c.stars)) : 0;
  }

  static mergeCards(sourceIndex: number, targetIndex: number): boolean {
    const progress = this.getProgress();
    const source = progress.ownedCards[sourceIndex];
    const target = progress.ownedCards[targetIndex];

    // 只能合并相同卡牌且相同星级
    if (
      source.cardId === target.cardId &&
      source.stars === target.stars &&
      target.stars < 7
    ) {
      // 目标卡牌升星
      target.stars += 1;
      // 删除源卡牌
      progress.ownedCards.splice(sourceIndex, 1);
      this.saveProgress({ ownedCards: progress.ownedCards });
      return true;
    }
    return false;
  }

  static setCardTeam(teamIds: number[]): void {
    this.saveProgress({ cardTeam: teamIds });
  }

  static getCardTeam(): number[] {
    return this.getProgress().cardTeam;
  }
}
