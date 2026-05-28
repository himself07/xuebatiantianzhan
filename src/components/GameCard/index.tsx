/**
 * 游戏卡牌展示组件：稀有度边框 + 立绘 + 信息层。
 */

import { useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import type { Card } from '../../types/card'
import {
  CARD_BACK_SRC,
  CARD_SIZE_MAP,
  CardSizeKey,
  getCardGradient,
  getCardPortraitSrc,
  getRarityFrameStyle,
} from '../../utils/cardAssets'

export interface GameCardProps {
  /** 卡牌数据 */
  card: Card
  /** 尺寸档位 */
  size?: CardSizeKey
  /** 是否已拥有（未拥有显示卡背/剪影） */
  owned?: boolean
  /** 是否显示卡背（抽卡动画） */
  showBack?: boolean
  /** 是否展示名称与属性 */
  showInfo?: boolean
  /** 攻击/防御展示值（可选，用于升级后属性） */
  attack?: number
  defense?: number
  /** 星级文案 */
  starsText?: string
  /** 等级 */
  level?: number
  /** 角标数量 */
  countBadge?: number
  /** 可合成角标 */
  composeBadge?: boolean
  /** 点击回调 */
  onClick?: () => void
}

/**
 * 统一卡牌视觉组件。
 */
export default function GameCard({
  card,
  size = 'md',
  owned = true,
  showBack = false,
  showInfo = true,
  attack,
  defense,
  starsText,
  level,
  countBadge,
  composeBadge,
  onClick,
}: GameCardProps) {
  const [imageError, setImageError] = useState(false)
  const dim = CARD_SIZE_MAP[size]
  const frame = getRarityFrameStyle(card.rarity)
  const gradient = getCardGradient(card.color)
  const portraitSrc = getCardPortraitSrc(card.id)
  const reveal = owned && !showBack
  const displayAttack = attack ?? card.attack
  const displayDefense = defense ?? card.defense

  const imageSrc = showBack
    ? CARD_BACK_SRC
    : reveal && portraitSrc && !imageError
      ? portraitSrc
      : ''

  return (
    <View
      onClick={onClick}
      style={{
        width: `${dim.width}px`,
        position: 'relative',
      }}
    >
      {composeBadge && (
        <View
          style={{
            position: 'absolute',
            top: '-8px',
            left: '-4px',
            zIndex: 3,
            background: 'linear-gradient(90deg,#7C3AED,#EC4899)',
            borderRadius: '999px',
            padding: '2px 8px',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>可合成</Text>
        </View>
      )}
      {typeof countBadge === 'number' && countBadge > 1 && (
        <View
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            zIndex: 3,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}>×{countBadge}</Text>
        </View>
      )}
      <View
        style={{
          width: `${dim.width}px`,
          height: `${dim.height}px`,
          borderRadius: '14px',
          border: `3px solid ${frame.borderColor}`,
          boxShadow: frame.boxShadow,
          overflow: 'hidden',
          background: `linear-gradient(145deg, ${gradient.from}, ${gradient.to})`,
          position: 'relative',
        }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            mode="aspectFill"
            style={{ width: '100%', height: '100%' }}
            onError={() => setImageError(true)}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: reveal ? 'rgba(0,0,0,0.15)' : 'transparent',
            }}
          >
            <Text style={{ fontSize: size === 'sm' ? '28px' : size === 'lg' || size === 'xl' ? '56px' : '40px' }}>
              {reveal ? card.emoji : '❓'}
            </Text>
          </View>
        )}
        <View
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            borderRadius: '6px',
            padding: '2px 6px',
            background: frame.badgeBg,
          }}
        >
          <Text style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>{card.rarity}</Text>
        </View>
      </View>
      {showInfo && (
        <View style={{ marginTop: '6px', width: `${dim.width}px` }}>
          <Text
            style={{
              fontSize: size === 'sm' ? '11px' : '13px',
              fontWeight: 'bold',
              color: '#1F2937',
              textAlign: 'center',
              display: 'block',
            }}
            numberOfLines={1}
          >
            {owned ? card.name : '未获得'}
          </Text>
          {owned && (
            <>
              {starsText && (
                <Text style={{ fontSize: '10px', textAlign: 'center', display: 'block', color: '#6B7280' }}>
                  {starsText}
                  {level ? ` Lv.${level}` : ''}
                </Text>
              )}
              {(displayAttack > 0 || displayDefense > 0) && size !== 'sm' && (
                <Text style={{ fontSize: '10px', textAlign: 'center', display: 'block', color: '#4B5563' }}>
                  ⚔️{displayAttack} 🛡️{displayDefense}
                </Text>
              )}
            </>
          )}
        </View>
      )}
    </View>
  )
}
