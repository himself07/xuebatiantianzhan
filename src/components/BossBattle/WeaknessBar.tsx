import { Text, View } from '@tarojs/components'

interface WeaknessBarProps {
  /** 当前弱点层数 0～max */
  level: number
  max?: number
  accentColor: string
}

/**
 * Boss 弱点条：答错点亮，提示「再答伤害加成」。
 */
export default function WeaknessBar({ level, max = 3, accentColor }: WeaknessBarProps) {
  const safeLevel = Math.max(0, Math.min(max, level))

  return (
    <View style={{ marginTop: '10px' }}>
      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#fde68a', fontSize: '11px', fontWeight: 'bold' }}>Boss 弱点</Text>
        <Text style={{ color: '#a5b4fc', fontSize: '10px' }}>
          {safeLevel > 0 ? `再答伤害 +${safeLevel * 20}%` : '答错可点亮弱点'}
        </Text>
      </View>
      <View style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        {Array.from({ length: max }).map((_, i) => {
          const lit = i < safeLevel
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '999px',
                background: lit ? accentColor : 'rgba(255,255,255,0.15)',
                boxShadow: lit ? `0 0 8px ${accentColor}` : 'none',
                transition: 'background 0.3s ease',
              }}
            />
          )
        })}
      </View>
    </View>
  )
}
