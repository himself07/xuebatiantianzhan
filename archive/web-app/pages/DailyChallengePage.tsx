import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { FloatingPet } from '../components/FloatingPet';
import { PageGreeting } from '../components/PageGreeting';
import { playSound } from '../utils/audio';

const dailyChallengeGreetings = [
  '每日挑战来啦！我相信你一定能行的！🎯',
  '加油加油！今天的题目一定很棒！✨',
  '准备好了吗？让我们开始吧！🏃',
];

const questions = [
  {
    id: 1,
    type: '奥数题',
    category: 'basic',
    question: '小华买铅笔，买4支还剩3元，买7支还差3元，每支铅笔多少元？',
    options: ['2元', '3元', '4元', '5元'],
    correctAnswer: 0,
    hint: '设每支x元，小华的钱数为y元。买4支剩3元：y=4x+3；买7支差3元：y=7x-3。所以4x+3=7x-3，解得x=2元',
  },
  {
    id: 2,
    type: '思维题',
    category: 'review',
    question: '找规律：1、1、2、3、5、8、（ ）',
    options: ['11', '12', '13', '14'],
    correctAnswer: 2,
    hint: '这是斐波那契数列，每个数是前两个数的和：1+1=2，1+2=3，2+3=5，3+5=8，5+8=13',
  },
  {
    id: 3,
    type: '应用题',
    category: 'new',
    question: '一辆汽车从甲地开往乙地，去时每小时行60千米，回来时每小时行40千米，往返共用5小时，甲乙两地相距多少千米？',
    options: ['100千米', '120千米', '140千米', '150千米'],
    correctAnswer: 1,
    hint: '设距离为x千米，去时用时x÷60小时，回来用时x÷40小时，总时间：x÷60 + x÷40 = 5，通分：2x/120 + 3x/120 = 5，5x/120 = 5，x = 120',
  },
];

const encouragements = [
  '太棒了！你真是天才！',
  '答对了！继续保持！',
  '完美！你的进步真快！',
  '优秀！就是这样！',
  '厉害！你真聪明！',
  '很棒！你做得真好！',
];

export function DailyChallengePage() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | undefined>(undefined);
  const [coins, setCoins] = useState(0);
  const [petMood, setPetMood] = useState<'idle' | 'thinking' | 'happy' | 'cheering'>('cheering');

  useEffect(() => {
    const progress = StorageManager.getProgress();
    setCoins(progress.coins);
  }, []);

  const question = questions[currentQuestion];
  const isCorrect = selectedAnswer === question.correctAnswer;

  const getEncouragement = () => {
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return 'bg-blue-100 text-blue-700';
      case 'review':
        return 'bg-purple-100 text-purple-700';
      case 'new':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleUseHint = () => {
    StorageManager.updateProgress((progress) => ({
      coins: progress.coins - 10,
    }));
    setCoins(coins - 10);
    setCurrentHint(question.hint);
    setPetMood('thinking');
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);

    if (index === question.correctAnswer) {
      setCorrectCount((prev) => prev + 1);
      setPetMood('happy');
      playSound('success');
    } else {
      setPetMood('idle');
      playSound('error');
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
      // 完成挑战
      setCompleted(true);
      playSound('levelUp');
      const finalCorrect = correctCount + (selectedAnswer === question.correctAnswer ? 1 : 0);
      StorageManager.updateProgress((progress) => ({
        dailyChallengeCompleted: true,
        coins: progress.coins + 50,
        petFood: progress.petFood + 10,
        energy: progress.energy + 10,
        todayAnswerCount: (progress.todayAnswerCount || 0) + 3,
        todayCorrectRate: Math.round((finalCorrect / 3) * 100),
      }));
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">挑战完成！</h2>
          <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-2xl p-6 mb-6">
            <p className="text-lg text-gray-700 mb-4">你答对了 <span className="text-3xl font-bold text-orange-600">{correctCount}</span> / {questions.length} 题</p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>获得金币</span>
                <span className="font-bold text-yellow-600">+50 🪙</span>
              </div>
              <div className="flex items-center justify-between">
                <span>获得口粮</span>
                <span className="font-bold text-pink-600">+10 💖</span>
              </div>
              <div className="flex items-center justify-between">
                <span>获得体力</span>
                <span className="font-bold text-green-600">+10 ⚡</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              返回学霸乐园
            </button>
            <button
              onClick={() => navigate('/main-world')}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              进入校园主世界
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50 p-4">
      <PageGreeting pageName="daily-challenge" pageGreetings={dailyChallengeGreetings} />
      {/* 顶部导航 */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Clock className="size-5 text-orange-500" />
            <span className="font-bold text-gray-700">每日闯关</span>
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
                    ? 'bg-orange-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            第 {currentQuestion + 1} / {questions.length} 题
          </p>
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className={`inline-block ${getCategoryColor(question.category)} px-4 py-2 rounded-full text-sm font-bold mb-4`}>
            {question.type}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {question.question}
          </h2>

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
                bgColor = 'bg-orange-50';
                borderColor = 'border-orange-500';
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

        {/* 结果反馈 - 答对自动进入下一题 */}
        {showResult && isCorrect && (
          <div className="bg-green-500 rounded-2xl shadow-xl p-6 mb-6 text-white animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎉</div>
              <div>
                <h3 className="text-xl font-bold">{getEncouragement()}</h3>
                <p className="text-sm opacity-90">
                  {currentQuestion < questions.length - 1
                    ? '即将进入下一题...'
                    : '完成所有题目！'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 答错显示下一题按钮 */}
        {showResult && !isCorrect && (
          <div className="bg-orange-500 rounded-2xl shadow-xl p-6 mb-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-4xl">💪</div>
              <div>
                <h3 className="text-xl font-bold">继续努力！</h3>
                <p className="text-sm opacity-90">没关系，我们一起学习进步</p>
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

      {/* 悬浮宠物助手 */}
      {!showResult && (
        <FloatingPet
          coins={coins}
          onUseHint={handleUseHint}
          hint={currentHint}
          mood={petMood}
        />
      )}
    </div>
  );
}
