import Taro, { useDidShow, useRouter, useShareAppMessage } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, Image, Text, View } from '@tarojs/components';
import { getBossPortraitSrc, getBossTheme } from '../../utils/bossAssets';
import { StorageManager } from '../../utils/storage';
import { BOSS_GRADIENT, MASCOT, REWARD_LABEL } from '../../constants/theme';
import {
  calcWeaknessDamage,
  ChallengeQuestion,
  getComboLabel,
  getMockClassClearCount,
  getMoveName,
  getStageLabel,
  getTodayBoss,
  WEAKNESS_MAX,
} from '../../data/dailyBoss';
import BossPortrait from '../../components/BossBattle/BossPortrait';
import { formatShareTitle } from '../../data/bossNicknames';
import BossHeader from '../../components/BossBattle/BossHeader';
import ComboBanner from '../../components/BossBattle/ComboBanner';
import MascotBubble from '../../components/MascotBubble';
import { getBossDisplayInfo } from '../../utils/bossDisplay';
import { SfxManager } from '../../utils/sfx';
import {
  generateDailyChallengePoster,
  SHARE_CANVAS_ID,
  SHARE_CANVAS_STYLE,
} from '../../utils/sharePoster';

/**
 * 每日 Boss 战页面：答题驱动 Boss 血量与攻击反馈。
 */
export default function DailyChallengePage() {
  const router = useRouter();
  const isGateEntry = router.params?.entry === 'gate';
  const todayBoss = useMemo(() => getTodayBoss(), []);
  const bossDisplay = useMemo(() => getBossDisplayInfo(todayBoss), [todayBoss]);
  const questions = todayBoss.questions;
  const bossPortrait = useMemo(() => getBossPortraitSrc(todayBoss.key), [todayBoss.key]);
  const bossTheme = useMemo(() => getBossTheme(todayBoss.key), [todayBoss.key]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState<ReturnType<typeof StorageManager.getProgress> | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedKnowledge, setEarnedKnowledge] = useState(0);
  const [bossHpPercent, setBossHpPercent] = useState(100);
  const [damagePopup, setDamagePopup] = useState<number | null>(null);
  const [movePopup, setMovePopup] = useState<string | null>(null);
  const [bossShake, setBossShake] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(SfxManager.isEnabled());
  const [showFinisher, setShowFinisher] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const [durationSec, setDurationSec] = useState(0);
  const [passed, setPassed] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [comboPopup, setComboPopup] = useState<string | null>(null);
  /** 每题答错累积的弱点层数 */
  const [weaknessByQuestion, setWeaknessByQuestion] = useState<Record<number, number>>({});
  const [lastHitDamage, setLastHitDamage] = useState(0);

  const startTimeRef = useRef(Date.now());
  const finisherTriggeredRef = useRef(false);

  const loadData = useCallback(() => {
    const p = StorageManager.getProgress();
    setProgress(p);
    setCanClaim(p.dailyChallengeCompleted && !p.dailyChallengeClaimed);
  }, []);

  useEffect(() => {
    StorageManager.checkAndResetDaily();
    const today = new Date().toISOString().split('T')[0];
    StorageManager.saveTodayBoss({
      bossKey: todayBoss.key,
      bossName: todayBoss.name,
      dailyNickname: todayBoss.dailyNickname,
      topicTypeId: todayBoss.topicTypeId,
      topicTypeLabel: todayBoss.topicTypeLabel,
      motherTopic: todayBoss.motherTopicSummary,
      motherTopicSummary: todayBoss.motherTopicSummary,
      knowledgeTag: questions[0]?.knowledgeTag || '',
      date: today,
    });
    startTimeRef.current = Date.now();
    loadData();
    return () => {
      SfxManager.destroy();
    };
  }, [loadData, questions, todayBoss]);

  useDidShow(() => {
    loadData();
    if (isGateEntry) {
      const p = StorageManager.getProgress();
      if (p.dailyChallengeCompleted) {
        Taro.switchTab({ url: '/pages/MainWorldPage/index' });
      }
    }
  });

  const question: ChallengeQuestion = questions[currentQuestion];
  const currentWeakness = weaknessByQuestion[currentQuestion] || 0;

  const addWeaknessLevel = () => {
    setWeaknessByQuestion((prev) => ({
      ...prev,
      [currentQuestion]: Math.min(WEAKNESS_MAX, (prev[currentQuestion] || 0) + 1),
    }));
  };

  const handleWeaknessRetry = () => {
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const triggerBossHit = (damage: number, nextHp: number, moveName: string) => {
    setLastHitDamage(damage);
    setDamagePopup(damage);
    setMovePopup(moveName);
    setBossHpPercent(nextHp);
    setBossShake(true);
    SfxManager.play('hit');
    Taro.vibrateShort({ type: 'light' }).catch(() => undefined);
    setTimeout(() => setBossShake(false), 180);
    setTimeout(() => setDamagePopup(null), 700);
    setTimeout(() => setMovePopup(null), 900);
  };

  const toggleSfx = () => {
    const next = !sfxEnabled;
    SfxManager.setEnabled(next);
    setSfxEnabled(next);
    Taro.showToast({ title: next ? '音效已开启' : '音效已关闭', icon: 'none' });
    if (next) {
      SfxManager.play('hit');
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === question.correctAnswer;
    if (isCorrect) {
      const weakness = weaknessByQuestion[currentQuestion] || 0;
      const actualDamage = calcWeaknessDamage(question.attackDamage, weakness);
      const moveBase = getMoveName(question.stage, question.knowledgeTag);
      const moveName = weakness > 0 ? `${moveBase} 弱点暴击！` : moveBase;

      const nextCombo = correctCount + 1;
      setComboCount(nextCombo);
      const comboLabel = getComboLabel(nextCombo);
      if (comboLabel) {
        setComboPopup(comboLabel);
        setTimeout(() => setComboPopup(null), 900);
      }

      setCorrectCount((prev) => prev + 1);
      setEarnedCoins((prev) => prev + question.reward.coins);
      setEarnedKnowledge((prev) => prev + question.reward.knowledge);

      const hpLoss = (actualDamage / todayBoss.maxHp) * 100;
      const nextHp = Math.max(0, bossHpPercent - hpLoss);
      triggerBossHit(actualDamage, nextHp, moveName);
    } else {
      addWeaknessLevel();
    }
    StorageManager.answerQuestion(isCorrect);
  };

  const completeChallenge = useCallback(
    (finalCorrectCount: number) => {
      const elapsed = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      const isPassed = finalCorrectCount >= 2;
      setDurationSec(elapsed);
      setPassed(isPassed);
      StorageManager.completeDailyChallenge({
        correctCount: finalCorrectCount,
        durationSec: elapsed,
        passed: isPassed,
        knowledgeTag: questions[questions.length - 1]?.knowledgeTag || '',
      });
      setIsCompleted(true);
      setCanClaim(true);
      loadData();
    },
    [loadData, questions]
  );

  const handleNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      return;
    }
    completeChallenge(correctCount);
  }, [completeChallenge, correctCount, currentQuestion, questions.length]);

  useEffect(() => {
    if (!showResult || selectedAnswer !== question.correctAnswer) {
      return;
    }

    const isLastQuestion = currentQuestion === questions.length - 1;
    const delay = isLastQuestion ? 1100 : 900;

    const timer = setTimeout(() => {
      if (isLastQuestion && !finisherTriggeredRef.current) {
        finisherTriggeredRef.current = true;
        setShowFinisher(true);
        SfxManager.play('finisher');
        Taro.vibrateShort({ type: 'medium' }).catch(() => undefined);
        setTimeout(() => {
          setShowFinisher(false);
          completeChallenge(correctCount + 1);
        }, 1000);
        return;
      }
      if (!isLastQuestion) {
        handleNext();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [showResult, selectedAnswer, currentQuestion, question.correctAnswer, correctCount, completeChallenge, handleNext, questions.length]);

  const buildPoster = useCallback(async () => {
    try {
      const p = StorageManager.getProgress();
      const url = await generateDailyChallengePoster({
        bossKey: todayBoss.key,
        dailyNickname: todayBoss.dailyNickname,
        seriesName: todayBoss.name,
        correctCount,
        totalCount: questions.length,
        durationSec,
        motherTopicSummary: todayBoss.motherTopicSummary,
        topicTypeLabel: todayBoss.topicTypeLabel,
        rankPoints: p.rankInfo.points,
        classClearHint: `全班仅 ${getMockClassClearCount()} 人今日通关`,
        passed,
      });
      setPosterUrl(url);
      return url;
    } catch {
      return '';
    }
  }, [correctCount, durationSec, passed, questions.length, todayBoss]);

  useEffect(() => {
    if (!isCompleted) {
      return;
    }
    // 等待 Canvas 2D 节点挂载后再绘制海报
    const timer = setTimeout(() => {
      buildPoster();
    }, 300);
    return () => clearTimeout(timer);
  }, [buildPoster, isCompleted]);

  useShareAppMessage(() => {
    StorageManager.recordShareAction(false);
    const reward = StorageManager.claimDailyShareReward();
    if (reward.success) {
      Taro.showToast({ title: reward.message, icon: 'success' });
      loadData();
    }
    return {
      title: formatShareTitle(durationSec, todayBoss.dailyNickname, todayBoss.motherTopicSummary),
      path: '/pages/DailyGatePage/index',
      imageUrl: posterUrl || undefined,
    };
  });

  const handleClaimReward = () => {
    const result = StorageManager.claimDailyChallengeReward();
    if (result.success) {
      Taro.showToast({ title: '领取成功！', icon: 'success' });
      setCanClaim(false);
      loadData();
      return;
    }
    Taro.showToast({ title: result.message, icon: 'none' });
  };

  const enterMainWorld = () => {
    Taro.showToast({
      title: '🏫 校园大门已打开！',
      icon: 'none',
      duration: 1200,
    });
    setTimeout(() => {
      Taro.switchTab({ url: '/pages/MainWorldPage/index' });
    }, 900);
  };

  const handleFinish = () => {
    if (isGateEntry) {
      enterMainWorld();
      return;
    }
    Taro.navigateBack();
  };

  const handlePreviewPoster = () => {
    if (!posterUrl) {
      Taro.showToast({ title: '高清海报生成中…', icon: 'none' });
      return;
    }
    Taro.previewImage({ urls: [posterUrl] });
  };

  const handleShareTap = () => {
    StorageManager.recordShareAction(false);
    if (!posterUrl) {
      Taro.showToast({ title: '海报生成中，请稍候', icon: 'none' });
      return;
    }
    Taro.showShareMenu({ withShareTicket: true });
    Taro.showModal({
      title: '分享战绩',
      content: '可先点「预览高清海报」确认效果，再点右上角「···」分享到班级群，首次分享 +5 金币',
      showCancel: false,
    });
  };

  if (!progress) {
    return (
      <View style={{ minHeight: '100vh', background: BOSS_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff' }}>加载中...</Text>
      </View>
    );
  }

  if (isCompleted) {
    const passRate = Math.round((correctCount / questions.length) * 100);

    return (
      <View style={{ minHeight: '100vh', background: BOSS_GRADIENT, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <Canvas type="2d" id={SHARE_CANVAS_ID} style={SHARE_CANVAS_STYLE} />
        <View style={{ background: '#fff', borderRadius: '20px', padding: '28px 20px', width: '100%', maxWidth: '380px' }}>
          <View style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <View
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '20px',
                overflow: 'hidden',
                border: `3px solid ${bossTheme.accent}`,
                boxShadow: `0 10px 28px ${bossTheme.glow}`,
              }}
            >
              {bossPortrait ? (
                <Image src={bossPortrait} mode="aspectFill" style={{ width: '120px', height: '120px' }} />
              ) : (
                <Text style={{ fontSize: '56px', textAlign: 'center', lineHeight: '120px' }}>{todayBoss.emoji}</Text>
              )}
            </View>
          </View>
          <View style={{ marginTop: '8px' }}>
            <MascotBubble
              message={
                passed
                  ? `太棒了！${durationSec} 秒击败 ${todayBoss.dailyNickname}，快去晒战绩吧！`
                  : `别灰心，明天再战 ${todayBoss.dailyNickname}，母题「${todayBoss.motherTopicSummary}」多练一次！`
              }
              size="compact"
              theme="light"
            />
          </View>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', display: 'block', textAlign: 'center', marginTop: '12px' }}>
            {passed ? '今日 Boss 已击败！' : '今日 Boss 战结束'}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: '13px', marginTop: '6px', display: 'block', textAlign: 'center' }}>
            {bossDisplay.primaryTitle} · 用时 {durationSec} 秒
          </Text>

          {posterUrl ? (
            <View onClick={handlePreviewPoster} style={{ marginTop: '14px', borderRadius: '14px', overflow: 'hidden', border: '2px solid #e0e7ff' }}>
              <Image src={posterUrl} mode="widthFix" style={{ width: '100%', display: 'block' }} />
              <Text style={{ display: 'block', textAlign: 'center', color: '#6366f1', fontSize: '12px', padding: '8px' }}>
                点击预览高清战绩海报
              </Text>
            </View>
          ) : (
            <Text style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', display: 'block', marginTop: '12px' }}>
              正在生成高清海报…
            </Text>
          )}

          <View style={{ marginTop: '16px', background: '#f8fafc', borderRadius: '14px', padding: '14px' }}>
            <Text style={{ color: '#111827', fontSize: '14px', display: 'block' }}>答对 {correctCount}/{questions.length} · 正确率 {passRate}%</Text>
            <Text style={{ color: '#111827', fontSize: '14px', display: 'block', marginTop: '6px' }}>
              本局收益：+{earnedCoins} 金币 +{earnedKnowledge} {REWARD_LABEL}
            </Text>
            <Text style={{ color: '#6366f1', fontSize: '12px', display: 'block', marginTop: '6px' }}>
              母题类型：{todayBoss.topicTypeLabel} · {todayBoss.motherTopicSummary}
            </Text>
            <View
              style={{
                marginTop: '10px',
                background: '#eef2ff',
                borderRadius: '12px',
                padding: '12px',
              }}
            >
              <Text style={{ color: '#4338ca', fontSize: '12px', fontWeight: 'bold', display: 'block' }}>
                记住两个词，和同学聊
              </Text>
              <Text style={{ color: '#1e1b4b', fontSize: '14px', fontWeight: 'bold', marginTop: '6px', display: 'block' }}>
                {todayBoss.dailyNickname} + {todayBoss.motherTopicSummary}
              </Text>
              <Text style={{ color: '#64748b', fontSize: '11px', marginTop: '6px', display: 'block' }}>
                {todayBoss.classTalk}
              </Text>
            </View>
            <Text style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginTop: '4px' }}>
              全班仅 {getMockClassClearCount()} 人今日通关
            </Text>
          </View>

          {canClaim && passed ? (
            <View onClick={handleClaimReward} style={{ marginTop: '14px', background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>领取每日 Boss 奖励</Text>
            </View>
          ) : null}

          <View onClick={handlePreviewPoster} style={{ marginTop: '10px', background: '#eef2ff', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <Text style={{ color: '#4338ca', fontWeight: 'bold' }}>预览高清海报</Text>
          </View>

          <View onClick={handleShareTap} style={{ marginTop: '10px', background: '#16a34a', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>晒战绩到微信（+5金币）</Text>
          </View>

          <View
            onClick={handleFinish}
            style={{
              marginTop: '10px',
              background: isGateEntry ? 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)' : '#e5e7eb',
              borderRadius: '12px',
              padding: '14px',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: isGateEntry ? '#fff' : '#374151', fontWeight: 'bold' }}>
              {isGateEntry ? '打开校园大门' : '返回'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ minHeight: '100vh', background: BOSS_GRADIENT, padding: '20px 16px' }}>
      <Canvas type="2d" id={SHARE_CANVAS_ID} style={SHARE_CANVAS_STYLE} />
      {comboPopup ? <ComboBanner combo={comboCount} label={comboPopup} /> : null}

      {showFinisher ? (
        <View
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(79,70,229,0.92)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BossPortrait
            bossKey={todayBoss.key}
            emoji={todayBoss.emoji}
            size={200}
            borderColor={bossTheme.accent}
            backgroundColor={bossTheme.secondary}
          />
          <Text style={{ color: '#fde68a', fontSize: '28px', fontWeight: 'bold' }}>母题必杀！</Text>
          <Text style={{ color: '#fff', fontSize: '16px', marginTop: '8px' }}>{todayBoss.dailyNickname}</Text>
        </View>
      ) : null}

      <View style={{ maxWidth: '460px', margin: '0 auto' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!isGateEntry ? (
            <View
              onClick={() => Taro.navigateBack()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff' }}>←</Text>
            </View>
          ) : (
            <View style={{ width: '40px' }} />
          )}
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '17px' }}>通缉：{todayBoss.dailyNickname}</Text>
          <View
            onClick={toggleSfx}
            style={{
              padding: '6px 10px',
              borderRadius: '999px',
              background: sfxEnabled ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.15)',
            }}
          >
            <Text style={{ color: '#fff', fontSize: '11px' }}>{sfxEnabled ? '🔊' : '🔇'}</Text>
          </View>
        </View>

        <View style={{ marginTop: '10px' }}>
          <MascotBubble
            message={`${todayBoss.topicTypeLabel}：${todayBoss.motherTopicSummary} · 击败 ${todayBoss.dailyNickname}！`}
            size="compact"
          />
        </View>

        <BossHeader
          boss={todayBoss}
          hpPercent={bossHpPercent}
          damagePopup={damagePopup}
          movePopup={movePopup}
          shake={bossShake}
          weaknessLevel={currentWeakness}
        />

        <View style={{ marginTop: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
          <Text style={{ color: '#fde68a', fontSize: '12px' }}>
            第{currentQuestion + 1}击 · {getStageLabel(question.stage)}
          </Text>
          <View style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
            {questions.map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '999px',
                  background: i <= currentQuestion ? '#22c55e' : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </View>
        </View>

        <View style={{ marginTop: '14px', background: '#fff', borderRadius: '16px', padding: '18px' }}>
          <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '12px' }}>{question.knowledge}</Text>
          <Text style={{ color: '#111827', fontSize: '22px', fontWeight: 'bold', marginTop: '8px', lineHeight: 1.4 }}>
            {question.question}
          </Text>

          <View style={{ marginTop: '14px' }}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === question.correctAnswer;
              let stateBg = '#f8fafc';
              let stateBorder = '#e5e7eb';
              if (showResult && isCorrectOption) {
                stateBg = '#dcfce7';
                stateBorder = '#22c55e';
              } else if (showResult && isSelected && !isCorrectOption) {
                stateBg = '#fff7ed';
                stateBorder = '#fdba74';
              }

              return (
                <View
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  style={{
                    border: `2px solid ${stateBorder}`,
                    background: stateBg,
                    borderRadius: '12px',
                    padding: '12px',
                    marginTop: '8px',
                  }}
                >
                  <Text style={{ color: '#111827', fontSize: '16px' }}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {showResult && selectedAnswer === question.correctAnswer ? (
          <View style={{ marginTop: '12px', background: 'rgba(34,197,94,0.25)', borderRadius: '12px', padding: '12px' }}>
            <Text style={{ color: '#fde68a', fontWeight: 'bold', fontSize: '16px' }}>
              {getMoveName(question.stage, question.knowledgeTag)}
            </Text>
            <Text style={{ color: '#bbf7d0', fontWeight: 'bold', fontSize: '14px', marginTop: '4px', display: 'block' }}>
              {MASCOT.name}：{MASCOT.cheer} 造成 {lastHitDamage || question.attackDamage} 点伤害
              {currentWeakness > 0 ? `（弱点 +${currentWeakness * 20}%）` : ''}
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}>
          <Text style={{ color: '#fff', fontSize: '13px' }}>
            本题奖励：+{question.reward.coins} 金币 +{question.reward.knowledge} {REWARD_LABEL}
          </Text>
          <Text style={{ color: '#cbd5e1', fontSize: '12px', marginTop: '4px' }}>
            累计：+{earnedCoins} 金币 +{earnedKnowledge} {REWARD_LABEL}
          </Text>
        </View>

        {showResult && selectedAnswer !== question.correctAnswer ? (
          <View style={{ marginTop: '12px', background: '#f97316', borderRadius: '12px', padding: '12px' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px' }}>
              发现弱点！（{currentWeakness}/{WEAKNESS_MAX}）
            </Text>
            <Text style={{ color: '#fff', opacity: 0.95, fontSize: '12px', marginTop: '4px' }}>{question.hint}</Text>
            <Text style={{ color: '#fde68a', fontSize: '11px', marginTop: '6px', display: 'block' }}>
              再答同一题，伤害 +{currentWeakness * 20}%
            </Text>
            <View
              onClick={handleWeaknessRetry}
              style={{
                marginTop: '10px',
                background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <Text style={{ color: '#1e1b4b', fontWeight: 'bold' }}>弱点再打一拳</Text>
            </View>
            <View
              onClick={handleNext}
              style={{
                marginTop: '8px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '13px' }}>
                {currentQuestion < questions.length - 1 ? '先打下一题' : '查看战报'}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
