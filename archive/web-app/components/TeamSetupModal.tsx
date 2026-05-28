import { useState, useEffect, useCallback } from 'react';
import { X, Users } from 'lucide-react';
import { CARD_DATA, getStarDisplay, getCardStats, OwnedCard } from '../types/card';
import { StorageManager } from '../utils/storage';

interface TeamSetupModalProps {
  onClose: () => void;
  onConfirm: (teamIds: number[]) => void;
}

export function TeamSetupModal({ onClose, onConfirm }: TeamSetupModalProps) {
  const [ownedCardsList, setOwnedCardsList] = useState<OwnedCard[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<number[]>([]);
  const [pressingCard, setPressingCard] = useState<number | null>(null);

  useEffect(() => {
    setOwnedCardsList(StorageManager.getOwnedCardsList());
    setSelectedTeam(StorageManager.getCardTeam());
  }, []);

  const toggleCard = useCallback((cardId: number) => {
    setSelectedTeam(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else if (prev.length < 5) {
        return [...prev, cardId];
      } else {
        alert('最多只能选择5张卡牌！');
        return prev;
      }
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedTeam.length === 0) {
      alert('请至少选择1张卡牌！');
      return;
    }
    StorageManager.setCardTeam(selectedTeam);
    onConfirm(selectedTeam);
  }, [selectedTeam, onConfirm]);

  const myCards = CARD_DATA.filter((card) => ownedCardsList.some((c) => c.cardId === card.id));

  const getCardOwnedInfo = (cardId: number) => {
    const ownedCards = ownedCardsList.filter((c) => c.cardId === cardId);
    if (ownedCards.length === 0) return null;
    return ownedCards[0];
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="size-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-800">组建卡牌队伍</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors active:scale-95"
          >
            <X className="size-5 text-gray-700" />
          </button>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6 border-2 border-purple-200">
          <h3 className="font-bold text-gray-800 mb-3">
            已选择 ({selectedTeam.length}/5)
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, index) => {
              const cardId = selectedTeam[index];
              const card = CARD_DATA.find((c) => c.id === cardId);
              const ownedInfo = cardId ? getCardOwnedInfo(cardId) : null;
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-xl flex items-center justify-center ${
                    card
                      ? `bg-gradient-to-br ${card.color} cursor-pointer`
                      : 'bg-gray-200 border-2 border-dashed border-gray-400'
                  } transition-all relative select-none touch-none`}
                  onClick={() => card && toggleCard(card.id)}
                  onTouchStart={() => card && setPressingCard(cardId)}
                  onTouchEnd={() => setPressingCard(null)}
                  onMouseDown={() => card && setPressingCard(cardId)}
                  onMouseUp={() => setPressingCard(null)}
                  onMouseLeave={() => setPressingCard(null)}
                >
                  {card ? (
                    <div className={`text-center transition-transform duration-100 ${pressingCard === cardId ? 'scale-90' : ''}`}>
                      <div className="text-3xl mb-1">{card.emoji}</div>
                      <div className="text-[10px] text-yellow-300">
                        {ownedInfo ? getStarDisplay(ownedInfo.stars) : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl text-gray-400">+</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">我的卡牌</h3>
          {myCards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-2">暂无卡牌</p>
              <p className="text-sm">去抽卡中心获取卡牌吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {myCards.map((card) => {
                const isSelected = selectedTeam.includes(card.id);
                const ownedInfo = getCardOwnedInfo(card.id);
                const stats = ownedInfo ? getCardStats(card, ownedInfo.stars) : null;
                return (
                  <div
                    key={card.id}
                    onClick={() => toggleCard(card.id)}
                    onTouchStart={() => setPressingCard(card.id)}
                    onTouchEnd={() => setPressingCard(null)}
                    onMouseDown={() => setPressingCard(card.id)}
                    onMouseUp={() => setPressingCard(null)}
                    onMouseLeave={() => setPressingCard(null)}
                    className={`rounded-xl p-4 cursor-pointer transition-all duration-100 select-none touch-none ${
                      isSelected
                        ? `bg-gradient-to-br ${card.color} ring-4 ring-yellow-400`
                        : `bg-gradient-to-br ${card.color} opacity-70 active:opacity-100`
                    } ${pressingCard === card.id ? 'scale-95' : ''}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{card.emoji}</div>
                      <div className="text-xs font-bold text-white mb-1">
                        {card.rarity}
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {card.name}
                      </h4>
                      {ownedInfo && (
                        <div className="text-xs text-yellow-300 mb-1">
                          {getStarDisplay(ownedInfo.stars)}
                        </div>
                      )}
                      <p className="text-xs text-white/80 mb-2">
                        {card.knowledge}
                      </p>
                      {stats && (
                        <div className="flex justify-between text-xs text-white/90">
                          <span>⚔️ {stats.attack}</span>
                          <span>🛡️ {stats.defense}</span>
                        </div>
                      )}
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
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedTeam.length === 0}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${
              selectedTeam.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white active:scale-95'
            }`}
          >
            确认出战
          </button>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <p className="text-xs text-yellow-800 text-center">
            💡 卡牌顺序即为出战顺序，先被消灭的一方失败
          </p>
        </div>
      </div>
    </div>
  );
}