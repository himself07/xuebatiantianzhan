import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, Crown, Star, Zap, CheckCircle2, XCircle } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { FloatingPet } from '../components/FloatingPet';
import { getRandomQuestions, OlympiadQuestion } from '../data/olympiadQuestions';

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

export function PrincipalOfficePage() {
  const navigate = useNavigate();
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
  const [currentHint, setCurrentHint] = useState<string | undefined>(undefined);
  const [petMood, setPetMood] = useState<'idle' | 'thinking' | 'happy' | 'cheering'>('cheering');

  useEffect(() => {
    const progress = StorageManager.getProgress();
    setCoins(progress.coins);
    setEnergy(progress.energy);
  }, []);

  const startChallenge = (boss: Boss) => {
    const bossInfo = BOSSES.find((b) => b.id === boss)!;

    if (energy < bossInfo.energyCost) {
      alert(`体力不足！挑战${bossInfo.name}需要${bossInfo.energyCost}点体力`);
      return;
    }

    // 扣除体力
    StorageManager.updateProgress((progress) => ({
      energy: progress.energy - bossInfo.energyCost,
    }));
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

  const handleUseHint = () => {
    StorageManager.updateProgress((progress) => ({
      coins: progress.coins - 10,
    }));
    setCoins(coins - 10);
    setCurrentHint(questions[currentQuestion].hint);
    setPetMood('thinking');
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      setPetMood('happy');
      setTimeout(() => handleNext(), 2000);
    } else {
      setPetMood('idle');
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentHint(undefined);
      setPetMood('cheering');
    } else {
      completeChallenge();
    }
  };

  const completeChallenge = () => {
    const bossInfo = BOSSES.find((b) => b.id === selectedBoss)!;
    const passScore = selectedBoss === 'huang' ? 3 : selectedBoss === 'director' ? 4 : 5;
    const passed = correctCount >= passScore;

    if (passed) {
      StorageManager.updateProgress((progress) => ({
        coins: progress.coins + bossInfo.rewards.coins,
        petFood: progress.petFood + bossInfo.rewards.cardPacks * 5,
      }));
    }

    setCompleted(true);
  };

  const getCurrentBoss = () => BOSSES.find((b) => b.id === selectedBoss)!;

  if (completed && selectedBoss) {
    const bossInfo = getCurrentBoss();
    const passScore = selectedBoss === 'huang' ? 3 : selectedBoss === 'director' ? 4 : 5;
    const passed = correctCount >= passScore;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-8xl mb-6">{passed ? '🎉' : '💪'}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {passed ? '挑战成功！' : '继续努力！'}
          </h2>

          <div className="mb-6">
            <p className="text-lg text-gray-700 mb-2">
              你答对了 <span className="text-4xl font-bold text-purple-600">{correctCount}</span> /{' '}
              {questions.length} 题
            </p>
            <p className="text-sm text-gray-500">
              {passed ? `成功击败${bossInfo.name}！` : `需要答对${passScore}题才能通过`}
            </p>
          </div>

          {passed && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-gray-800 mb-3">获得奖励</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>金币</span>
                  <span className="font-bold text-yellow-600">+{bossInfo.rewards.coins} 🪙</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>卡包</span>
                  <span className="font-bold text-purple-600">
                    +{bossInfo.rewards.cardPacks} 个 ({bossInfo.rewards.rarity})
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                setInChallenge(false);
                setSelectedBoss(null);
                setCompleted(false);
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              继续挑战
            </button>
            <button
              onClick={() => navigate('/main-world')}
              className="w-full bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              返回主世界
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (inChallenge && selectedBoss) {
    const question = questions[currentQuestion];
    const isCorrect = selectedAnswer === question.correctAnswer;
    const bossInfo = getCurrentBoss();

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
        {/* 顶部信息 */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (confirm('确定要放弃挑战吗？')) {
                  setInChallenge(false);
                  setSelectedBoss(null);
                }
              }}
              className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
            >
              <ArrowLeft className="size-5 text-gray-700" />
            </button>
            <div className={`bg-gradient-to-r ${bossInfo.color} text-white px-6 py-3 rounded-full shadow-md`}>
              <span className="text-2xl mr-2">{bossInfo.emoji}</span>
              <span className="font-bold">挑战{bossInfo.name}</span>
            </div>
            <div className="w-11"></div>
          </div>

          {/* 进度条 */}
          <div className="bg-white rounded-full p-2 shadow-md">
            <div className="flex items-center gap-2">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    index < currentQuestion
                      ? 'bg-green-500'
                      : index === currentQuestion
                      ? 'bg-purple-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              第 {currentQuestion + 1} / {questions.length} 题 | 已答对 {correctCount} 题
            </p>
          </div>
        </div>

        {/* 题目卡片 */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <div className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              {question.category}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">{question.question}</h2>

            <div className="space-y-4">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectOption = index === question.correctAnswer;

                let bgColor = 'bg-gray-50 hover:bg-gray-100';
                let borderColor = 'border-gray-200';
                let icon = null;

                if (showResult) {
                  if (isCorrectOption) {
                    bgColor = 'bg-green-50';
                    borderColor = 'border-green-500';
                    icon = <CheckCircle2 className="size-6 text-green-500" />;
                  } else if (isSelected && !isCorrect) {
                    bgColor = 'bg-red-50';
                    borderColor = 'border-red-500';
                    icon = <XCircle className="size-6 text-red-500" />;
                  }
                } else if (isSelected) {
                  bgColor = 'bg-purple-50';
                  borderColor = 'border-purple-500';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`w-full ${bgColor} border-2 ${borderColor} rounded-2xl p-6 text-left transition-all hover:scale-102 ${
                      !showResult ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            showResult && isCorrectOption
                              ? 'bg-green-500 text-white'
                              : showResult && isSelected && !isCorrect
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg text-gray-800">{option}</span>
                      </div>
                      {icon}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 结果反馈 */}
          {showResult && isCorrect && (
            <div className="bg-green-500 rounded-2xl shadow-xl p-6 mb-6 text-white animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="text-4xl">🎉</div>
                <div>
                  <h3 className="text-xl font-bold">答对了！太棒了！</h3>
                  <p className="text-sm opacity-90">
                    {currentQuestion < questions.length - 1 ? '即将进入下一题...' : '完成所有题目！'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showResult && !isCorrect && (
            <div className="bg-orange-500 rounded-2xl shadow-xl p-6 mb-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">💪</div>
                <div>
                  <h3 className="text-xl font-bold">继续努力！</h3>
                  <p className="text-sm opacity-90">没关系，继续加油</p>
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-white/20 hover:bg-white/30 py-4 rounded-xl font-bold transition-all"
              >
                {currentQuestion < questions.length - 1 ? '下一题' : '查看结果'}
              </button>
            </div>
          )}
        </div>

        {/* 悬浮宠物 */}
        {!showResult && (
          <FloatingPet coins={coins} onUseHint={handleUseHint} hint={currentHint} mood={petMood} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 p-4">
      {/* 顶部导航 */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/main-world')}
            className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <Crown className="size-5 text-yellow-600" />
            <span className="font-bold text-gray-700">校长室</span>
          </div>
          <div className="bg-green-500 px-3 py-2 rounded-full shadow-md flex items-center gap-1">
            <Zap className="size-4 text-white" />
            <span className="text-sm font-bold text-white">{energy}</span>
          </div>
        </div>
      </div>

      {/* 标题 */}
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">🏫 校长室挑战</h1>
        <p className="text-gray-600">挑战学校最强者，证明你的实力！</p>
      </div>

      {/* Boss列表 */}
      <div className="max-w-2xl mx-auto space-y-6">
        {BOSSES.map((boss) => (
          <div
            key={boss.id}
            className="bg-white rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${boss.color} flex items-center justify-center text-5xl shadow-lg`}>
                  {boss.emoji}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{boss.name}</h3>
                  <p className="text-sm text-gray-500">{boss.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {[...Array(boss.id === 'huang' ? 1 : boss.id === 'director' ? 2 : 3)].map((_, i) => (
                      <Star key={i} className="size-4 text-yellow-500 fill-yellow-500" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      {boss.difficulty === 'easy' ? '简单' : boss.difficulty === 'medium' ? '中等' : '困难'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">{boss.description}</p>

            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-yellow-500" />
                  <span className="text-gray-600">消耗 {boss.energyCost} 体力</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-yellow-600" />
                  <span className="text-gray-600">{boss.rewards.coins} 金币</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Star className="size-4 text-purple-500" />
                  <span className="text-gray-600">
                    {boss.rewards.cardPacks} 个卡包 ({boss.rewards.rarity})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => startChallenge(boss.id)}
              className={`w-full bg-gradient-to-r ${boss.color} text-white py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg`}
            >
              开始挑战
            </button>
          </div>
        ))}
      </div>

      {/* 提示 */}
      <div className="max-w-2xl mx-auto mt-6 bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4">
        <p className="text-yellow-800 text-center text-sm">
          💡 <span className="font-bold">提示：</span>难度越高奖励越丰富！黄老师需要答对3题，李主任需要4题，王校长需要全对才能通过哦~
        </p>
      </div>
    </div>
  );
}
