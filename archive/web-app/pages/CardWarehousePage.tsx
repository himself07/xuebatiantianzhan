import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Star, TrendingUp, Package, Sparkles } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { CARD_DATA, Card, OwnedCard, getCardStats, getUpgradeCost, getRarityBorder, getRarityColor, getStarDisplay } from '../types/card';

interface CardUpgradeModalProps {
  card: Card;
  ownedCard: OwnedCard;
  onClose: () => void;
  onUpgrade: () => void;
}

function CardUpgradeModal({ card, ownedCard, onClose, onUpgrade }: CardUpgradeModalProps) {
  const [availableCards, setAvailableCards] = useState<OwnedCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  useEffect(() => {
    // 获取所有同卡牌同星级的卡牌（不包括当前卡牌）
    const ownedCards = StorageManager.getOwnedCards();
    const sameCards = ownedCards.filter(
      (c) =>
        c.cardId === card.id &&
        c.stars === ownedCard.stars &&
        c.obtainedAt !== ownedCard.obtainedAt // 不包括当前卡牌
    );
    setAvailableCards(sameCards);
  }, [card.id, ownedCard.stars, ownedCard.obtainedAt]);

  const upgradeCost = getUpgradeCost(ownedCard.level, ownedCard.stars);
  const canUpgrade = selectedCards.length >= upgradeCost;

  const handleUpgrade = () => {
    if (!canUpgrade) return;

    // 删除被消耗的卡牌
    let ownedCards = StorageManager.getOwnedCards();
    ownedCards = ownedCards.filter(
      (c) => !selectedCards.includes(c.obtainedAt)
    );

    // 升级当前卡牌
    const cardIndex = ownedCards.findIndex(
      (c) => c.cardId === ownedCard.cardId && c.obtainedAt === ownedCard.obtainedAt
    );
    if (cardIndex !== -1) {
      ownedCards[cardIndex].level += 1;
    }

    localStorage.setItem('ownedCards', JSON.stringify(ownedCards));
    onUpgrade();
  };

  const toggleCardSelection = (obtainedAt: number) => {
    setSelectedCards((prev) => {
      if (prev.includes(obtainedAt)) {
        return prev.filter((t) => t !== obtainedAt);
      } else {
        if (prev.length < upgradeCost) {
          return [...prev, obtainedAt];
        }
        return prev;
      }
    });
  };

  const currentStats = getCardStats(card, ownedCard.stars, ownedCard.level);
  const nextStats = getCardStats(card, ownedCard.stars, ownedCard.level + 1);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="size-7 text-purple-600" />
            卡牌升级
          </h2>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 当前卡牌信息 */}
        <div className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 mb-6`}>
          <div className="flex items-start justify-between text-white">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-6xl">{card.emoji}</span>
                <div>
                  <h3 className="text-3xl font-bold">{card.name}</h3>
                  <p className="text-sm opacity-90">{card.knowledge}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`${getRarityColor(card.rarity)} font-bold text-lg`}>
                      {card.rarity}
                    </span>
                    <span className="text-sm">{getStarDisplay(ownedCard.stars)}</span>
                    <span className="bg-white/30 px-2 py-1 rounded text-xs font-bold">
                      Lv.{ownedCard.level}
                    </span>
                  </div>
                </div>
              </div>

              {/* 属性对比 */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <p className="text-xs opacity-90 mb-1">当前属性</p>
                  <div className="space-y-1">
                    <div>⚔️ 攻击: {currentStats.attack}</div>
                    <div>🛡️ 防御: {currentStats.defense}</div>
                  </div>
                </div>
                <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3 border-2 border-white/50">
                  <p className="text-xs opacity-90 mb-1">升级后属性</p>
                  <div className="space-y-1 font-bold">
                    <div className="text-green-300">
                      ⚔️ 攻击: {nextStats.attack} <span className="text-xs">(+{nextStats.attack - currentStats.attack})</span>
                    </div>
                    <div className="text-blue-300">
                      🛡️ 防御: {nextStats.defense} <span className="text-xs">(+{nextStats.defense - currentStats.defense})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 升级条件 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">
              升级条件: 消耗 {upgradeCost} 张相同卡牌
            </h3>
            <span className={`font-bold ${canUpgrade ? 'text-green-600' : 'text-gray-400'}`}>
              {selectedCards.length} / {upgradeCost}
            </span>
          </div>

          {availableCards.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {availableCards.map((ownedCard) => {
                const isSelected = selectedCards.includes(ownedCard.obtainedAt);
                return (
                  <button
                    key={ownedCard.obtainedAt}
                    onClick={() => toggleCardSelection(ownedCard.obtainedAt)}
                    className={`bg-gradient-to-br ${card.color} rounded-xl p-4 border-2 transition-all ${
                      isSelected
                        ? 'border-yellow-400 ring-4 ring-yellow-400/50 scale-95'
                        : 'border-white/50 hover:border-white hover:scale-105'
                    }`}
                  >
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">{card.emoji}</div>
                      <p className="text-xs font-bold">{card.name}</p>
                      <p className="text-xs opacity-90">Lv.{ownedCard.level}</p>
                      {isSelected && (
                        <div className="mt-2 bg-yellow-400 text-gray-800 px-2 py-1 rounded-full text-xs font-bold">
                          ✓ 已选择
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-500 mb-2">没有可用于升级的相同卡牌</p>
              <p className="text-sm text-gray-400">需要通过抽卡获得更多相同卡牌</p>
            </div>
          )}
        </div>

        {/* 升级按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            className={`flex-1 py-4 rounded-xl font-bold transition-all ${
              canUpgrade
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canUpgrade ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="size-5" />
                确认升级
              </span>
            ) : (
              '材料不足'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CardWarehousePage() {
  const navigate = useNavigate();
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<{ card: Card; owned: OwnedCard } | null>(null);
  const [filterRarity, setFilterRarity] = useState<Card['rarity'] | 'ALL'>('ALL');

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = () => {
    const cards = StorageManager.getOwnedCards();
    setOwnedCards(cards);
  };

  const handleUpgradeComplete = () => {
    loadCards();
    setSelectedCard(null);
  };

  const groupedCards = ownedCards.reduce((acc, ownedCard) => {
    const key = `${ownedCard.cardId}-${ownedCard.stars}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(ownedCard);
    return acc;
  }, {} as Record<string, OwnedCard[]>);

  const filteredGroups = Object.entries(groupedCards).filter(([key, cards]) => {
    const cardId = parseInt(key.split('-')[0]);
    const card = CARD_DATA.find((c) => c.id === cardId);
    if (!card) return false;
    if (filterRarity === 'ALL') return true;
    return card.rarity === filterRarity;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      {/* 顶部导航 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/card-center')}
            className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <Package className="size-5 text-purple-600" />
            <span className="font-bold text-gray-700">卡牌仓库</span>
          </div>
          <div className="w-11"></div>
        </div>

        {/* 稀有度筛选 */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(['ALL', 'R', 'SR', 'S', 'SSR'] as const).map((rarity) => (
              <button
                key={rarity}
                onClick={() => setFilterRarity(rarity)}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filterRarity === rarity
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {rarity === 'ALL' ? '全部' : rarity}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 卡牌列表 */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              我的卡牌 ({ownedCards.length} 张)
            </h2>
            <div className="text-sm text-gray-500">
              {filteredGroups.length} 种卡牌
            </div>
          </div>

          {filteredGroups.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGroups.map(([key, cards]) => {
                const cardId = parseInt(key.split('-')[0]);
                const card = CARD_DATA.find((c) => c.id === cardId)!;
                const representativeCard = cards[0];
                const stats = getCardStats(card, representativeCard.stars, representativeCard.level);

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedCard({ card, owned: representativeCard })}
                    className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 border-2 ${getRarityBorder(card.rarity)} cursor-pointer hover:scale-105 transition-all shadow-lg relative`}
                  >
                    {/* 数量标记 */}
                    {cards.length > 1 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white size-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                        ×{cards.length}
                      </div>
                    )}

                    <div className="text-center text-white">
                      <div className="text-6xl mb-3">{card.emoji}</div>
                      <h3 className="font-bold text-lg mb-1">{card.name}</h3>
                      <p className="text-xs opacity-90 mb-2">{card.knowledge}</p>

                      <div className="bg-white/30 backdrop-blur-sm rounded-xl p-2 mb-2">
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className="font-bold">{card.rarity}</span>
                          <span>{getStarDisplay(representativeCard.stars)}</span>
                          <span className="bg-white/30 px-2 py-0.5 rounded">
                            Lv.{representativeCard.level}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs space-y-1">
                        <div>⚔️ {stats.attack} | 🛡️ {stats.defense}</div>
                      </div>

                      <button className="mt-3 w-full bg-white/20 hover:bg-white/30 py-2 rounded-lg text-sm font-bold transition-colors">
                        <span className="flex items-center justify-center gap-1">
                          <Star className="size-4" />
                          升级
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg mb-2">暂无卡牌</p>
              <p className="text-gray-400 text-sm mb-6">去卡牌中心抽取卡牌吧！</p>
              <button
                onClick={() => navigate('/card-center')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                前往抽卡
              </button>
            </div>
          )}
        </div>

        {/* 提示 */}
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4">
          <p className="text-yellow-800 text-center text-sm">
            💡 <span className="font-bold">提示：</span>
            消耗相同星级的同名卡牌可以升级，升级后攻击和防御属性都会提升！
          </p>
        </div>
      </div>

      {/* 升级弹窗 */}
      {selectedCard && (
        <CardUpgradeModal
          card={selectedCard.card}
          ownedCard={selectedCard.owned}
          onClose={() => setSelectedCard(null)}
          onUpgrade={handleUpgradeComplete}
        />
      )}
    </div>
  );
}
