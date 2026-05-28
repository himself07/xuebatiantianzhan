import { Text, View } from '@tarojs/components'

interface ComboBannerProps {
  /** 当前连击数，≤1 不展示 */
  combo: number
  label: string
}

/**
 * 答对连击飘字（B3）：2 连击 / 3 连击强化视觉。
 */
export default function ComboBanner({ combo, label }: ComboBannerProps) {
  if (combo <= 1) {
    return null
  }

  const isFinisherCombo = combo >= 3

  return (
    <View
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        top: '28%',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <View
        style={{
          background: isFinisherCombo
            ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 55%, #a855f7 100%)'
            : 'linear-gradient(90deg, #22c55e 0%, #14b8a6 100%)',
          borderRadius: '999px',
          padding: isFinisherCombo ? '12px 28px' : '10px 22px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          transform: `scale(${isFinisherCombo ? 1.08 : 1})`,
        }}
      >
        <Text
          style={{
            color: '#fff',
            fontWeight: 'bold',
            fontSize: isFinisherCombo ? '26px' : '22px',
            letterSpacing: '1px',
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  )
}
