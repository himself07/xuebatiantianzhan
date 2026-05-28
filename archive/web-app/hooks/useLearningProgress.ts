import { useState, useEffect } from 'react';

interface LearningProgress {
  dailyChallengeCompleted: boolean;
  todayAnswerCount: number;
  todayCorrectRate: number;
  coins: number;
  petFood: number;
  energy: number;
  continuousDays: number;
}

const defaultProgress: LearningProgress = {
  dailyChallengeCompleted: false,
  todayAnswerCount: 0,
  todayCorrectRate: 0,
  coins: 100,
  petFood: 10,
  energy: 0,
  continuousDays: 1,
};

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress>(() => {
    const saved = localStorage.getItem('learningProgress');
    return saved ? JSON.parse(saved) : defaultProgress;
  });

  useEffect(() => {
    localStorage.setItem('learningProgress', JSON.stringify(progress));
  }, [progress]);

  const completeQuiz = (count: number, correctRate: number) => {
    setProgress(prev => ({
      ...prev,
      todayAnswerCount: prev.todayAnswerCount + count,
      todayCorrectRate: ((prev.todayCorrectRate * prev.todayAnswerCount + correctRate * count) / (prev.todayAnswerCount + count)) || correctRate,
      coins: prev.coins + count * 10,
      petFood: prev.petFood + count * 2,
      energy: prev.energy + count,
    }));
  };

  const completeDailyChallenge = () => {
    setProgress(prev => ({
      ...prev,
      dailyChallengeCompleted: true,
      coins: prev.coins + 50,
      petFood: prev.petFood + 10,
      energy: prev.energy + 10,
    }));
  };

  const spendCoins = (amount: number) => {
    setProgress(prev => ({
      ...prev,
      coins: Math.max(0, prev.coins - amount),
    }));
  };

  const spendEnergy = (amount: number) => {
    setProgress(prev => ({
      ...prev,
      energy: Math.max(0, prev.energy - amount),
    }));
  };

  const feedPet = (amount: number) => {
    setProgress(prev => ({
      ...prev,
      petFood: Math.max(0, prev.petFood - amount),
    }));
  };

  return {
    progress,
    completeQuiz,
    completeDailyChallenge,
    spendCoins,
    spendEnergy,
    feedPet,
  };
}
