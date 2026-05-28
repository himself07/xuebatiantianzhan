import { X, Sword, Shield, Sparkles } from 'lucide-react';
import { Card } from '../types/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CardDetailModalProps {
  card: Card;
  onClose: () => void;
}

export function CardDetailModal({ card, onClose }: CardDetailModalProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'S':
        return 'text-orange-500 border-orange-500';
      case 'SR':
        return 'text-purple-500 border-purple-500';
      default:
        return 'text-blue-500 border-blue-500';
    }
  };

  const getRarityStars = (rarity: string) => {
    switch (rarity) {
      case 'S':
        return '✨✨✨';
      case 'SR':
        return '⭐⭐';
      default:
        return '🌟';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
        >
          <X className="size-5 text-gray-700" />
        </button>

        {/* 稀有度 */}
        <div className="text-center mb-4">
          <div className={`inline-block px-4 py-2 rounded-full border-2 ${getRarityColor(card.rarity)} bg-white`}>
            <span className="font-bold">{card.rarity}级卡牌</span>
            <span className="ml-2">{getRarityStars(card.rarity)}</span>
          </div>
        </div>

        {/* 卡牌图片 */}
        <div className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold text-white mb-2">{card.name}</h2>
              <p className="text-white/90 text-sm">{card.knowledge}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 mb-4">
              <ImageWithFallback
                src={card.image}
                alt={card.name}
                className="w-full h-48 object-cover rounded-lg animate-pulse"
              />
            </div>
          </div>
        </div>

        {/* 属性 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Sword className="size-4 text-red-500" />
                攻击力
              </span>
            </div>
            <div className="text-3xl font-bold text-red-600">{card.attack}</div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <Shield className="size-4 text-blue-500" />
                防御力
              </span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{card.defense}</div>
          </div>
        </div>

        {/* 技能 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-5 text-purple-500" />
            <h3 className="font-bold text-gray-800">专属技能</h3>
          </div>
          <div className="bg-white rounded-xl p-3">
            <h4 className="font-bold text-purple-600 mb-2">{card.skill}</h4>
            <p className="text-sm text-gray-600">{card.skillDescription}</p>
          </div>
        </div>

        {/* 底部说明 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <p className="text-xs text-yellow-800 text-center">
            💡 在竞技场中使用此卡牌可以发挥特殊技能
          </p>
        </div>
      </div>
    </div>
  );
}
