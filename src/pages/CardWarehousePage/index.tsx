import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useEffect, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import { StorageManager } from '../../utils/storage';
import { safeNavigate } from '../../utils/navigation';
import {
  CARD_DATA,
  Card,
  OwnedCard,
  getCardStats,
  getStarDisplay,
  getRarityColor,
  getUpgradeCost,
} from '../../types/card';
import GameCard from '../../components/GameCard';

function getGroupComposeStatus(cards: OwnedCard[]): { canCompose: boolean; needCount: number; readyCount: number } {
  if (cards.length === 0) {
    return { canCompose: false, needCount: 0, readyCount: 0 };
  }
  const baseCard = cards[0];
  const needCount = getUpgradeCost(baseCard.level, baseCard.stars);
  const readyCount = cards.length - 1;
  return {
    canCompose: readyCount >= needCount,
    needCount,
    readyCount,
  };
}

interface CardUpgradeModalProps {
  card: Card;
  ownedCard: OwnedCard;
  allOwnedCards: OwnedCard[];
  onClose: () => void;
  onUpgrade: () => void;
}

function CardUpgradeModal({ card, ownedCard, allOwnedCards, onClose, onUpgrade }: CardUpgradeModalProps) {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  const upgradeCost = getUpgradeCost(ownedCard.level, ownedCard.stars);
  const candidateCards = allOwnedCards.filter(
    (item) =>
      item.cardId === ownedCard.cardId &&
      item.stars === ownedCard.stars &&
      item.obtainedAt !== ownedCard.obtainedAt
  );
  const canUpgrade = selectedCards.length >= upgradeCost;

  const handleUpgrade = () => {
    if (!canUpgrade) return;

    StorageManager.updateProgress((progress) => {
      const nextOwnedCards = progress.ownedCards
        .filter((item) => !selectedCards.includes(item.obtainedAt))
        .map((item) => {
          if (item.cardId === ownedCard.cardId && item.obtainedAt === ownedCard.obtainedAt) {
            return { ...item, level: item.level + 1 };
          }
          return item;
        });
      return { ownedCards: nextOwnedCards };
    });
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
    <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <View style={{ background: '#fff', borderRadius: '24px', padding: '24px', maxWidth: '672px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📈 卡牌升级
          </Text>
          <View
            onClick={onClose}
            style={{ background: '#e5e7eb', padding: '8px', borderRadius: '9999px' }}
          >
            <Text>✕</Text>
          </View>
        </View>

        {/* 当前卡牌信息 */}
        <View style={{ borderRadius: '16px', padding: '24px', marginBottom: '24px', background: '#f9fafb' }}>
          <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <GameCard card={card} size="md" owned showInfo={false} />
                <View>
                  <Text style={{ fontSize: '30px', fontWeight: 'bold' }}>{card.name}</Text>
                  <Text style={{ fontSize: '14px', opacity: 0.9 }}>{card.knowledge}</Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: '18px', color: getRarityColor(card.rarity) }}>
                      {card.rarity}
                    </Text>
                    <Text style={{ fontSize: '14px' }}>{getStarDisplay(ownedCard.stars)}</Text>
                    <View style={{ background: 'rgba(255,255,255,0.3)', paddingLeft: '8px', paddingRight: '8px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      Lv.{ownedCard.level}
                    </View>
                  </View>
                </View>
              </View>

              {/* 属性对比 */}
              <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <View style={{ background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
                  <Text style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>当前属性</Text>
                  <View style={{ gap: '4px' }}>
                    <Text>⚔️ 攻击: {currentStats.attack}</Text>
                    <Text>🛡️ 防御: {currentStats.defense}</Text>
                  </View>
                </View>
                <View style={{ background: '#f3e8ff', borderRadius: '12px', padding: '12px', border: '2px solid #c4b5fd' }}>
                  <Text style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>升级后属性</Text>
                  <View style={{ fontWeight: 'bold' }}>
                    <Text style={{ color: '#86efac' }}>
                      ⚔️ 攻击: {nextStats.attack} <Text style={{ fontSize: '12px' }}>(+{nextStats.attack - currentStats.attack})</Text>
                    </Text>
                    <Text style={{ color: '#93c5fd' }}>
                      🛡️ 防御: {nextStats.defense} <Text style={{ fontSize: '12px' }}>(+{nextStats.defense - currentStats.defense})</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 升级条件 */}
        <View style={{ marginBottom: '24px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>
              升级条件: 消耗 {upgradeCost} 张相同卡牌
            </Text>
            <Text style={{ fontWeight: 'bold', color: canUpgrade ? '#16a34a' : '#9ca3af' }}>
              {selectedCards.length} / {upgradeCost}
            </Text>
          </View>

          {candidateCards.length === 0 ? (
            <View style={{ textAlign: 'center', paddingTop: '32px', paddingBottom: '32px', background: '#f9fafb', borderRadius: '12px' }}>
              <Text style={{ color: '#6b7280', marginBottom: '8px' }}>没有可用于升级的相同卡牌</Text>
              <Text style={{ fontSize: '14px', color: '#9ca3af' }}>需要通过抽卡获得更多相同卡牌</Text>
            </View>
          ) : (
            <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {candidateCards.map((item) => {
                const selected = selectedCards.includes(item.obtainedAt);
                return (
                  <View
                    key={item.obtainedAt}
                    onClick={() => toggleCardSelection(item.obtainedAt)}
                    style={{
                      borderRadius: '12px',
                      padding: '10px',
                      border: selected ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                      background: selected ? '#f3e8ff' : '#fff',
                    }}
                  >
                    <Text style={{ color: '#1f2937', fontSize: '13px', fontWeight: 'bold', display: 'block' }}>
                      {card.emoji} {card.name}
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                      星级 {item.stars} | Lv.{item.level}
                    </Text>
                    <Text style={{ color: selected ? '#7c3aed' : '#9ca3af', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                      {selected ? '已选为材料' : '点击选为材料'}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 升级按钮 */}
        <View style={{ display: 'flex', gap: '12px' }}>
          <View
            onClick={onClose}
            style={{ flex: 1, background: '#e5e7eb', color: '#374151', paddingTop: '16px', paddingBottom: '16px', borderRadius: '12px', fontWeight: 'bold' }}
          >
            取消
          </View>
          <View
            onClick={handleUpgrade}
            style={{ flex: 1, paddingTop: '16px', paddingBottom: '16px', borderRadius: '12px', fontWeight: 'bold' }}
          >
            {canUpgrade ? (
              <View style={{ flex: 1, paddingTop: '16px', paddingBottom: '16px', borderRadius: '12px', fontWeight: 'bold', background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)', color: '#fff' }}>
                确认升级
              </View>
            ) : (
              <View style={{ flex: 1, paddingTop: '16px', paddingBottom: '16px', borderRadius: '12px', fontWeight: 'bold', background: '#d1d5db', color: '#6b7280' }}>
                材料不足
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CardWarehousePage() {
  const [ownedCards, setOwnedCards] = useState<OwnedCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<{ card: Card; owned: OwnedCard } | null>(null);
  const [filterRarity, setFilterRarity] = useState<Card['rarity'] | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'all' | 'upgradable' | 'composable'>('all');

  useEffect(() => {
    loadCards();
  }, []);

  useDidShow(() => {
    loadCards();
  });

  const loadCards = () => {
    const cards = StorageManager.getOwnedCards();
    setOwnedCards(cards);
  };

  const handleUpgradeComplete = () => {
    loadCards();
    setSelectedCard(null);
  };

  const handleBackToCardCenter = () => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack();
      return;
    }
    safeNavigate('/pages/CardCenterPage/index');
  };

  const groupedCards = useMemo(() => {
    return ownedCards.reduce((acc, ownedCard) => {
      const key = `${ownedCard.cardId}-${ownedCard.stars}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(ownedCard);
      return acc;
    }, {} as Record<string, OwnedCard[]>);
  }, [ownedCards]);

  const filteredGroups = useMemo(() => {
    return Object.entries(groupedCards).filter(([key]) => {
      const cardId = parseInt(key.split('-')[0]);
      const card = CARD_DATA.find((c) => c.id === cardId);
      if (!card) return false;
      if (filterRarity === 'ALL') return true;
      return card.rarity === filterRarity;
    });
  }, [groupedCards, filterRarity]);

  const composeReadyKeys = useMemo(() => {
    return new Set(
      filteredGroups
        .filter(([, cards]) => getGroupComposeStatus(cards).canCompose)
        .map(([key]) => key)
    );
  }, [filteredGroups]);

  const upgradeReadyKeys = useMemo(() => {
    return new Set(
      filteredGroups
        .filter(([, cards]) => cards.some((item) => getUpgradeCost(item.level, item.stars) <= cards.length - 1))
        .map(([key]) => key)
    );
  }, [filteredGroups]);

  const displayGroups = useMemo(() => {
    if (viewMode === 'upgradable') {
      return filteredGroups.filter(([key]) => upgradeReadyKeys.has(key));
    }
    if (viewMode === 'composable') {
      return filteredGroups.filter(([key]) => composeReadyKeys.has(key));
    }
    return filteredGroups;
  }, [filteredGroups, viewMode, upgradeReadyKeys, composeReadyKeys]);

  return (
    <View style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fce7f3 100%)', padding: '16px' }}>
      {/* 顶部导航 */}
      <View style={{ maxWidth: '896px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View
            onClick={handleBackToCardCenter}
            style={{ background: '#fff', padding: '12px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <Text style={{ color: '#374151' }}>←</Text>
          </View>
          <View style={{ background: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ color: '#7c3aed' }}>📦</Text>
            <Text style={{ fontWeight: 'bold', color: '#374151' }}>卡牌仓库</Text>
          </View>
          <View style={{ width: '44px' }}></View>
        </View>

        {/* 稀有度筛选 */}
        <View style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
            {(['ALL', 'R', 'SR', 'S', 'SSR'] as const).map((rarity) => (
              <View
                key={rarity}
                onClick={() => setFilterRarity(rarity)}
                style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '12px', fontWeight: 'bold' }}
              >
                {filterRarity === rarity ? (
                  <View style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '12px', fontWeight: 'bold', background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)', color: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                    <Text>{rarity === 'ALL' ? '全部' : rarity}</Text>
                  </View>
                ) : (
                  <View style={{ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '12px', fontWeight: 'bold', background: '#f3f4f6', color: '#4b5563' }}>
                    <Text>{rarity === 'ALL' ? '全部' : rarity}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          <View style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            {[
              { key: 'all', label: '全部' },
              { key: 'upgradable', label: '可升级' },
              { key: 'composable', label: '可合成' },
            ].map((item) => (
              <View
                key={item.key}
                onClick={() => setViewMode(item.key as 'all' | 'upgradable' | 'composable')}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  borderRadius: '10px',
                  padding: '8px',
                  background: viewMode === item.key ? '#4f46e5' : '#f3f4f6',
                }}
              >
                <Text style={{ color: viewMode === item.key ? '#fff' : '#4b5563', fontSize: '12px', fontWeight: 'bold' }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* 卡牌列表 */}
      <View style={{ maxWidth: '896px', marginLeft: 'auto', marginRight: 'auto' }}>
        <View style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>
              我的卡牌 ({ownedCards.length} 张)
            </Text>
            <View>
              <Text style={{ fontSize: '14px', color: '#6b7280', display: 'block', textAlign: 'right' }}>
                {displayGroups.length} 种卡牌
              </Text>
              <Text style={{ fontSize: '12px', color: '#7c3aed', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                可合成 {composeReadyKeys.size} 种
              </Text>
            </View>
          </View>

          {displayGroups.length > 0 ? (
            <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {displayGroups.map(([key, cards]) => {
                const cardId = parseInt(key.split('-')[0]);
                const card = CARD_DATA.find((c) => c.id === cardId)!;
                const representativeCard = cards[0];
                const stats = getCardStats(card, representativeCard.stars, representativeCard.level);
                const composeStatus = getGroupComposeStatus(cards);
                const canCompose = composeReadyKeys.has(key);

                return (
                  <View
                    key={key}
                    onClick={() => setSelectedCard({ card, owned: representativeCard })}
                    style={{ borderRadius: '16px', padding: '12px', background: '#fff', border: '1px solid #e5e7eb', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <GameCard
                      card={card}
                      size="md"
                      owned
                      showInfo={false}
                      attack={stats.attack}
                      defense={stats.defense}
                      starsText={getStarDisplay(representativeCard.stars)}
                      level={representativeCard.level}
                      countBadge={cards.length}
                      composeBadge={canCompose}
                    />
                    <Text style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', textAlign: 'center' }}>
                      {card.knowledge}
                    </Text>
                    {!canCompose && (
                      <Text style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                        材料 {composeStatus.readyCount}/{composeStatus.needCount}
                      </Text>
                    )}
                    <View style={{ marginTop: '8px', width: '100%', background: '#f3f4f6', paddingTop: '6px', paddingBottom: '6px', borderRadius: '8px' }}>
                      <Text style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center', color: '#4f46e5' }}>
                        {canCompose ? '⭐ 立即合成' : '⭐ 升级'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={{ textAlign: 'center', paddingTop: '64px', paddingBottom: '64px' }}>
              <Text style={{ fontSize: '60px', marginBottom: '16px' }}>📦</Text>
              <Text style={{ color: '#6b7280', fontSize: '18px', marginBottom: '8px' }}>暂无卡牌</Text>
              <Text style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>去卡牌中心抽取卡牌吧！</Text>
              <View
                onClick={() => safeNavigate('/pages/CardCenterPage/index')}
                style={{ background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)', color: '#fff', paddingLeft: '32px', paddingRight: '32px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'inline-block' }}
              >
                前往抽卡
              </View>
            </View>
          )}
        </View>

        {/* 提示 */}
        <View style={{ background: '#fef3c7', border: '2px solid #fcd34d', borderRadius: '16px', padding: '16px' }}>
          <Text style={{ color: '#92400e', textAlign: 'center', fontSize: '14px' }}>
            💡 <Text style={{ fontWeight: 'bold' }}>提示：</Text>
            消耗相同星级的同名卡牌可以升级，升级后攻击和防御属性都会提升！
          </Text>
        </View>
      </View>

      {/* 升级弹窗 */}
      {selectedCard && (
        <CardUpgradeModal
          card={selectedCard.card}
          ownedCard={selectedCard.owned}
          allOwnedCards={ownedCards}
          onClose={() => setSelectedCard(null)}
          onUpgrade={handleUpgradeComplete}
        />
      )}
    </View>
  );
}
