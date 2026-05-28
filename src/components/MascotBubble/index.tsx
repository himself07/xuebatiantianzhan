import { useState } from 'react'
import { Image, Text, View } from '@tarojs/components'
import { MASCOT } from '../../constants/theme'
import { MASCOT_PORTRAIT_SRC } from '../../utils/bossAssets'

interface MascotBubbleProps {
  /** 气泡文案 */
  message: string
  /** 尺寸：compact 用于顶栏，normal 用于 Gate/结算 */
  size?: 'compact' | 'normal'
  /** dark 用于 Boss 战深色底；light 用于 Gate 白卡片 */
  theme?: 'dark' | 'light'
}

/**
 * 战宝 mascot 气泡组件，统一 Gate / Boss 战 / 结算视觉。
 */
export default function MascotBubble({ message, size = 'normal', theme = 'dark' }: MascotBubbleProps) {
  const isCompact = size === 'compact'
  const avatarSize = isCompact ? 36 : 52
  const fontSize = isCompact ? 12 : 14
  const isLight = theme === 'light'
  const [portraitFailed, setPortraitFailed] = useState(false)

  return (
    <View
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: isCompact ? '8px' : '10px',
        background: isLight ? '#f5f3ff' : 'rgba(255,255,255,0.12)',
        borderRadius: isCompact ? '12px' : '16px',
        padding: isCompact ? '8px 10px' : '12px 14px',
        border: isLight ? '1px solid #e0e7ff' : '1px solid rgba(255,255,255,0.18)',
      }}
    >
      <View
        style={{
          width: `${avatarSize}px`,
          height: `${avatarSize}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!portraitFailed ? (
          <Image
            src={MASCOT_PORTRAIT_SRC}
            mode="aspectFill"
            style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
            onError={() => setPortraitFailed(true)}
          />
        ) : (
          <Text style={{ fontSize: isCompact ? '20px' : '28px' }}>{MASCOT.emoji}</Text>
        )}
      </View>
      <View style={{ flex: 1, paddingTop: isCompact ? '2px' : '4px' }}>
        <Text style={{ color: isLight ? '#7c3aed' : '#fde68a', fontSize: '11px', fontWeight: 'bold' }}>
          {MASCOT.name}
        </Text>
        <Text
          style={{
            color: isLight ? '#334155' : '#fff',
            fontSize: `${fontSize}px`,
            marginTop: '2px',
            lineHeight: 1.45,
            display: 'block',
            textAlign: 'left',
          }}
        >
          {message}
        </Text>
      </View>
    </View>
  )
}
