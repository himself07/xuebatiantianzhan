import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { getCardById } from '../../types/card';
import GameCard from '../../components/GameCard';
import { StorageManager } from '../../utils/storage';
import { buildWeeklyClassLeaderboard } from '../../data/classLeaderboard';

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

export default function ClassroomPage() {
  const [energy, setEnergy] = useState(0);
  const [myGuardCards, setMyGuardCards] = useState<number[]>([]);
  const [classCodeInput, setClassCodeInput] = useState('');
  const [classInfo, setClassInfo] = useState(StorageManager.getClassInfo());
  const [weeklyRanks, setWeeklyRanks] = useState(buildWeeklyClassLeaderboard(StorageManager.getClassInfo()));
  const [myClass, setMyClass] = useState<ClassTerritory>({
    id: 2,
    className: '三年级2班',
    defenseRate: 85,
    guardCards: [],
    ranking: 3,
    points: 2580,
  });
  const handleBack = () => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack();
      return;
    }
    Taro.switchTab({ url: '/pages/MainWorldPage/index' });
  };

  const refreshClassData = () => {
    const info = StorageManager.getClassInfo();
    setClassInfo(info);
    setWeeklyRanks(buildWeeklyClassLeaderboard(info));
    const myRankIndex = buildWeeklyClassLeaderboard(info).findIndex((item) => item.isMine);
    setMyClass((prev) => ({
      ...prev,
      className: info.className,
      ranking: myRankIndex >= 0 ? myRankIndex + 1 : prev.ranking,
      points: info.weeklyBossDefeats + 12,
      defenseRate: Math.min(100, 70 + info.territoryLevel * 2),
    }));
  };

  useEffect(() => {
    StorageManager.checkAndResetDaily();
    const progress = StorageManager.getProgress();
    setEnergy(progress.energy || 0);
    refreshClassData();

    const savedGuards = Taro.getStorageSync('myGuardCards');
    if (savedGuards) {
      setMyGuardCards(savedGuards);
      setMyClass((prev) => ({ ...prev, guardCards: savedGuards }));
    }
  }, []);

  const handleJoinClass = () => {
    const code = classCodeInput.trim();
    if (!code) {
      Taro.showToast({ title: '请输入班级码', icon: 'none' });
      return;
    }
    StorageManager.joinClass(code, `${code}班`);
    setClassCodeInput('');
    refreshClassData();
    Taro.showToast({ title: '加入班级成功', icon: 'success' });
  };

  const handleSetGuardCards = (cardIds: number[]) => {
    setMyGuardCards(cardIds);
    setMyClass(prev => ({ ...prev, guardCards: cardIds }));
    Taro.setStorageSync('myGuardCards', cardIds);
  };

  const startBattle = (opponent: ClassTerritory) => {
    if (energy < 10) {
      Taro.showModal({
        title: '体力不足',
        content: '需要10点体力才能参加班级对战',
        showCancel: false
      });
      return;
    }

    if (myGuardCards.length === 0) {
      Taro.showModal({
        title: '请先配置守护卡牌',
        content: '请先配置守护卡牌！',
        showCancel: false
      });
      return;
    }

    const progress = Taro.getStorageSync('learningProgress') || {};
    progress.energy = (progress.energy || 0) - 10;
    Taro.setStorageSync('learningProgress', progress);
    setEnergy(energy - 10);

    // 模拟战斗结果
    const won = Math.random() > 0.3;
    const coinsEarned = won ? 50 : 0;

    if (won && coinsEarned > 0) {
      const newProgress = Taro.getStorageSync('learningProgress') || {};
      newProgress.coins = (newProgress.coins || 0) + coinsEarned;
      Taro.setStorageSync('learningProgress', newProgress);

      setMyClass(prev => ({
        ...prev,
        points: prev.points + 50,
        defenseRate: Math.min(100, prev.defenseRate + 2),
      }));
    }

    Taro.showModal({
      title: won ? '战斗胜利！' : '战斗失败',
      content: won ? `获得了 ${coinsEarned} 金币！` : '下次继续努力！',
      showCancel: false
    });
  };

  return (
    <View style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fff7ed 0%, #fef2f2 100%)', padding: '16px' }}>
      <View style={{ maxWidth: '896px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View
            onClick={handleBack}
            style={{ background: '#fff', padding: '12px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <Text style={{ color: '#374151' }}>←</Text>
          </View>
          <View style={{ background: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ color: '#f97316' }}>👥</Text>
            <Text style={{ fontWeight: 'bold', color: '#374151' }}>班级领地</Text>
          </View>
          <View style={{ background: '#22c55e', paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>⚡ {energy}</Text>
          </View>
        </View>
      </View>

      <View style={{ maxWidth: '896px', marginLeft: 'auto', marginRight: 'auto' }}>
        <View style={{ background: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '24px', color: '#fff', marginBottom: '24px' }}>
          <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
            <View>
              <Text style={{ fontSize: '60px', marginBottom: '12px' }}>🏫</Text>
              <Text style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '8px' }}>{myClass.className}</Text>
              <Text style={{ fontSize: '14px', opacity: 0.9 }}>我们的专属领地</Text>
            </View>
          </View>

          <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <View style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '30px', fontWeight: 'bold' }}>{classInfo.weeklyBossDefeats}</Text>
              <Text style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>本周Boss击败</Text>
            </View>
            <View style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '30px', fontWeight: 'bold' }}>第{myClass.ranking}名</Text>
              <Text style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>周榜排名</Text>
            </View>
            <View style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <Text style={{ fontSize: '30px', fontWeight: 'bold' }}>{classInfo.territoryLevel}/12</Text>
              <Text style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>领地进度</Text>
            </View>
          </View>

          <View style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '14px', padding: '12px', marginBottom: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>🏰 班级领地（通关Boss点亮）</Text>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {Array.from({ length: 12 }).map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: '22%',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    background: index < classInfo.territoryLevel ? 'rgba(250,204,21,0.85)' : 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: '16px' }}>{index < classInfo.territoryLevel ? '⭐' : '⬜'}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '14px', padding: '12px', marginBottom: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>👥 加入同班（输入班级码）</Text>
            <View style={{ display: 'flex', gap: '8px' }}>
              <Input
                value={classCodeInput}
                onInput={(e) => setClassCodeInput(e.detail.value)}
                placeholder="如 302"
                style={{ flex: 1, background: '#fff', borderRadius: '8px', padding: '8px 10px', color: '#111' }}
              />
              <View
                onClick={handleJoinClass}
                style={{ background: 'rgba(255,255,255,0.35)', borderRadius: '8px', padding: '8px 14px' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>加入</Text>
              </View>
            </View>
          </View>

          <View style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '16px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🛡️ 守护卡牌
            </Text>
            {myGuardCards.length > 0 ? (
              <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {myGuardCards.map((cardId) => {
                  const card = getCardById(cardId);
                  if (!card) return null;

                  return (
                    <View key={cardId} style={{ display: 'flex', justifyContent: 'center' }}>
                      <GameCard card={card} size="sm" owned starsText="⭐" level={1} />
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px' }}>
                <Text style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>还没有配置守护卡牌</Text>
                <View
                  onClick={() => handleSetGuardCards([1, 2, 3])}
                  style={{ background: 'rgba(255,255,255,0.3)', paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'inline-block' }}
                >
                  立即配置
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Text style={{ color: '#f97316' }}>⚔️</Text>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>挑战其他班级</Text>
          </View>
          <Text style={{ color: '#4b5563', fontSize: '14px', marginBottom: '24px' }}>击败其他班级的守护卡牌，提升自己班级的排名！</Text>

          <View style={{ gap: '16px' }}>
            {OTHER_CLASSES.map((classData) => (
              <View
                key={classData.id}
                style={{ border: '2px solid #e5e7eb', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}
              >
                <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>{classData.className}</Text>
                      <View style={{ background: 'linear-gradient(90deg, #facc15 0%, #f97316 100%)', color: '#fff', paddingLeft: '12px', paddingRight: '12px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>
                        第{classData.ranking}名
                      </View>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#4b5563' }}>
                      <Text>🛡️ 防御值: {classData.defenseRate}%</Text>
                      <Text>📊 积分: {classData.points}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ marginBottom: '16px' }}>
                  <Text style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>守护卡牌:</Text>
                  <View style={{ display: 'flex', gap: '8px' }}>
                    {classData.guardCards.map((cardId) => {
                      const card = getCardById(cardId);
                      if (!card) return null;
                      return (
                        <View key={cardId}>
                          <GameCard card={card} size="sm" owned showInfo />
                        </View>
                      );
                    })}
                  </View>
                </View>

                <View
                  onClick={() => startBattle(classData)}
                  style={{ width: '100%', background: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)', color: '#fff', paddingTop: '12px', paddingBottom: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Text>⚔️</Text>
                  发起挑战 (消耗10体力)
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ background: 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)', border: '2px solid #fcd34d', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Text style={{ color: '#f59e0b' }}>🏆</Text>
            <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b' }}>本周 Boss 击败周榜</Text>
          </View>
          <View style={{ gap: '12px' }}>
            {weeklyRanks.map((item, index) => (
              <View
                key={item.className}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: item.isMine ? 'rgba(249,115,22,0.15)' : 'transparent',
                  borderRadius: '10px',
                  padding: '6px 8px',
                }}
              >
                <Text style={{ color: '#374151' }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`} {item.className}
                  {item.isMine ? '（我的班）' : ''}
                </Text>
                <Text style={{ fontWeight: 'bold', color: '#f97316' }}>{item.weeklyBossDefeats} 次</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ background: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '16px', padding: '16px' }}>
          <Text style={{ color: '#1e40af', textAlign: 'center', fontSize: '14px' }}>
            💡 <Text style={{ fontWeight: 'bold' }}>提示：</Text>
            配置强大的守护卡牌可以提升班级防御值，击败其他班级可以获得积分和奖励！
          </Text>
        </View>
      </View>
    </View>
  );
}