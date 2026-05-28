import { useEffect, useState } from 'react'
import { Image, Text, View } from '@tarojs/components'
import { resolveBossPortraitDisplaySrc } from '../../utils/bossAssets'

interface BossPortraitProps {
  bossKey: string
  emoji: string
  size: number
  borderColor: string
  backgroundColor: string
  shake?: boolean
  /** 是否启用呼吸 idle（无 APNG 时仍生效） */
  enableIdleMotion?: boolean
}

/**
 * Boss 立绘：优先 APNG idle，失败回退 PNG，并叠加呼吸动效。
 */
export default function BossPortrait({
  bossKey,
  emoji,
  size,
  borderColor,
  backgroundColor,
  shake = false,
  enableIdleMotion = true,
}: BossPortraitProps) {
  const [src, setSrc] = useState('')
  const [animated, setAnimated] = useState(false)
  const [failed, setFailed] = useState(false)
  const [idleOffset, setIdleOffset] = useState(0)
  const [idleScale, setIdleScale] = useState(1)

  useEffect(() => {
    let cancelled = false
    resolveBossPortraitDisplaySrc(bossKey).then((resolved) => {
      if (!cancelled) {
        setSrc(resolved.src)
        setAnimated(resolved.animated)
        setFailed(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [bossKey])

  useEffect(() => {
    if (!enableIdleMotion || animated) {
      return
    }
    const timer = setInterval(() => {
      setIdleOffset((prev) => (prev === 0 ? -5 : 0))
      setIdleScale((prev) => (prev === 1 ? 1.04 : 1))
    }, 1200)
    return () => clearInterval(timer)
  }, [animated, enableIdleMotion])

  const motionTransform = shake
    ? 'scale(0.94)'
    : `translateY(${animated ? 0 : idleOffset}px) scale(${animated ? 1 : idleScale})`

  return (
    <View
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.18)}px`,
        overflow: 'hidden',
        border: `3px solid ${borderColor}`,
        background: backgroundColor,
        flexShrink: 0,
        transform: motionTransform,
        transition: shake ? 'transform 0.06s ease' : 'transform 0.35s ease',
      }}
    >
      {src && !failed ? (
        <Image
          src={src}
          mode="aspectFill"
          style={{ width: `${size}px`, height: `${size}px` }}
          onError={() => setFailed(true)}
        />
      ) : (
        <Text
          style={{
            fontSize: `${Math.round(size * 0.46)}px`,
            lineHeight: `${size}px`,
            textAlign: 'center',
            display: 'block',
          }}
        >
          {emoji}
        </Text>
      )}
    </View>
  )
}
