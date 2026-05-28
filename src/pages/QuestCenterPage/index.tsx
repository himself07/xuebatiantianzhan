import Taro from '@tarojs/taro'
import { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { StorageManager, RANK_THRESHOLDS } from '../../utils/storage'

export default function QuestCenterPage() {
  const [progress, setProgress] = useState<any>(null)
  const goHome = () => Taro.switchTab({ url: '/pages/MainWorldPage/index' })

  useEffect(() => {
    StorageManager.checkAndResetDaily()
    loadData()
  }, [])

  const loadData = () => setProgress(StorageManager.getProgress())

  const handleSignIn = () => {
    const result = StorageManager.signIn()
    if (result.success) {
      Taro.showToast({ title: '签到成功+' + result.reward.coins + '金币', icon: 'success' })
      loadData()
    } else {
      Taro.showToast({ title: result.message, icon: 'none' })
    }
  }

  const claimTask = (index: number) => {
    const result = StorageManager.claimTaskReward(index)
    if (result.success) {
      Taro.showToast({ title: '领取成功', icon: 'success' })
      loadData()
    }
  }

  if (!progress) {
    return (
      <View style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#64748b' }}>加载中...</Text>
      </View>
    )
  }

  const todaySigned = progress.signInInfo.lastSignInDate === new Date().toISOString().split('T')[0]
  const rank = RANK_THRESHOLDS.find(r => progress.rankInfo.points >= r.min && progress.rankInfo.points < r.max)

  return (
    <View style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <View style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '48px 24px 40px', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px' }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <View onClick={goHome} style={{ padding: '10px 14px', borderRadius: '9999px', background: 'rgba(255,255,255,0.14)' }}>
            <Text style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>回首页</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '20px' }}>任务中心</Text>
          <View style={{ width: '44px' }}></View>
        </View>

        <View style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <View style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: '32px' }}>👑</Text>
          </View>
          <View>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>{rank?.name || '青铜'}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{progress.rankInfo.points} 积分</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: '24px' }}>
        {!todaySigned && (
          <View onClick={handleSignIn} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', borderRadius: '20px', padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Text style={{ fontSize: '40px' }}>🎁</Text>
              <View>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>每日签到</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>连续签到{progress.signInInfo.continuousDays}天</Text>
              </View>
            </View>
            <View style={{ background: '#fff', padding: '10px 24px', borderRadius: '20px' }}>
              <Text style={{ color: '#f97316', fontWeight: 'bold' }}>签到</Text>
            </View>
          </View>
        )}

        {todaySigned && (
          <View style={{ background: '#fff', borderRadius: '20px', padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Text style={{ fontSize: '40px' }}>✅</Text>
            <View>
              <Text style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b' }}>今日已签到</Text>
              <Text style={{ color: '#64748b', fontSize: '13px' }}>连续签到{progress.signInInfo.continuousDays}天</Text>
            </View>
          </View>
        )}

        <Text style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b', marginBottom: '16px' }}>每日任务</Text>

        {progress.dailyTasks.map((task: any, i: number) => (
          <View key={i} style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '12px' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <View style={{ width: '44px', height: '44px', borderRadius: '12px', background: task.completed && !task.claimed ? '#fbbf24' : task.completed ? '#dcfce7' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: '22px' }}>{task.completed ? (task.claimed ? '✓' : '!') : '📋'}</Text>
                </View>
                <View>
                  <Text style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>{task.name}</Text>
                  <Text style={{ color: '#64748b', fontSize: '12px' }}>{task.completed ? '已完成' : `${task.progress}/${task.target}`}</Text>
                </View>
              </View>
              {task.completed && !task.claimed && (
                <View onClick={() => claimTask(i)} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '10px 20px', borderRadius: '16px' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>领取</Text>
                </View>
              )}
              {task.completed && task.claimed && (
                <Text style={{ color: '#9ca3af', fontSize: '14px' }}>已领</Text>
              )}
            </View>
          </View>
        ))}

        <View style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginTop: '8px' }}>
          <Text style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>今日统计</Text>
          <View style={{ display: 'flex', gap: '16px' }}>
            <View style={{ flex: 1, textAlign: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: 'bold', color: '#4f46e5' }}>{progress.todayAnswerCount}</Text>
              <Text style={{ color: '#64748b', fontSize: '12px' }}>答题数</Text>
            </View>
            <View style={{ flex: 1, textAlign: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>{progress.todayCorrectRate}%</Text>
              <Text style={{ color: '#64748b', fontSize: '12px' }}>正确率</Text>
            </View>
            <View style={{ flex: 1, textAlign: 'center' }}>
              <Text style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{progress.coins}</Text>
              <Text style={{ color: '#64748b', fontSize: '12px' }}>金币</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}