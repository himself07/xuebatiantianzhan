import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from '@tarojs/components';
import { StorageManager } from '../../utils/storage';
import { GATE_GRADIENT, MASCOT } from '../../constants/theme';
import { getTodayBoss } from '../../data/dailyBoss';
import BossPortrait from '../../components/BossBattle/BossPortrait';
import { getBossTheme } from '../../utils/bossAssets';
import { SfxManager } from '../../utils/sfx';
import MascotBubble from '../../components/MascotBubble';
import { getBossDisplayInfo } from '../../utils/bossDisplay';

type GatePhase = 'loading' | 'preview' | 'signin' | 'signed' | 'redirect';

/**
 * 每日入门页：签到领奖励后进入今日 Boss 战，完成后才进入首页。
 */
export default function DailyGatePage() {
  const [phase, setPhase] = useState<GatePhase>('loading');
  const [signReward, setSignReward] = useState<{ coins?: number; energy?: number; petFood?: number } | null>(null);
  const [signMessage, setSignMessage] = useState('');
  const todayBoss = getTodayBoss();
  const bossDisplay = useMemo(() => getBossDisplayInfo(todayBoss), [todayBoss]);
  const bossTheme = getBossTheme(todayBoss.key);

  const goToDailyChallenge = () => {
    Taro.redirectTo({ url: '/pages/DailyChallengePage/index?entry=gate' });
  };

  const goToMainWorld = () => {
    Taro.switchTab({ url: '/pages/MainWorldPage/index' });
  };

  const runGateFlow = () => {
    StorageManager.checkAndResetDaily();
    const progress = StorageManager.getProgress();
    const today = new Date().toISOString().split('T')[0];

    if (progress.dailyChallengeCompleted) {
      goToMainWorld();
      return;
    }

    if (progress.signInInfo.lastSignInDate === today) {
      setPhase('preview');
      SfxManager.play('bossEnter');
      setTimeout(goToDailyChallenge, 1400);
      return;
    }

    setPhase('signin');
    SfxManager.play('bossEnter');
  };

  const handleSignIn = () => {
    const result = StorageManager.signIn();
    if (!result.success) {
      Taro.showToast({ title: result.message, icon: 'none' });
      setPhase('preview');
      setTimeout(goToDailyChallenge, 800);
      return;
    }

    setSignReward(result.reward);
    setSignMessage(result.message);
    setPhase('signed');
    setTimeout(goToDailyChallenge, 1800);
  };

  useEffect(() => {
    runGateFlow();
  }, []);

  useDidShow(() => {
    const progress = StorageManager.getProgress();
    if (progress.dailyChallengeCompleted) {
      goToMainWorld();
    }
  });

  const showBossPreview = phase === 'signin' || phase === 'signed' || phase === 'preview';

  return (
    <View
      style={{
        minHeight: '100vh',
        background: GATE_GRADIENT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: '360px',
          background: '#fff',
          borderRadius: '24px',
          padding: '28px 22px',
          textAlign: 'center',
          boxShadow: '0 16px 40px rgba(79,70,229,0.28)',
        }}
      >
        <View style={{ marginBottom: '12px' }}>
          <MascotBubble
            message={
              showBossPreview
                ? `今日通缉 ${todayBoss.dailyNickname}！掌握「${todayBoss.motherTopicSummary}」就能赢！`
                : `${MASCOT.name}正在准备战场…`
            }
            size="normal"
            theme="light"
          />
        </View>

        {showBossPreview ? (
          <View
            style={{
              background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
              borderRadius: '18px',
              padding: '16px 14px',
              marginBottom: '12px',
              border: '2px solid #fbbf24',
            }}
          >
            <Text
              style={{
                color: '#fbbf24',
                fontSize: '13px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                display: 'block',
              }}
            >
              ★ 今日通缉令 ★
            </Text>
            <View style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
              <BossPortrait
                bossKey={todayBoss.key}
                emoji={todayBoss.emoji}
                size={120}
                borderColor={bossTheme.accent}
                backgroundColor={bossTheme.secondary}
              />
            </View>
            <Text style={{ color: '#fde68a', fontSize: '22px', fontWeight: 'bold', display: 'block', marginTop: '8px' }}>
              {todayBoss.dailyNickname}
            </Text>
            <Text style={{ color: '#a5b4fc', fontSize: '12px', display: 'block', marginTop: '6px' }}>
              {bossDisplay.seriesName} · {todayBoss.topicTypeLabel}
            </Text>
            <Text style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', display: 'block', marginTop: '12px' }}>
              母题：{todayBoss.motherTopicSummary}
            </Text>
            <Text style={{ color: '#cbd5e1', fontSize: '11px', display: 'block', marginTop: '8px', lineHeight: 1.45 }}>
              {todayBoss.topicExamples}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginTop: '10px' }}>
              「{todayBoss.taunt}」
            </Text>
          </View>
        ) : null}

        {phase === 'loading' || phase === 'redirect' ? (
          <View style={{ marginTop: '8px' }}>
            <Text style={{ color: '#64748b', fontSize: '14px' }}>Boss 正在热身...</Text>
          </View>
        ) : null}

        {phase === 'preview' ? (
          <View style={{ marginTop: '8px' }}>
            <Text style={{ color: '#6366f1', fontSize: '14px', fontWeight: 'bold' }}>即将缉拿 {todayBoss.dailyNickname}！</Text>
          </View>
        ) : null}

        {phase === 'signin' ? (
          <View style={{ marginTop: '8px' }}>
            <Text style={{ color: '#475569', fontSize: '14px', display: 'block', marginBottom: '16px' }}>
              签到领金币和体力，然后挑战今日通缉 Boss
            </Text>
            <View
              onClick={handleSignIn}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                borderRadius: '14px',
                padding: '14px',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>签到并挑战 Boss</Text>
            </View>
          </View>
        ) : null}

        {phase === 'signed' && signReward ? (
          <View style={{ marginTop: '8px' }}>
            <Text style={{ color: '#16a34a', fontSize: '18px', fontWeight: 'bold', display: 'block' }}>签到成功</Text>
            <Text style={{ color: '#64748b', fontSize: '13px', display: 'block', marginTop: '8px' }}>{signMessage}</Text>
            <View style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
              {signReward.coins ? (
                <View style={{ background: '#fef3c7', borderRadius: '12px', padding: '10px 14px' }}>
                  <Text style={{ color: '#92400e', fontWeight: 'bold' }}>+{signReward.coins} 🪙</Text>
                </View>
              ) : null}
              {signReward.energy ? (
                <View style={{ background: '#dcfce7', borderRadius: '12px', padding: '10px 14px' }}>
                  <Text style={{ color: '#166534', fontWeight: 'bold' }}>+{signReward.energy} ⚡</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginTop: '14px' }}>
              即将缉拿 {todayBoss.dailyNickname}…
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
