import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { FloatingPet } from '../components/FloatingPet';
import { PageGreeting } from '../components/PageGreeting';
import { playSound } from '../utils/audio';

const funQuizGreetings = [
  '趣味问答时间到啦！轻松一下~ 🎮',
  '有趣的问题等着你呢！😄',
  '玩得开心学得轻松！🎉',
];

const quizQuestions = [
  { question: '25×4 = ?', answer: '100', hint: '25×4 = 25×(2×2) = (25×2)×2 = 50×2 = 100' },
  { question: '99+45 = ?', answer: '144', hint: '可以先算100+45=145，再减1得144' },
  { question: '720÷9 = ?', answer: '80', hint: '720÷9 = 720÷(10-1) 或者想：9×80=720' },
  { question: '17×5 = ?', answer: '85', hint: '17×5 = 17×10÷2 = 170÷2 = 85' },
  { question: '125×8 = ?', answer: '1000', hint: '125×8 = 125×2×4 = 250×4 = 1000' },
  { question: '56+99 = ?', answer: '155', hint: '56+99 = 56+100-1 = 156-1 = 155' },
];

export function FunQuizPage() {
  const navigate = useNavigate();
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [currentHint, setCurrentHint] = useState<string | undefined>(undefined);
  const [petMood, setPetMood] = useState<'idle' | 'thinking' | 'happy' | 'cheering'>('cheering');

  const quiz = quizQuestions[currentQuiz];

  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
    setCoins(progress.coins || 0);
  }, []);

  const handleUseHint = () => {
    const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
    progress.coins = (progress.coins || 0) - 10;
    localStorage.setItem('learningProgress', JSON.stringify(progress));
    setCoins(progress.coins);
    setCurrentHint(quiz.hint);
    setPetMood('thinking');
  };

  const handleSubmit = () => {
    const correct = userAnswer.trim() === quiz.answer;
    setIsCorrect(correct);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);

    if (correct) {
      setCorrectCount(prev => prev + 1);
      setPetMood('happy');
      playSound('success');
      // 更新进度
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.coins = (progress.coins || 0) + 5;
      progress.petFood = (progress.petFood || 0) + 1;
      progress.energy = (progress.energy || 0) + 1;
      progress.todayAnswerCount = (progress.todayAnswerCount || 0) + 1;
      const prevCorrectRate = progress.todayCorrectRate || 0;
      const prevCount = progress.todayAnswerCount - 1;
      progress.todayCorrectRate = Math.round(((prevCorrectRate * prevCount) + 100) / progress.todayAnswerCount);
      localStorage.setItem('learningProgress', JSON.stringify(progress));
      setCoins(progress.coins);
    } else {
      setPetMood('idle');
      playSound('error');
      // 答错也更新计数，但不更新正确率太多
      const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      progress.todayAnswerCount = (progress.todayAnswerCount || 0) + 1;
      const prevCorrectRate = progress.todayCorrectRate || 0;
      const prevCount = progress.todayAnswerCount - 1;
      progress.todayCorrectRate = Math.round(((prevCorrectRate * prevCount) + 0) / progress.todayAnswerCount);
      localStorage.setItem('learningProgress', JSON.stringify(progress));
    }
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowResult(false);
    setCurrentHint(undefined);
    setPetMood('cheering');
    setCurrentQuiz((prev) => (prev + 1) % quizQuestions.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <PageGreeting pageName="fun-quiz" pageGreetings={funQuizGreetings} />
      {/* 顶部导航 */}
      <div className="max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="bg-white px-4 py-2 rounded-full shadow-md">
            <span className="font-bold text-gray-700">趣味答题</span>
          </div>
          <button
            onClick={() => { window.location.reload(); playSound('click'); }}
            className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <RefreshCw className="size-5 text-gray-700" />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalAnswered}</p>
              <p className="text-xs text-gray-500">已答题数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{correctCount}</p>
              <p className="text-xs text-gray-500">答对题数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500">正确率</p>
            </div>
          </div>
        </div>
      </div>

      {/* 题目卡片 */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
              第 {currentQuiz + 1} 题
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              {quiz.question}
            </h2>
          </div>

          {!showResult ? (
            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="请输入答案"
                className="w-full border-2 border-gray-300 rounded-2xl px-6 py-4 text-2xl text-center font-bold focus:outline-none focus:border-blue-500 transition-colors"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    handleSubmit();
                  }
                }}
              />
              <button
                onClick={handleSubmit}
                disabled={!userAnswer.trim()}
                className={`w-full py-4 rounded-2xl font-bold text-white text-lg transition-all ${
                  userAnswer.trim()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                提交答案
              </button>
            </div>
          ) : (
            <div className={`rounded-2xl p-6 ${isCorrect ? 'bg-green-50' : 'bg-orange-50'}`}>
              <div className="flex items-center justify-center gap-3 mb-4">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="size-12 text-green-500" />
                    <div>
                      <h3 className="text-2xl font-bold text-green-700">太棒了！</h3>
                      <p className="text-sm text-green-600">回答正确</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="size-12 text-orange-500" />
                    <div>
                      <h3 className="text-2xl font-bold text-orange-700">继续加油！</h3>
                      <p className="text-sm text-orange-600">正确答案是: {quiz.answer}</p>
                    </div>
                  </>
                )}
              </div>

              {isCorrect && (
                <div className="bg-white rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-600 text-center">
                    获得奖励：<span className="font-bold text-yellow-600">+5金币</span> · 
                    <span className="font-bold text-pink-600">+1口粮</span> · 
                    <span className="font-bold text-green-600">+1体力</span>
                  </p>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-bold hover:scale-105 transition-transform"
              >
                下一题
              </button>
            </div>
          )}
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-700">
            💡 每答对一题可获得金币、口粮和体力奖励
          </p>
        </div>
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
