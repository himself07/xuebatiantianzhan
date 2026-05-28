import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Sparkles, Star, TrendingUp, Package } from 'lucide-react';
import { CARD_DATA, Card, getStarDisplay } from '../types/card';
import { StorageManager } from '../utils/storage';
import { CardDetailModal } from '../components/CardDetailModal';
import { CardUpgradeModal } from '../components/CardUpgradeModal';
import { PageGreeting } from '../components/PageGreeting';
import { playSound } from '../utils/audio';

const cardCenterGreetings = [
  '卡牌中心到啦！看看有什么新卡牌~ 🎴',
  '收集更多的卡牌吧！✨',
  '每张卡牌都有它的力量！🌈',
];

export function CardCenterPage() {
  const navigate = useNavigate();
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<{ card: Card; isNewCard: boolean } | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [myCards, setMyCards] = useState<number[]>([]);
  const [coins, setCoins] = useState(0);
  const [drawCount, setDrawCount] = useState(0);

  const loadProgress = useCallback(() => {
    const progress = StorageManager.getProgress();
    setMyCards(StorageManager.getUniqueCardIds());
    setCoins(progress.coins);
    setDrawCount(progress.drawCount);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const drawCard = useCallback(() => {
    if (coins < 50) {
      playSound('error');
      alert('金币不足！需要50金币才能抽卡');
      return;
    }

    setIsDrawing(true);
    playSound('draw');

    const newDrawCount = drawCount + 1;

    setTimeout(() => {
      let randomCard: Card;
      if (newDrawCount >= 10) {
        const highRarityCards = CARD_DATA.filter((c) => c.rarity === 'SR' || c.rarity === 'S');
        randomCard = highRarityCards[Math.floor(Math.random() * highRarityCards.length)];
      } else {
        const rand = Math.random();
        if (rand < 0.1) {
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

      const isNewCard = StorageManager.addCard(randomCard.id);
      setDrawnCard({ card: randomCard, isNewCard });
      setIsDrawing(false);

      if (randomCard.rarity === 'S') {
        playSound('levelUp');
      } else {
        playSound('coin');
      }

      StorageManager.updateProgress((progress) => ({
        coins: progress.coins - 50,
        drawCount: newDrawCount >= 10 ? 0 : newDrawCount,
      }));

      loadProgress();
    }, 2000);
  }, [coins, drawCount, loadProgress]);

  const closeDrawResult = useCallback(() => {
    setDrawnCard(null);
  }, []);

  const handleCardClick = useCallback((card: Card, owned: boolean) => {
    if (owned) {
      setSelectedCard(card);
    }
  }, []);

  const handleUpgradeComplete = useCallback(() => {
    loadProgress();
  }, [loadProgress]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'S': return 'text-orange-500';
      case 'SR': return 'text-purple-500';
      default: return 'text-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 p-4">
      <PageGreeting pageName="card-center" pageGreetings={cardCenterGreetings} />
      <div className="max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md active:scale-95 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <Sparkles className="size-5 text-purple-500" />
            <span className="font-bold text-gray-700">抽卡中心</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/card-warehouse')}
              className="bg-purple-500 p-3 rounded-full shadow-md active:scale-95 transition-transform"
              title="卡牌仓库"
            >
              <Package className="size-5 text-white" />
            </button>
            <div className="bg-yellow-500 px-3 py-2 rounded-full shadow-md flex items-center gap-1">
              <span className="text-sm font-bold text-white">{coins} 🪙</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {!drawnCard && (
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-6 border border-white/20">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className={`w-48 h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-2xl flex items-center justify-center ${
                    isDrawing ? 'animate-pulse' : ''
                  }`}>
                    {isDrawing ? (
                      <div className="text-white">
                        <Sparkles className="size-20 mx-auto mb-4 animate-spin" />
                        <p className="text-lg font-bold">抽取中...</p>
                      </div>
                    ) : (
                      <div className="text-white">
                        <Star className="size-20 mx-auto mb-4" />
                        <p className="text-lg font-bold">点击抽卡</p>
                      </div>
                    )}
                  </div>
                  {!isDrawing && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                      50金币
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={drawCard}
                disabled={isDrawing || coins < 50}
                className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all active:scale-95 ${
                  isDrawing || coins < 50
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg'
                }`}
              >
                {isDrawing ? '抽取中...' : coins < 50 ? '金币不足' : '抽取卡牌 (50金币)'}
              </button>

              <div className="mt-4 text-center">
                <p className="text-white/80 text-sm">
                  距离保底还剩 <span className="font-bold text-yellow-300">{10 - drawCount}</span> 次
                </p>
                <p className="text-white/60 text-xs mt-1">
                  💡 10次抽取必出SR或S级卡牌
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Star className="size-5" />
                卡牌稀有度
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-white/90">
                  <span>🌟 R级 - 常见</span>
                  <span>概率: 60%</span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span>⭐⭐ SR级 - 稀有</span>
                  <span>概率: 30%</span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span>✨✨✨ S级 - 超稀有</span>
                  <span>概率: 10%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {drawnCard && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={closeDrawResult}>
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-bounce">
                  {drawnCard.isNewCard ? '🎉' : '✨'}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {drawnCard.isNewCard ? '恭喜获得新卡！' : '获得卡牌'}
                </h2>
                {!drawnCard.isNewCard && (
                  <p className="text-sm text-gray-600 mb-2">重复卡牌可在仓库中合成升级</p>
                )}
                <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold ${getRarityColor(drawnCard.card.rarity)}`}>
                  {drawnCard.card.rarity}级卡牌
                </div>
              </div>

              <div className={`bg-gradient-to-br ${drawnCard.card.color} rounded-2xl p-6 text-white shadow-2xl mb-6`}>
                <div className="text-center">
                  <div className="text-7xl mb-4 animate-pulse">{drawnCard.card.emoji}</div>
                  <h3 className="text-2xl font-bold mb-2">{drawnCard.card.name}</h3>
                  <p className="text-sm opacity-90 mb-3">{drawnCard.card.knowledge}</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs opacity-90 mb-1">初始属性</div>
                    <div className="flex items-center justify-center gap-4">
                      <span>⚔️ {drawnCard.card.attack}</span>
                      <span>🛡️ {drawnCard.card.defense}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    closeDrawResult();
                    navigate('/card-warehouse');
                  }}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Package className="size-5" />
                  前往仓库合成
                </button>
                <button
                  onClick={closeDrawResult}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  继续抽卡
                </button>
              </div>
            </div>
          </div>
        )}

        {!drawnCard && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                <Sparkles className="size-5" />
                我的卡牌 ({myCards.length}/{CARD_DATA.length})
              </h3>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-xl font-bold text-sm active:scale-95 transition-transform flex items-center gap-1"
              >
                <TrendingUp className="size-4" />
                升星
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {CARD_DATA.map((card) => {
                const owned = myCards.includes(card.id);
                const stars = owned ? StorageManager.getCardStars(card.id) : 0;
                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card, owned)}
                    onTouchStart={() => {}}
                    className={`rounded-xl p-4 transition-all duration-100 select-none touch-none ${
                      owned
                        ? `bg-gradient-to-br ${card.color} shadow-lg cursor-pointer active:scale-95`
                        : 'bg-gray-800/50 opacity-50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{owned ? card.emoji : '❓'}</div>
                      {owned && stars > 0 && (
                        <div className="text-xs text-yellow-300 mb-1">{getStarDisplay(stars)}</div>
                      )}
                      <div className={`text-xs font-bold mb-1 ${owned ? 'text-white' : getRarityColor(card.rarity)}`}>
                        {card.rarity}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {owned ? card.name : '未获得'}
                      </h4>
                      {owned && <p className="text-xs text-white/80">{card.knowledge}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showUpgradeModal && (
          <CardUpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            onUpgrade={handleUpgradeComplete}
          />
        )}

        {selectedCard && (
          <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}

        {!drawnCard && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 text-center">
              💡 答题获取金币，收集所有卡牌成为学霸！
            </p>
          </div>
        )}
      </div>
    </div>
  );
}