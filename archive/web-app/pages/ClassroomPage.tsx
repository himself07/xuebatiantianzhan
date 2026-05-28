import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Shield, Users, TrendingUp, Swords, Settings, Zap } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { CARD_DATA, getCardStats, getRarityBorder } from '../types/card';
import { TeamSetupModal } from '../components/TeamSetupModal';
import { EnhancedBattle } from '../components/EnhancedBattle';

interface ClassTerritory {
  id: number;
  className: string;
  defenseRate: number;
  guardCards: number[];
  ranking: number;
  points: number;
}

const OTHER_CLASSES: ClassTerritory[] = [
  {
    id: 1,
    className: '三年级1班',
    defenseRate: 92,
    guardCards: [1, 2, 4],
    ranking: 1,
    points: 3580,
  },
  {
    id: 3,
    className: '三年级3班',
    defenseRate: 88,
    guardCards: [3, 5, 8],
    ranking: 2,
    points: 3120,
  },
  {
    id: 4,
    className: '三年级4班',
    defenseRate: 75,
    guardCards: [6, 7, 2],
    ranking: 4,
    points: 2380,
  },
  {
    id: 5,
    className: '三年级5班',
    defenseRate: 70,
    guardCards: [1, 3, 6],
    ranking: 5,
    points: 2150,
  },
];

export function ClassroomPage() {
  const navigate = useNavigate();
  const [energy, setEnergy] = useState(0);
  const [myGuardCards, setMyGuardCards] = useState<number[]>([]);
  const [showGuardSetup, setShowGuardSetup] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<ClassTerritory | null>(null);
  const [myClass, setMyClass] = useState<ClassTerritory>({
    id: 2,
    className: '三年级2班',
    defenseRate: 85,
    guardCards: [],
    ranking: 3,
    points: 2580,
  });

  useEffect(() => {
    const progress = StorageManager.getProgress();
    setEnergy(progress.energy);

    const savedGuards = localStorage.getItem('myGuardCards');
    if (savedGuards) {
      setMyGuardCards(JSON.parse(savedGuards));
      setMyClass(prev => ({ ...prev, guardCards: JSON.parse(savedGuards) }));
    }
  }, []);

  const handleSetGuardCards = (cardIds: number[]) => {
    setMyGuardCards(cardIds);
    setMyClass(prev => ({ ...prev, guardCards: cardIds }));
    localStorage.setItem('myGuardCards', JSON.stringify(cardIds));
    setShowGuardSetup(false);
  };

  const startBattle = (opponent: ClassTerritory) => {
    if (energy < 10) {
      alert('体力不足！需要10点体力才能参加班级对战');
      return;
    }

    if (myGuardCards.length === 0) {
      alert('请先配置守护卡牌！');
      setShowGuardSetup(true);
      return;
    }

    StorageManager.updateProgress((progress) => ({
      energy: progress.energy - 10,
    }));
    setEnergy(energy - 10);

    setSelectedOpponent(opponent);
    setShowBattle(true);
  };

  const handleBattleEnd = (won: boolean, coinsEarned: number) => {
    if (won && coinsEarned > 0) {
      StorageManager.updateProgress((progress) => ({
        coins: progress.coins + coinsEarned,
      }));

      setMyClass(prev => ({
        ...prev,
        points: prev.points + 50,
        defenseRate: Math.min(100, prev.defenseRate + 2),
      }));
    }

    setShowBattle(false);
    setSelectedOpponent(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 p-4">
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/main-world')}
            className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <Users className="size-5 text-orange-500" />
            <span className="font-bold text-gray-700">班级领地</span>
          </div>
          <div className="bg-green-500 px-3 py-2 rounded-full shadow-md flex items-center gap-1">
            <Zap className="size-4 text-white" />
            <span className="text-sm font-bold text-white">{energy}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-6xl mb-3">🏫</div>
              <h2 className="text-3xl font-bold mb-2">{myClass.className}</h2>
              <p className="text-sm opacity-90">我们的专属领地</p>
            </div>
            <button
              onClick={() => setShowGuardSetup(true)}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-full transition-colors"
            >
              <Settings className="size-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{myClass.defenseRate}%</p>
              <p className="text-xs mt-1 opacity-90">防御值</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">第{myClass.ranking}名</p>
              <p className="text-xs mt-1 opacity-90">班级排名</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-3xl font-bold">{myClass.points}</p>
              <p className="text-xs mt-1 opacity-90">班级积分</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Shield className="size-5" />
              守护卡牌
            </h3>
            {myGuardCards.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {myGuardCards.map((cardId) => {
                  const card = CARD_DATA.find((c) => c.id === cardId);
                  if (!card) return null;

                  const owned = StorageManager.getOwnedCards().find(c => c.cardId === cardId);
                  const stats = getCardStats(card, owned?.stars || 1, owned?.level || 1);

                  return (
                    <div
                      key={cardId}
                      className={`bg-gradient-to-br ${card.color} rounded-xl p-3 border-2 ${getRarityBorder(card.rarity)}`}
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{card.emoji}</div>
                        <h4 className="font-bold text-white text-sm mb-1">{card.name}</h4>
                        <div className="text-xs text-white/90">
                          <div>⚔️{stats.attack} 🛡️{stats.defense}</div>
                          <div className="mt-1">{owned?.stars || 1}⭐ Lv.{owned?.level || 1}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/70 mb-4">还没有配置守护卡牌</p>
                <button
                  onClick={() => setShowGuardSetup(true)}
                  className="bg-white/30 hover:bg-white/40 px-6 py-3 rounded-xl font-bold transition-colors"
                >
                  立即配置
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="size-6 text-orange-600" />
            <h3 className="text-2xl font-bold text-gray-800">挑战其他班级</h3>
          </div>
          <p className="text-gray-600 text-sm mb-6">击败其他班级的守护卡牌，提升自己班级的排名！</p>

          <div className="space-y-4">
            {OTHER_CLASSES.map((classData) => (
              <div
                key={classData.id}
                className="border-2 border-gray-200 rounded-2xl p-4 hover:border-orange-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-800">{classData.className}</h4>
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        第{classData.ranking}名
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>🛡️ 防御值: {classData.defenseRate}%</span>
                      <span>📊 积分: {classData.points}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="text-xs text-gray-500 mb-2">守护卡牌:</h5>
                  <div className="flex gap-2">
                    {classData.guardCards.map((cardId) => {
                      const card = CARD_DATA.find((c) => c.id === cardId);
                      if (!card) return null;
                      return (
                        <div
                          key={cardId}
                          className={`bg-gradient-to-br ${card.color} rounded-lg px-3 py-2 flex items-center gap-2`}
                        >
                          <span className="text-2xl">{card.emoji}</span>
                          <span className="text-white text-xs font-bold">{card.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => startBattle(classData)}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2"
                >
                  <Swords className="size-5" />
                  发起挑战 (消耗10体力)
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="size-6 text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-800">本周荣誉</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">👥 班级成员贡献</span>
              <span className="font-bold text-orange-600">1580 分</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">⚔️ 对战胜利次数</span>
              <span className="font-bold text-green-600">12 次</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">🛡️ 防守成功次数</span>
              <span className="font-bold text-blue-600">8 次</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
          <p className="text-blue-800 text-center text-sm">
            💡 <span className="font-bold">提示：</span>
            配置强大的守护卡牌可以提升班级防御值，击败其他班级可以获得积分和奖励！
          </p>
        </div>
      </div>

      {showGuardSetup && (
        <TeamSetupModal
          currentTeam={myGuardCards}
          onConfirm={handleSetGuardCards}
          onClose={() => setShowGuardSetup(false)}
          title="配置守护卡牌"
          description="选择3张卡牌守护你的班级领地"
        />
      )}

      {showBattle && selectedOpponent && (
        <EnhancedBattle
          playerTeamIds={myGuardCards}
          opponentTeamIds={selectedOpponent.guardCards}
          onClose={() => {
            setShowBattle(false);
            setSelectedOpponent(null);
          }}
          onBattleEnd={handleBattleEnd}
        />
      )}
    </div>
  );
}
