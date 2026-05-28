import { useState, useCallback } from 'react';
import { X, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { CARD_DATA, getStarDisplay, getCardStats, OwnedCard } from '../types/card';
import { StorageManager } from '../utils/storage';

interface CardUpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export function CardUpgradeModal({ onClose, onUpgrade }: CardUpgradeModalProps) {
  const [ownedCardsList, setOwnedCardsList] = useState<OwnedCard[]>(() => StorageManager.getOwnedCardsList());
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [pressingCard, setPressingCard] = useState<number | null>(null);

  const handleCardPress = useCallback((index: number) => {
    setSelectedCardIndex(index);
  }, []);

  const handleUpgrade = useCallback(() => {
    if (selectedCardIndex === null) {
      alert('请先选择要升星的卡牌！');
      return;
    }

    const selectedCard = ownedCardsList[selectedCardIndex];
    const cardData = CARD_DATA.find(c => c.id === selectedCard.cardId);

    if (!cardData) return;

    const sameCardCount = ownedCardsList.filter(c => c.cardId === selectedCard.cardId).length;

    if (sameCardCount < 2) {
      alert(`需要至少2张${cardData.name}才能升星！\n当前拥有：${sameCardCount}张\n去抽卡或收集更多吧！`);
      return;
    }

    if (selectedCard.stars >= 7) {
      alert('该卡牌已达到最高星级（7星）！');
      return;
    }

    const materialIndex = ownedCardsList.findIndex((c, idx) =>
      c.cardId === selectedCard.cardId && idx !== selectedCardIndex
    );

    if (materialIndex === -1) {
      alert('未找到材料卡牌！');
      return;
    }

    const success = StorageManager.mergeCards(materialIndex, selectedCardIndex);
    if (success) {
      const newStars = selectedCard.stars + 1;
      alert(`${cardData.name} 升星成功！\n⭐ ${selectedCard.stars}星 → ${newStars}星 ⭐\n\n属性提升：\n⚔️ 攻击 ${getCardStats(cardData, selectedCard.stars).attack} → ${getCardStats(cardData, newStars).attack}\n🛡️ 防御 ${getCardStats(cardData, selectedCard.stars).defense} → ${getCardStats(cardData, newStars).defense}`);

      const updatedList = StorageManager.getOwnedCardsList();
      setOwnedCardsList(updatedList);

      const newIndex = updatedList.findIndex(c => c.cardId === selectedCard.cardId && c.stars === newStars);
      setSelectedCardIndex(newIndex !== -1 ? newIndex : null);
      onUpgrade();
    } else {
      alert('升星失败！');
    }
  }, [selectedCardIndex, ownedCardsList, onUpgrade]);

  const cardGroups = ownedCardsList.reduce((acc, ownedCard, index) => {
    const key = `${ownedCard.cardId}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({ ...ownedCard, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<OwnedCard & { originalIndex: number }>>);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-800">卡牌升星</h2>
          </div>
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors active:scale-95">
            <X className="size-5 text-gray-700" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border-2 border-purple-200">
          <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Sparkles className="size-4 text-purple-500" />
            升星规则
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 拥有2张同名卡牌即可升星</li>
            <li>• 1张作为主卡，1张作为材料被消耗</li>
            <li>• 每升一星，属性提升15%</li>
            <li>• 最高可升至7星</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 mb-6 border-2 border-yellow-300">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-yellow-500" />
            升星预览
          </h3>
          {selectedCardIndex !== null ? (
            <CardUpgradePreview
              ownedCard={ownedCardsList[selectedCardIndex]}
              totalCount={ownedCardsList.filter(c => c.cardId === ownedCardsList[selectedCardIndex].cardId).length}
            />
          ) : (
            <div className="text-center py-6 text-gray-400">
              <div className="text-4xl mb-2">👆</div>
              <p>点击下方卡牌选择升星目标</p>
            </div>
          )}
        </div>

        {selectedCardIndex !== null && (
          <button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-4 rounded-2xl font-bold text-lg active:scale-[0.98] transition-transform shadow-lg shadow-purple-500/30 mb-6"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="size-5" />
              <span>升星成功！</span>
              <Sparkles className="size-5" />
            </div>
          </button>
        )}

        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">我的卡牌（点击选择）</h3>
          {Object.keys(cardGroups).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">暂无卡牌</p>
              <p className="text-sm">去抽卡中心获取卡牌吧！</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(cardGroups).map(([cardId, cards]) => {
                const cardData = CARD_DATA.find(c => c.id === Number(cardId));
                if (!cardData) return null;

                const canUpgrade = cards.length >= 2 && cards[0].stars < 7;

                return (
                  <div
                    key={cardId}
                    className={`bg-gradient-to-br ${cardData.color} rounded-2xl p-4 ${canUpgrade ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{cardData.emoji}</span>
                        <div>
                          <h4 className="font-bold text-white text-lg">{cardData.name}</h4>
                          <p className="text-white/80 text-sm">{cardData.knowledge}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/80 text-sm">
                          拥有 {cards.length} 张
                        </div>
                        {canUpgrade && (
                          <div className="flex items-center gap-1 text-yellow-300 text-sm font-bold">
                            <Sparkles className="size-4" />
                            可升星
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
                      {cards.map((ownedCard) => {
                        const isSelected = ownedCard.originalIndex === selectedCardIndex;
                        const hasMaterial = cards.length >= 2;

                        return (
                          <div
                            key={ownedCard.originalIndex}
                            onClick={() => handleCardPress(ownedCard.originalIndex)}
                            onTouchStart={() => setPressingCard(ownedCard.originalIndex)}
                            onTouchEnd={() => setPressingCard(null)}
                            onMouseDown={() => setPressingCard(ownedCard.originalIndex)}
                            onMouseUp={() => setPressingCard(null)}
                            onMouseLeave={() => setPressingCard(null)}
                            className={`relative rounded-xl p-2 cursor-pointer transition-all duration-100 select-none touch-none ${
                              isSelected
                                ? 'bg-white/30 ring-2 ring-yellow-400 scale-105'
                                : pressingCard === ownedCard.originalIndex
                                ? 'bg-white/20 scale-95'
                                : 'bg-black/20 active:bg-white/20'
                            } ${!hasMaterial && ownedCard.stars >= 7 ? 'opacity-50' : ''}`}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-1">{cardData.emoji}</div>
                              <div className="text-xs text-yellow-300">
                                {getStarDisplay(ownedCard.stars)}
                              </div>
                              <div className="text-[10px] text-white/90">
                                Lv.{ownedCard.level}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full p-0.5">
                                <Sparkles className="size-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors active:scale-95"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

function CardUpgradePreview({
  ownedCard,
  totalCount,
}: {
  ownedCard: OwnedCard;
  totalCount: number;
}) {
  const card = CARD_DATA.find((c) => c.id === ownedCard.cardId);
  if (!card) return null;

  const currentStats = getCardStats(card, ownedCard.stars);
  const nextStats = getCardStats(card, ownedCard.stars + 1);
  const canUpgrade = totalCount >= 2 && ownedCard.stars < 7;

  return (
    <div className="flex items-center gap-4">
      <div className={`bg-gradient-to-br ${card.color} rounded-xl p-4 flex-1 relative`}>
        {ownedCard.stars >= 7 && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            MAX
          </div>
        )}
        <div className="text-center">
          <div className="text-5xl mb-2">{card.emoji}</div>
          <div className="text-sm text-yellow-300 mb-1">
            {getStarDisplay(ownedCard.stars)}
          </div>
          <h4 className="font-bold text-white">{card.name}</h4>
        </div>
      </div>

      {canUpgrade ? (
        <>
          <div className="flex flex-col items-center">
            <ChevronRight className="size-8 text-yellow-500 animate-pulse" />
            <div className="text-xs text-yellow-600 font-bold">消耗1张</div>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 flex-1 relative">
            <div className="absolute top-2 right-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
              升星后
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">{card.emoji}</div>
              <div className="text-sm text-white mb-1">
                {getStarDisplay(ownedCard.stars + 1)}
              </div>
              <h4 className="font-bold text-white">{card.name}</h4>
            </div>
          </div>
        </>
      ) : ownedCard.stars >= 7 ? (
        <div className="flex-1 text-center py-4">
          <div className="text-4xl mb-2">👑</div>
          <p className="text-yellow-600 font-bold">已达最高星级</p>
        </div>
      ) : (
        <div className="flex-1 text-center py-4">
          <div className="text-4xl mb-2">📚</div>
          <p className="text-gray-600 font-bold">需要更多同名卡</p>
          <p className="text-gray-500 text-sm">当前: {totalCount}/2</p>
        </div>
      )}

      {canUpgrade && (
        <div className="bg-black/10 rounded-xl p-4 w-32">
          <div className="text-center text-sm text-gray-600 mb-2">属性变化</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>⚔️ 攻击</span>
              <span className="font-bold text-green-600">
                {currentStats.attack} → {nextStats.attack}
              </span>
            </div>
            <div className="flex justify-between">
              <span>🛡️ 防御</span>
              <span className="font-bold text-green-600">
                {currentStats.defense} → {nextStats.defense}
              </span>
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-yellow-600 font-bold">
            +15% 属性提升
          </div>
        </div>
      )}
    </div>
  );
}