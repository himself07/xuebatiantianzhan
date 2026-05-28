import { useEffect, useState } from 'react'
import { Text, View } from '@tarojs/components'
import { DailyBossConfig } from '../../data/dailyBoss'
import { getBossTheme } from '../../utils/bossAssets'
import { getBossDisplayInfo } from '../../utils/bossDisplay'
import BossPortrait from './BossPortrait'
import WeaknessBar from './WeaknessBar'

interface BossHeaderProps {
  boss: DailyBossConfig
  hpPercent: number
  damagePopup: number | null
  /** 当前展示的招式名（答对时） */
  movePopup: string | null
  shake: boolean
  /** 当前题已点亮的弱点层数 */
  weaknessLevel?: number
}

/**
 * Boss 立绘、血条、弱点条与挑衅台词；立绘支持 APNG idle。
 */
export default function BossHeader({
  boss,
  hpPercent,
  damagePopup,
  movePopup,
  shake,
  weaknessLevel = 0,
}: BossHeaderProps) {
  const display = getBossDisplayInfo(boss)
  const safeHp = Math.max(0, Math.min(100, hpPercent))
  const theme = getBossTheme(boss.key)
  const [hitFlash, setHitFlash] = useState(false)

  useEffect(() => {
    if (damagePopup === null) {
      return
    }
    setHitFlash(true)
    const t = setTimeout(() => setHitFlash(false), 220)
    return () => clearTimeout(t)
  }, [damagePopup])

  return (
    <View
      style={{
        marginTop: '14px',
        background: 'rgba(255,255,255,0.12)',
        borderRadius: '16px',
        padding: '14px',
        transform: shake ? 'translateX(5px)' : 'translateY(0)',
        transition: shake ? 'transform 0.06s ease' : 'transform 0.3s ease',
        border: `1px solid ${theme.accent}55`,
        boxShadow: `0 8px 24px ${theme.glow}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {hitFlash ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.35)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      ) : null}

      {movePopup ? (
        <View
          style={{
            position: 'absolute',
            left: '50%',
            top: '8px',
            transform: 'translateX(-50%)',
            zIndex: 3,
            background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)',
            borderRadius: '999px',
            padding: '6px 16px',
            boxShadow: '0 4px 12px rgba(239,68,68,0.45)',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{movePopup}</Text>
        </View>
      ) : null}

      <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <BossPortrait
          bossKey={boss.key}
          emoji={boss.emoji}
          size={96}
          borderColor={theme.accent}
          backgroundColor={theme.secondary}
          shake={shake}
        />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fde68a', fontSize: '18px', fontWeight: 'bold' }}>{display.dailyNickname}</Text>
          <Text style={{ color: '#a5b4fc', fontSize: '11px', marginTop: '2px', display: 'block' }}>
            {display.seriesName} · {display.topicTypeLabel}
          </Text>
          <Text style={{ color: '#cbd5e1', fontSize: '12px', marginTop: '4px', display: 'block' }}>
            「{display.taunt}」
          </Text>
        </View>
        {damagePopup !== null ? (
          <Text
            style={{
              color: '#fbbf24',
              fontSize: '22px',
              fontWeight: 'bold',
            }}
          >
            -{damagePopup}
          </Text>
        ) : null}
      </View>

      <WeaknessBar level={weaknessLevel} accentColor={theme.accent} />

      <View
        style={{
          marginTop: '12px',
          height: '14px',
          borderRadius: '999px',
          background: 'rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${safeHp}%`,
            height: '100%',
            borderRadius: '999px',
            background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
            transition: 'width 0.45s ease',
          }}
        />
      </View>
      <Text style={{ color: '#94a3b8', fontSize: '11px', marginTop: '6px' }}>Boss HP {safeHp}%</Text>
    </View>
  )
}
