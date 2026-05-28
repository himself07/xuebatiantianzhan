import { useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';

const errorQuestions = [
  {
    id: 1,
    question: '45 + 28 = ?',
    yourAnswer: '63',
    correctAnswer: '73',
    date: '2026-03-23',
  },
  {
    id: 2,
    question: '小明买了3支铅笔，每支5元，他付了20元，应该找回多少钱？',
    yourAnswer: '10元',
    correctAnswer: '5元',
    date: '2026-03-22',
  },
  {
    id: 3,
    question: '7 × 8 = ?',
    yourAnswer: '54',
    correctAnswer: '56',
    date: '2026-03-21',
  },
];

export function ErrorBookPage() {
  const navigate = useNavigate();

  const handleRetry = (questionId: number) => {
    alert('开始订正题目 #' + questionId);
    // 这里可以跳转到答题页面
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 p-4">
      {/* 顶部导航 */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <AlertCircle className="size-5 text-red-500" />
            <span className="font-bold text-gray-700">错题本</span>
          </div>
          <div className="w-11"></div>
        </div>

        {/* 统计卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-red-600">{errorQuestions.length}</p>
              <p className="text-sm text-gray-500 mt-1">待订正</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">12</p>
              <p className="text-sm text-gray-500 mt-1">已订正</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">80%</p>
              <p className="text-sm text-gray-500 mt-1">订正率</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-orange-800 text-center flex items-center justify-center gap-2">
            <span>💡</span>
            <span>订正错题可获得爱心口粮，强化薄弱知识点</span>
          </p>
        </div>
      </div>

      {/* 错题列表 */}
      <div className="max-w-2xl mx-auto space-y-4">
        {errorQuestions.map((item, index) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 text-red-600 font-bold size-10 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                <div>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
              </div>
              <button
                onClick={() => handleRetry(item.id)}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform"
              >
                <RefreshCw className="size-4" />
                重新作答
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">{item.question}</h3>
              
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">你的答案</span>
                  <span className="text-sm font-bold text-red-600">{item.yourAnswer}</span>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">正确答案</span>
                  <span className="text-sm font-bold text-green-600">{item.correctAnswer}</span>
                </div>
              </div>
            </div>

            {/* 知识点提示 */}
            <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div className="flex-1">
                <p className="text-xs text-gray-600">
                  <span className="font-bold text-blue-700">知识点：</span>
                  {index === 0 && '两位数加法进位计算'}
                  {index === 1 && '应用题中的找零计算'}
                  {index === 2 && '乘法口诀表'}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* 空状态提示 */}
        {errorQuestions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">太棒了！</h3>
            <p className="text-gray-600">目前没有错题，继续保持哦~</p>
          </div>
        )}
      </div>

      {/* 宠物鼓励 */}
      <div className="max-w-2xl mx-auto mt-6">
        <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
          <div className="text-3xl">🐱</div>
          <p className="text-sm text-gray-600">
            错题是最好的老师！把每道错题都弄懂，你就会越来越厉害~
          </p>
        </div>
      </div>
    </div>
  );
}
