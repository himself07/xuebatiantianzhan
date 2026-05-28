import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import { StorageManager } from '../../utils/storage';
import { CARD_DATA, Card, getRarityColor } from '../../types/card';
import GameCard from '../../components/GameCard';

export default function CardCenterPage() {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<{ card: Card; isNewCard: boolean } | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [myCards, setMyCards] = useState<number[]>([]);
  const [coins, setCoins] = useState(0);
  const [drawCount, setDrawCount] = useState(0);
  const [ssrReveal, setSsrReveal] = useState(false);
  const goHome = () => Taro.switchTab({ url: '/pages/MainWorldPage/index' });

  useEffect(() => {
    loadProgress();
  }, []);

  useDidShow(() => {
    loadProgress();
  });

  const loadProgress = () => {
    const progress = StorageManager.getProgress();
    const owned = progress.ownedCards || [];
    const uniqueIds = [...new Set(owned.map((c: any) => c.cardId))];
    setMyCards(uniqueIds);
    setCoins(progress.coins || 0);
    setDrawCount(progress.drawCount || 0);
  };

  const drawCard = () => {
    if (coins < 50) {
      Taro.showModal({
        title: '金币不足',
        content: '需要50金币才能抽卡',
        showCancel: false
      });
      return;
    }

    setIsDrawing(true);

    const newDrawCount = drawCount + 1;

    setTimeout(() => {
      let randomCard: Card;
      if (newDrawCount >= 10) {
        const highRarityCards = CARD_DATA.filter(
          (c) => c.rarity === 'SR' || c.rarity === 'S' || c.rarity === 'SSR'
        );
        randomCard = highRarityCards[Math.floor(Math.random() * highRarityCards.length)];
      } else {
        const rand = Math.random();
        if (rand < 0.03) {
          const ssrCards = CARD_DATA.filter((c) => c.rarity === 'SSR');
          randomCard = ssrCards[Math.floor(Math.random() * ssrCards.length)];
        } else if (rand < 0.1) {
          const sCards = CARD_DATA.filter((c) => c.rarity === 'S');
          randomCard = sCards[Math.floor(Math.random() * sCards.length)];
        } else if (rand < 0.4) {
          const srCards = CARD_DATA.filter((c) => c.rarity === 'SR');
          randomCard = srCards[Math.floor(Math.random() * srCards.length)];
        } else {
          const rCards = CARD_DATA.filter((c) => c.rarity === 'R');
          randomCard = rCards[Math.floor(Math.random() * rCards.length)];
        }
      }

      // 添加卡牌
      const progress = StorageManager.getProgress();
      if (!progress.ownedCards) {
        progress.ownedCards = [];
      }
      const isNew = !progress.ownedCards.some((c: any) => c.cardId === randomCard.id);
      progress.ownedCards.push({
        cardId: randomCard.id,
        stars: 1,
        level: 1,
        obtainedAt: Date.now()
      });
      progress.coins = (progress.coins || 0) - 50;
      progress.drawCount = newDrawCount >= 10 ? 0 : newDrawCount;
      StorageManager.saveProgress(progress);

      const reveal = () => {
        setDrawnCard({ card: randomCard, isNewCard: isNew });
        setIsDrawing(false);
        setSsrReveal(false);
        loadProgress();
      };

      if (randomCard.rarity === 'SSR') {
        setSsrReveal(true);
        setTimeout(reveal, 2000);
      } else {
        reveal();
      }
    }, 1500);
  };

  const closeDrawResult = () => {
    setDrawnCard(null);
  };

  return (
    <View style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #581c87 0%, #be185d 50%, #ea580c 100%)', padding: '16px' }}>
      {ssrReveal ? (
        <View
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(220,38,38,0.92)',
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Text style={{ fontSize: '72px' }}>✨</Text>
          <Text style={{ color: '#fde68a', fontSize: '30px', fontWeight: 'bold', marginTop: '12px' }}>
            SSR 降临！
          </Text>
        </View>
      ) : null}
      {/* 顶部导航 */}
      <View style={{ maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View
            onClick={goHome}
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '10px 14px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <Text style={{ color: '#374151', fontSize: '13px', fontWeight: 'bold' }}>回首页</Text>
          </View>
          <View style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ color: '#7c3aed' }}>✨</Text>
            <Text style={{ fontWeight: 'bold', color: '#374151' }}>抽卡中心</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <View
              onClick={() => Taro.navigateTo({ url: '/pages/CardWarehousePage/index' })}
              style={{ background: '#7c3aed', padding: '12px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
              title="卡牌仓库"
            >
              <Text style={{ color: '#fff' }}>📦</Text>
            </View>
            <View style={{ background: '#eab308', paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{coins} 🪙</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 主内容 */}
      <View style={{ maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto' }}>
        {/* 抽卡区域 */}
        {!drawnCard && (
          <View style={{ marginBottom: '32px' }}>
            <View style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '32px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <View style={{ textAlign: 'center', marginBottom: '24px' }}>
                <View style={{ position: 'relative', display: 'inline-block' }}>
                  <View style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
                    <GameCard
                      card={CARD_DATA[0]}
                      size="xl"
                      owned
                      showBack
                      showInfo={false}
                    />
                  </View>
                  {isDrawing && (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: '48px' }}>✨</Text>
                    </View>
                  )}
                  {!isDrawing && (
                    <View style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#facc15', color: '#713f12', paddingLeft: '12px', paddingRight: '12px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>
                      50金币
                    </View>
                  )}
                </View>
              </View>

              <View
                onClick={drawCard}
                style={{ width: '100%', paddingTop: '16px', paddingBottom: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', color: '#fff' }}
              >
                {isDrawing ? (
                  <View style={{ width: '100%', paddingTop: '16px', paddingBottom: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', background: '#6b7280', color: '#fff' }}>
                    抽取中...
                  </View>
                ) : coins < 50 ? (
                  <View style={{ width: '100%', paddingTop: '16px', paddingBottom: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', background: '#6b7280', color: '#fff' }}>
                    金币不足
                  </View>
                ) : (
                  <View style={{ width: '100%', paddingTop: '16px', paddingBottom: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', background: 'linear-gradient(90deg, #facc15 0%, #f97316 100%)', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    抽取卡牌 (50金币)
                  </View>
                )}
              </View>

              <View style={{ marginTop: '16px', textAlign: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                  距离保底还剩 <Text style={{ fontWeight: 'bold', color: '#fde047' }}>{10 - drawCount}</Text> 次
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '4px' }}>
                  💡 10次抽取必出SR或S级卡牌
                </Text>
              </View>
            </View>

            {/* 稀有度说明 */}
            <View style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⭐ 卡牌稀有度
              </Text>
              <View style={{ gap: '8px', fontSize: '14px' }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.9)' }}>
                  <Text>🌟 R级 - 常见</Text>
                  <Text>概率: 60%</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.9)' }}>
                  <Text>⭐⭐ SR级 - 稀有</Text>
                  <Text>概率: 30%</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.9)' }}>
                  <Text>✨✨✨ S级 - 超稀有</Text>
                  <Text>概率: 10%</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 抽卡结果 */}
        {drawnCard && (
          <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
            <View style={{ background: '#fff', borderRadius: '24px', padding: '32px', maxWidth: '384px', width: '100%' }}>
              <View style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Text style={{ fontSize: '60px', marginBottom: '16px' }}>{drawnCard.isNewCard ? '🎉' : '✨'}</Text>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                  {drawnCard.isNewCard ? '恭喜获得新卡！' : '获得卡牌'}
                </Text>
                {!drawnCard.isNewCard && (
                  <Text style={{ fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>重复卡牌可在仓库中合成升级</Text>
                )}
                <View style={{ display: 'inline-block', paddingLeft: '16px', paddingRight: '16px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold', color: getRarityColor(drawnCard.card.rarity) }}>
                  {drawnCard.card.rarity}级卡牌
                </View>
              </View>

              <View style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <GameCard card={drawnCard.card} size="lg" owned showInfo />
              </View>
              <Text style={{ textAlign: 'center', fontSize: '14px', color: '#4b5563', marginBottom: '12px', display: 'block' }}>
                {drawnCard.card.knowledge} · 技能【{drawnCard.card.skill.name}】
              </Text>

              <View style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
                <View
                  onClick={() => {
                    closeDrawResult();
                    Taro.navigateTo({ url: '/pages/CardWarehousePage/index' });
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)',
                    color: '#fff',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxSizing: 'border-box',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>📦</Text>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>前往仓库合成</Text>
                </View>
                <View
                  onClick={closeDrawResult}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
                    color: '#fff',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>继续抽卡</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 我的卡牌 */}
        {!drawnCard && (
          <View style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: '24px' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                ✨ 我的卡牌 ({myCards.length}/{CARD_DATA.length})
              </Text>
            </View>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between' }}>
              {CARD_DATA.map((card) => {
                const owned = myCards.includes(card.id);
                return (
                  <View
                    key={card.id}
                    onClick={() => owned && setSelectedCard(card)}
                    style={{ width: '48%', display: 'flex', justifyContent: 'center', marginBottom: '8px' }}
                  >
                    <GameCard
                      card={card}
                      size="md"
                      owned={owned}
                      showInfo
                      onClick={() => owned && setSelectedCard(card)}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {selectedCard && (
          <View
            style={{
              background: 'rgba(15,23,42,0.55)',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.24)',
              marginBottom: '16px',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <GameCard card={selectedCard} size="sm" owned showInfo={false} />
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                已选卡牌：{selectedCard.name}
              </Text>
            </View>
            <Text style={{ color: '#e2e8f0', fontSize: '12px', display: 'block' }}>
              知识主题：{selectedCard.knowledge}
            </Text>
            <Text style={{ color: '#e2e8f0', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              属性：攻击 {selectedCard.attack} / 防御 {selectedCard.defense}
            </Text>
            <View
              onClick={() => setSelectedCard(null)}
              style={{
                marginTop: '10px',
                borderRadius: '10px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.18)',
                display: 'inline-block',
              }}
            >
              <Text style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>关闭详情</Text>
            </View>
          </View>
        )}

        {/* 提示 */}
        {!drawnCard && (
          <View style={{ marginTop: '24px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '14px', color: '#92400e', textAlign: 'center' }}>
              💡 答题获取金币，收集所有卡牌成为学霸！
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}