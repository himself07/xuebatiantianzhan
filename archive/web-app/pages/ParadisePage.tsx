import { useNavigate } from 'react-router';
import { BookOpen, Trophy, FileText, Home, CreditCard, User, DoorOpen, Sparkles, Heart, Coins, Zap } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function ParadisePage() {
  const navigate = useNavigate();

  const learningProgress = JSON.parse(localStorage.getItem('learningProgress') || JSON.stringify({
    dailyChallengeCompleted: false,
    todayAnswerCount: 0,
    todayCorrectRate: 0,
    coins: 100,
    petFood: 10,
    energy: 100,
    continuousDays: 1,
  }));

  const canEnterMainWorld = learningProgress.dailyChallengeCompleted;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* 装饰背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* 顶部状态栏 */}
      <div className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-xl shadow-sm z-50 px-4 py-3 border-b border-white/50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1.5 rounded-full shadow-md">
              <Coins className="size-4 text-white" />
              <span className="text-sm font-bold text-white">{learningProgress.coins}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-400 to-rose-400 px-3 py-1.5 rounded-full shadow-md">
              <Heart className="size-4 text-white" />
              <span className="text-sm font-bold text-white">{learningProgress.petFood}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-400 to-emerald-400 px-3 py-1.5 rounded-full shadow-md">
              <Zap className="size-4 text-white" />
              <span className="text-sm font-bold text-white">{learningProgress.energy}</span>
            </div>
          </div>
          <div className="bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
            <span className="text-xs text-gray-600">连续 </span>
            <span className="text-sm font-bold text-orange-600">{learningProgress.continuousDays}</span>
            <span className="text-xs text-gray-600"> 天</span>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="relative pt-6 pb-8 px-4 max-w-md mx-auto">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
            🎓 学霸乐园
          </h1>
          <div className="inline-block bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
            <p className="text-sm text-gray-600">
              今日 <span className="font-bold text-blue-600">{learningProgress.todayAnswerCount}</span> 题 ·
              正确率 <span className="font-bold text-green-600">{Math.round(learningProgress.todayCorrectRate)}%</span>
            </p>
          </div>
        </div>

        {/* 宠物小屋卡片 */}
        <div
          onClick={() => navigate('/pet-house')}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl p-6 mb-8 cursor-pointer transition-all hover:scale-[1.02] border border-white/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
                <Home className="size-6 text-pink-500" />
                宠物小屋
              </h2>
              <p className="text-sm text-gray-500">陪你学习的小伙伴</p>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-lg opacity-50"></div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1765934879305-e2ee18822f9c?w=200"
                alt="宠物"
                className="relative w-20 h-20 rounded-full object-cover shadow-xl border-4 border-white"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 size-6 rounded-full border-3 border-white flex items-center justify-center shadow-md">
                <Sparkles className="size-3 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* 核心学习功能区 */}
        <div className="space-y-5 mb-8">
          <h3 className="text-lg font-bold text-gray-800 px-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-pink-500 rounded-full"></div>
            开始学习
          </h3>

          {/* 每日闯关 */}
          <div
            onClick={() => navigate('/daily-challenge')}
            className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-3xl shadow-xl hover:shadow-2xl p-6 cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="size-7" />
                  <h3 className="text-2xl font-bold">每日闯关</h3>
                </div>
                <p className="text-sm opacity-90 mb-1">3道奥数题挑战</p>
                <p className="text-xs opacity-80">🎁 50金币 + 10口粮 + 10体力</p>
              </div>
              {learningProgress.dailyChallengeCompleted ? (
                <div className="bg-white/30 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
                  ✓ 已完成
                </div>
              ) : (
                <div className="bg-white text-orange-500 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">
                  开始挑战
                </div>
              )}
            </div>
          </div>

          {/* 趣味答题 */}
          <div
            onClick={() => navigate('/fun-quiz')}
            className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-3xl shadow-xl hover:shadow-2xl p-6 cursor-pointer hover:scale-[1.02] transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="size-7" />
                  <h3 className="text-2xl font-bold">趣味答题</h3>
                </div>
                <p className="text-sm opacity-90">速算练习，随时可做</p>
              </div>
              <div className="bg-white text-purple-500 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-shadow">
                立即开始
              </div>
            </div>
          </div>

          {/* 错题本 */}
          <div
            onClick={() => navigate('/error-book')}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl p-5 cursor-pointer hover:scale-[1.02] transition-all border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-400 to-orange-400 p-3 rounded-2xl shadow-md">
                  <FileText className="size-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">错题本</h3>
                  <p className="text-sm text-gray-500">巩固薄弱知识点</p>
                </div>
              </div>
              <div className="text-2xl text-gray-300">→</div>
            </div>
          </div>
        </div>

        {/* 养成与社交功能区 */}
        <div className="space-y-5 mb-8">
          <h3 className="text-lg font-bold text-gray-800 px-1 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
            养成与社交
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* 抽卡中心 */}
            <div
              onClick={() => navigate('/card-center')}
              className="bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl shadow-lg hover:shadow-xl p-5 cursor-pointer hover:scale-[1.05] transition-all"
            >
              <div className="text-white text-center">
                <CreditCard className="size-10 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">抽卡中心</h3>
                <p className="text-xs opacity-90">收集学霸卡牌</p>
              </div>
            </div>

            {/* 个人主页 */}
            <div
              onClick={() => navigate('/profile')}
              className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl p-5 cursor-pointer hover:scale-[1.05] transition-all border border-white/50"
            >
              <div className="text-gray-800 text-center">
                <User className="size-10 mx-auto mb-3 text-gray-600" />
                <h3 className="font-bold text-lg mb-1">个人主页</h3>
                <p className="text-xs text-gray-500">查看学习成果</p>
              </div>
            </div>
          </div>
        </div>

        {/* 主世界入口 */}
        <div className="mt-8">
          <div
            onClick={() => canEnterMainWorld && navigate('/main-world')}
            className={`bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 rounded-3xl shadow-2xl p-7 cursor-pointer transition-all relative overflow-hidden group ${
              canEnterMainWorld ? 'hover:scale-[1.02] opacity-100' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {canEnterMainWorld && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            )}
            <div className="absolute top-0 left-0 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <DoorOpen className="size-8" />
                  <h3 className="text-2xl font-bold">校园主世界</h3>
                </div>
                {canEnterMainWorld ? (
                  <p className="text-sm opacity-90">探索阳光小学，挑战副本！</p>
                ) : (
                  <p className="text-sm opacity-90">完成每日闯关后解锁</p>
                )}
              </div>
              <div className="text-5xl">🏫</div>
            </div>
          </div>

          {!canEnterMainWorld && (
            <div className="text-center mt-4 bg-yellow-100/80 backdrop-blur-sm px-4 py-2 rounded-full mx-auto inline-block">
              <p className="text-sm text-yellow-800">
                💡 完成今日闯关即可进入校园主世界
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 装饰元素 */}
      <div className="fixed bottom-10 left-8 text-6xl opacity-10 pointer-events-none animate-bounce" style={{ animationDuration: '3s' }}>
        📚
      </div>
      <div className="fixed top-28 right-10 text-5xl opacity-10 pointer-events-none animate-pulse">
        ⭐
      </div>
      <div className="fixed bottom-28 right-10 text-4xl opacity-10 pointer-events-none animate-bounce" style={{ animationDuration: '4s' }}>
        🎯
      </div>
    </div>
  );
}
