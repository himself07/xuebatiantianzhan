import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';

// 奥数题目数据
interface OlympiadQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

const teacherHuangQuestions: OlympiadQuestion[] = [
  {
    id: 1,
    question: '小明买了3支铅笔，每支5元，付了20元，应找回多少元？',
    options: ['3元', '5元', '10元', '15元'],
    correctAnswer: 1,
    hint: '先算3支铅笔一共多少钱：3×5=15元，再用20元减去15元',
    difficulty: 'easy',
    category: '应用题',
  },
  {
    id: 2,
    question: '找规律填数：2、4、6、8、（ ）、12',
    options: ['9', '10', '11', '14'],
    correctAnswer: 1,
    hint: '这是偶数数列，每次增加2',
    difficulty: 'easy',
    category: '找规律',
  },
];

const directorQuestions: OlympiadQuestion[] = [
  {
    id: 11,
    question: '一个数加上8，乘以8，减去8，除以8，结果还是8，这个数是多少？',
    options: ['1', '8', '9', '16'],
    correctAnswer: 2,
    hint: '倒推：8×8=64，64+8=72，72÷8=9，9-8=1',
    difficulty: 'medium',
    category: '逆推问题',
  },
  {
    id: 12,
    question: '有一堆苹果，2个2个数余1个，3个3个数余1个，5个5个数余1个，这堆苹果最少有多少个？',
    options: ['15个', '21个', '30个', '31个'],
    correctAnswer: 3,
    hint: '找2、3、5的最小公倍数是30，再加1',
    difficulty: 'medium',
    category: '数论',
  },
];

const principalQuestions: OlympiadQuestion[] = [
  {
    id: 21,
    question: '有红、黄、蓝三种颜色的球各10个，混放在一起。至少要摸出多少个球，才能保证有4个球的颜色相同？',
    options: ['10个', '11个', '12个', '13个'],
    correctAnswer: 0,
    hint: '最坏情况：每种颜色都摸3个共9个，再摸1个必有4个同色，所以是10个',
    difficulty: 'hard',
    category: '抽屉原理',
  },
  {
    id: 22,
    question: '甲、乙两数的和是187，甲数除以乙数商11余7，甲数是多少？',
    options: ['152', '157', '162', '172'],
    correctAnswer: 2,
    hint: '设乙数为x，则甲数=11x+7，11x+7+x=187，12x=180，x=15，甲=11×15+7=172',
    difficulty: 'hard',
    category: '方程思想',
  },
];

const getRandomQuestions = (
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5
): OlympiadQuestion[] => {
  let pool: OlympiadQuestion[] = [];
  switch (difficulty) {
    case 'easy':
      pool = teacherHuangQuestions;
      break;
    case 'medium':
      pool = directorQuestions;
      break;
    case 'hard':
      pool = principalQuestions;
      break;
  }
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

type Boss = 'huang' | 'director' | 'principal';

interface BossInfo {
  id: Boss;
  name: string;
  title: string;
  emoji: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  energyCost: number;
  rewards: {
    coins: number;
    cardPacks: number;
    rarity: string;
  };
  description: string;
}

const BOSSES: BossInfo[] = [
  {
    id: 'huang',
    name: '黄老师',
    title: '班主任',
    emoji: '👨‍🏫',
    color: 'from-green-400 to-green-600',
    difficulty: 'easy',
    energyCost: 5,
    rewards: { coins: 30, cardPacks: 1, rarity: 'R/SR' },
    description: '和蔼可亲的班主任，会出一些基础奥数题',
  },
  {
    id: 'director',
    name: '李主任',
    title: '教导主任',
    emoji: '👩‍🏫',
    color: 'from-blue-400 to-purple-600',
    difficulty: 'medium',
    energyCost: 8,
    rewards: { coins: 60, cardPacks: 2, rarity: 'SR/S' },
    description: '严格认真的教导主任，题目需要仔细思考',
  },
  {
    id: 'principal',
    name: '王校长',
    title: '校长',
    emoji: '👨‍💼',
    color: 'from-orange-400 via-red-500 to-pink-600',
    difficulty: 'hard',
    energyCost: 10,
    rewards: { coins: 120, cardPacks: 3, rarity: 'S/SSR' },
    description: '学识渊博的校长，出题难度极高！',
  },
];

export default function PrincipalOfficePage() {
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [inChallenge, setInChallenge] = useState(false);
  const [questions, setQuestions] = useState<OlympiadQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [coins, setCoins] = useState(0);
  const [energy, setEnergy] = useState(0);
  const handleBack = () => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack();
      return;
    }
    Taro.switchTab({ url: '/pages/MainWorldPage/index' });
  };

  useEffect(() => {
    const progress = Taro.getStorageSync('learningProgress') || {};
    setCoins(progress.coins || 0);
    setEnergy(progress.energy || 0);
  }, []);

  const startChallenge = (boss: Boss) => {
    const bossInfo = BOSSES.find((b) => b.id === boss)!;

    if (energy < bossInfo.energyCost) {
      Taro.showModal({
        title: '体力不足',
        content: `挑战${bossInfo.name}需要${bossInfo.energyCost}点体力`,
        showCancel: false
      });
      return;
    }

    // 扣除体力
    const progress = Taro.getStorageSync('learningProgress') || {};
    progress.energy = (progress.energy || 0) - bossInfo.energyCost;
    Taro.setStorageSync('learningProgress', progress);
    setEnergy(energy - bossInfo.energyCost);

    // 生成题目
    const newQuestions = getRandomQuestions(bossInfo.difficulty, 5);
    setQuestions(newQuestions);
    setSelectedBoss(boss);
    setInChallenge(true);
    setCurrentQuestion(0);
    setCorrectCount(0);
    setCompleted(false);
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setTimeout(() => handleNext(), 2000);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeChallenge();
    }
  };

  const completeChallenge = () => {
    const bossInfo = BOSSES.find((b) => b.id === selectedBoss)!;
    const passScore = selectedBoss === 'huang' ? 3 : selectedBoss === 'director' ? 4 : 5;
    const passed = correctCount >= passScore;

    if (passed) {
      const progress = Taro.getStorageSync('learningProgress') || {};
      progress.coins = (progress.coins || 0) + bossInfo.rewards.coins;
      progress.petFood = (progress.petFood || 0) + bossInfo.rewards.cardPacks * 5;
      Taro.setStorageSync('learningProgress', progress);
    }

    setCompleted(true);
  };

  const getCurrentBoss = () => BOSSES.find((b) => b.id === selectedBoss)!;

  if (completed && selectedBoss) {
    const bossInfo = getCurrentBoss();
    const passScore = selectedBoss === 'huang' ? 3 : selectedBoss === 'director' ? 4 : 5;
    const passed = correctCount >= passScore;

    return (
      <View style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #581c87 0%, #be185d 50%, #831843 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <View style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '32px', maxWidth: '448px', width: '100%', textAlign: 'center' }}>
          <Text style={{ fontSize: '80px', marginBottom: '24px' }}>{passed ? '🎉' : '💪'}</Text>
          <Text style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>
            {passed ? '挑战成功！' : '继续努力！'}
          </Text>

          <View style={{ marginBottom: '24px' }}>
            <Text style={{ fontSize: '18px', color: '#374151', marginBottom: '8px' }}>
              你答对了 <Text style={{ fontSize: '36px', fontWeight: 'bold', color: '#7c3aed' }}>{correctCount}</Text> /{' '}
              {questions.length} 题
            </Text>
            <Text style={{ fontSize: '14px', color: '#6b7280' }}>
              {passed ? `成功击败${bossInfo.name}！` : `需要答对${passScore}题才能通过`}
            </Text>
          </View>

          {passed && (
            <View style={{ background: 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)', border: '2px solid #fcd34d', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
              <Text style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>获得奖励</Text>
              <View style={{ gap: '8px', fontSize: '14px' }}>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text>金币</Text>
                  <Text style={{ fontWeight: 'bold', color: '#ca8a04' }}>+{bossInfo.rewards.coins} 🪙</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text>卡包</Text>
                  <Text style={{ fontWeight: 'bold', color: '#7c3aed' }}>
                    +{bossInfo.rewards.cardPacks} 个 ({bossInfo.rewards.rarity})
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ gap: '12px' }}>
            <View
              onClick={() => {
                setInChallenge(false);
                setSelectedBoss(null);
                setCompleted(false);
              }}
              style={{ width: '100%', background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)', color: '#fff', paddingTop: '16px', paddingBottom: '16px', borderRadius: '12px', fontWeight: 'bold' }}
            >
              继续挑战
            </View>
            <View
              onClick={handleBack}
              style={{ width: '100%', background: '#e5e7eb', color: '#374151', paddingTop: '16px', paddingBottom: '16px', borderRadius: '12px', fontWeight: 'bold' }}
            >
              返回主世界
            </View>
          </View>
        </View>
      </View>
    );
  }

  if (inChallenge && selectedBoss) {
    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctAnswer;
    const bossInfo = getCurrentBoss();

    return (
      <View style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #faf5ff 0%, #fce7f3 100%)', padding: '16px' }}>
        {/* 顶部信息 */}
        <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <View
              onClick={() => {
                Taro.showModal({
                  title: '确认退出',
                  content: '确定要放弃挑战吗？',
                  success: (res) => {
                    if (res.confirm) {
                      setInChallenge(false);
                      setSelectedBoss(null);
                    }
                  }
                });
              }}
              style={{ background: '#fff', padding: '12px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              <Text style={{ color: '#374151' }}>←</Text>
            </View>
            <View style={{ background: `linear-gradient(90deg, ${bossInfo.color.includes('green') ? '#22c55e' : bossInfo.color.includes('blue') ? '#3b82f6' : '#f97316'} 0%, ${bossInfo.color.includes('purple') ? '#a855f7' : bossInfo.color.includes('pink') ? '#ec4899' : '#ea580c'} 100%)`, color: '#fff', paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <Text style={{ fontSize: '24px', marginRight: '8px' }}>{bossInfo.emoji}</Text>
              <Text style={{ fontWeight: 'bold' }}>挑战{bossInfo.name}</Text>
            </View>
            <View style={{ width: '44px' }}></View>
          </View>

          {/* 进度条 */}
          <View style={{ background: '#fff', borderRadius: '9999px', padding: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {questions.map((_, index) => (
                <View
                  key={index}
                  style={{ flex: 1, height: '8px', borderRadius: '9999px' }}
                />
              ))}
            </View>
            <Text style={{ textAlign: 'center', fontSize: '14px', color: '#4b5563', marginTop: '8px' }}>
              第 {currentQuestion + 1} / {questions.length} 题 | 已答对 {correctCount} 题
            </Text>
          </View>
        </View>

        {/* 题目卡片 */}
        <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto' }}>
          <View style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '32px', marginBottom: '24px' }}>
            <View style={{ background: '#f3e8ff', color: '#7c3aed', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold', display: 'inline-block', marginBottom: '16px' }}>
              {question.category}
            </View>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '32px', lineHeight: 1.5 }}>{question.question}</Text>

            <View style={{ gap: '16px' }}>
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = index === question.correctAnswer;

                let bgColor = '#f9fafb';
                let borderColor = '#e5e7eb';
                let icon = null;

                if (showResult) {
                  if (isCorrectOption) {
                    bgColor = '#f0fdf4';
                    borderColor = '#22c55e';
                    icon = '✓';
                  } else if (isSelected && !isCorrect) {
                    bgColor = '#fef2f2';
                    borderColor = '#ef4444';
                    icon = '✗';
                  }
                } else if (isSelected) {
                  bgColor = '#faf5ff';
                  borderColor = '#a855f7';
                }

                return (
                  <View
                    key={index}
                    onClick={() => handleAnswer(index)}
                    style={{ width: '100%', background: bgColor, border: `2px solid ${borderColor}`, borderRadius: '16px', padding: '24px', textAlign: 'left' }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <View
                          style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}
                        >
                          {String.fromCharCode(65 + index)}
                        </View>
                        <Text style={{ fontSize: '18px', color: '#1e293b' }}>{option}</Text>
                      </View>
                      {icon && <Text style={{ fontSize: '20px' }}>{icon}</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 结果反馈 */}
          {showResult && isCorrect && (
            <View style={{ background: '#22c55e', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px', color: '#fff' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Text style={{ fontSize: '36px' }}>🎉</Text>
                <View>
                  <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>答对了！太棒了！</Text>
                  <Text style={{ fontSize: '14px', opacity: 0.9 }}>
                    {currentQuestion < questions.length - 1 ? '即将进入下一题...' : '完成所有题目！'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {showResult && !isCorrect && (
            <View style={{ background: '#f97316', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px', color: '#fff' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <Text style={{ fontSize: '36px' }}>💪</Text>
                <View>
                  <Text style={{ fontSize: '20px', fontWeight: 'bold' }}>继续努力！</Text>
                  <Text style={{ fontSize: '14px', opacity: 0.9 }}>没关系，继续加油</Text>
                </View>
              </View>
              <View
                onClick={handleNext}
                style={{ width: '100%', paddingTop: '16px', paddingBottom: '16px', borderRadius: '12px', fontWeight: 'bold' }}
              >
                {currentQuestion < questions.length - 1 ? '下一题' : '查看结果'}
              </View>
            </View>
          )}
        </View>

        {/* 悬浮宠物 */}
        <View style={{ position: 'fixed', bottom: '16px', right: '16px', background: '#fff', borderRadius: '50%', padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          <Text style={{ fontSize: '24px' }}>🐱</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fee2e2 100%)', padding: '16px' }}>
      {/* 顶部导航 */}
      <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View
            onClick={handleBack}
            style={{ background: '#fff', padding: '12px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <Text style={{ color: '#374151' }}>←</Text>
          </View>
          <View style={{ background: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ color: '#eab308' }}>👑</Text>
            <Text style={{ fontWeight: 'bold', color: '#374151' }}>校长室</Text>
          </View>
          <View style={{ background: '#22c55e', paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>⚡ {energy}</Text>
          </View>
        </View>
      </View>

      {/* 标题 */}
      <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', marginBottom: '32px' }}>
        <Text style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>🏫 校长室挑战</Text>
        <Text style={{ color: '#4b5563' }}>挑战学校最强者，证明你的实力！</Text>
      </View>

      {/* Boss列表 */}
      <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto' }}>
        {BOSSES.map((boss) => (
          <View
            key={boss.id}
            style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}
          >
            <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <View style={{ width: '80px', height: '80px', borderRadius: '50%', background: `linear-gradient(135deg, ${boss.color.includes('green') ? '#4ade80' : boss.color.includes('blue') ? '#60a5fa' : '#fb923c'} 0%, ${boss.color.includes('purple') ? '#a855f7' : boss.color.includes('pink') ? '#f472b6' : '#ef4444'} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  <Text>{boss.emoji}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>{boss.name}</Text>
                  <Text style={{ fontSize: '14px', color: '#6b7280' }}>{boss.title}</Text>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <Text style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>
                      {boss.difficulty === 'easy' ? '简单' : boss.difficulty === 'medium' ? '中等' : '困难'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Text style={{ color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>{boss.description}</Text>

            <View style={{ background: '#f9fafb', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
              <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text style={{ color: '#eab308' }}>⚡</Text>
                  <Text style={{ color: '#4b5563' }}>消耗 {boss.energyCost} 体力</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text style={{ color: '#eab308' }}>🏆</Text>
                  <Text style={{ color: '#4b5563' }}>{boss.rewards.coins} 金币</Text>
                </View>
                <View style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Text style={{ color: '#a855f7' }}>⭐</Text>
                  <Text style={{ color: '#4b5563' }}>
                    {boss.rewards.cardPacks} 个卡包 ({boss.rewards.rarity})
                  </Text>
                </View>
              </View>
            </View>

            <View
              onClick={() => startChallenge(boss.id)}
              style={{ width: '100%', paddingTop: '16px', paddingBottom: '16px', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
            >
              开始挑战
            </View>
          </View>
        ))}
      </View>

      {/* 提示 */}
      <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto', marginTop: '24px', background: '#fef3c7', border: '2px solid #fcd34d', borderRadius: '16px', padding: '16px' }}>
        <Text style={{ color: '#92400e', textAlign: 'center', fontSize: '14px' }}>
          💡 <Text style={{ fontWeight: 'bold' }}>提示：</Text>难度越高奖励越丰富！黄老师需要答对3题，李主任需要4题，王校长需要全对才能通过哦~
        </Text>
      </View>
    </View>
  );
}