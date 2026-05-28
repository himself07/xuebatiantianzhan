import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { StorageManager } from '../../utils/storage'

const QUESTIONS = [
  { id: 1, q: '15 × 6 = ?', options: ['80', '90', '95', '85'], answer: 1, hint: '15×6=10×6+5×6=60+30=90' },
  { id: 2, q: '72 - 18 = ?', options: ['54', '52', '56', '58'], answer: 0, hint: '72-18=54' },
  { id: 3, q: '找规律：3、6、12、24、（ ）', options: ['36', '48', '30', '42'], answer: 1, hint: '每次翻倍' },
]

export default function FunQuizPage() {
  const [idx, setIdx] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [show, setShow] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (show && sel === QUESTIONS[idx].answer) {
      const t = setTimeout(() => {
        if (idx < QUESTIONS.length - 1) {
          setIdx(idx + 1)
          setSel(null)
          setShow(false)
        } else {
          setDone(true)
        }
      }, 1200)
      return () => clearTimeout(t)
    }
  }, [show, sel])

  const select = (i: number) => {
    if (show) return
    setSel(i)
    setShow(true)
    if (i === QUESTIONS[idx].answer) setCorrect(c => c + 1)
  }

  if (done) {
    const rate = Math.round((correct / QUESTIONS.length) * 100)
    return (
      <View style={{ minHeight: '100vh', background: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <View style={{ background: '#fff', borderRadius: '24px', padding: '48px 32px', width: '100%', maxWidth: '340px', textAlign: 'center' }}>
          <Text style={{ fontSize: '72px' }}>🎉</Text>
          <Text style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', margin: '16px 0' }}>答题完成</Text>
          <Text style={{ color: '#64748b', fontSize: '16px' }}>答对 <Text style={{ fontWeight: 'bold', color: '#7c3aed', fontSize: '22px' }}>{correct}</Text> / {QUESTIONS.length} 题</Text>
          <Text style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '32px' }}>正确率 {rate}%</Text>
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/DailyChallengePage/index' })}
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '16px', padding: '16px', marginBottom: '10px' }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>去挑战今日Boss</Text>
          </View>
          <View onClick={() => Taro.navigateBack()} style={{ background: '#f3f4f6', borderRadius: '16px', padding: '16px' }}>
            <Text style={{ color: '#4b5563', fontWeight: 'bold', fontSize: '16px' }}>返回</Text>
          </View>
        </View>
      </View>
    )
  }

  const q = QUESTIONS[idx]

  return (
    <View style={{ minHeight: '100vh', background: '#1e1b4b' }}>
      <View style={{ padding: '48px 24px 24px' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <View onClick={() => Taro.navigateBack()} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: '24px' }}>←</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>Boss战前热身</Text>
          <View style={{ width: '44px' }}></View>
        </View>

        <View style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {QUESTIONS.map((_, i) => (
            <View key={i} style={{ flex: 1, height: '6px', borderRadius: '3px', background: i <= idx ? '#a855f7' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>第{idx + 1}题 · 已答对{correct}题</Text>
      </View>

      <View style={{ padding: '0 24px' }}>
        <View style={{ background: '#fff', borderRadius: '24px', padding: '32px', marginBottom: '20px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', lineHeight: 1.4 }}>{q.q}</Text>

          <View style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '28px' }}>
            {q.options.map((opt, i) => {
              const isS = sel === i
              const isC = i === q.answer
              let bg = '#f9fafb'
              let bc = '#e5e7eb'
              if (show) {
                if (isC) { bg = '#dcfce7'; bc = '#22c55e' }
                else if (isS) { bg = '#fee2e2'; bc = '#ef4444' }
              }
              return (
                <View key={i} onClick={() => select(i)} style={{ background: bg, border: `2px solid ${bc}`, borderRadius: '14px', padding: '18px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <View style={{ width: '34px', height: '34px', borderRadius: '50%', background: isC ? '#22c55e' : (isS ? bc : '#e5e7eb'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>{String.fromCharCode(65 + i)}</Text>
                      </View>
                      <Text style={{ fontSize: '17px', color: '#374151' }}>{opt}</Text>
                    </View>
                    {show && isC && <Text style={{ fontSize: '22px', color: '#22c55e' }}>✓</Text>}
                    {show && isS && !isC && <Text style={{ fontSize: '22px', color: '#ef4444' }}>✗</Text>}
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {show && sel !== q.answer && (
          <View style={{ background: '#f97316', borderRadius: '16px', padding: '20px' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>💡 {q.hint}</Text>
            <View onClick={() => { setIdx(idx + 1); setSel(null); setShow(false) }} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '14px', textAlign: 'center', marginTop: '12px' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{idx < QUESTIONS.length - 1 ? '下一题 →' : '完成'}</Text>
            </View>
          </View>
        )}

        {show && sel === q.answer && (
          <View style={{ background: '#22c55e', borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Text style={{ fontSize: '26px' }}>🎉</Text>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>正确！自动跳转中...</Text>
          </View>
        )}
      </View>
    </View>
  )
}