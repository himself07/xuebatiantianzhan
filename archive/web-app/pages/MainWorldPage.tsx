import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, Zap, BookOpen } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { PageGreeting } from '../components/PageGreeting';
import { playSound } from '../utils/audio';

const mainWorldGreetings = [
  '主人，欢迎回来！今天我们要学习什么呀？🌟',
  '你好呀！新的一天，新的挑战！💪',
  '哇，今天也想努力变强呢！🚀',
];

export function MainWorldPage() {
  const navigate = useNavigate();
  const [energy, setEnergy] = useState(0);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const progress = StorageManager.getProgress();
    setEnergy(progress.energy);
    setCoins(progress.coins);
  }, []);

  const dungeons = [
    {
      id: 'classroom',
      name: '班级领地',
      description: '三年级2班的专属空间',
      emoji: '🏫',
      color: 'from-orange-500 to-red-500',
      path: '/classroom',
      difficulty: '简单',
      rewards: '金币、卡牌碎片',
      features: ['守护卡牌', '班级对抗'],
    },
    {
      id: 'arena',
      name: '学校竞技场',
      description: '跨班对抗，赢取荣誉',
      emoji: '⚔️',
      color: 'from-purple-500 to-pink-500',
      path: '/arena',
      difficulty: '中等',
      rewards: '金币、稀有卡牌',
      features: ['个人战', '小队战'],
    },
    {
      id: 'principal',
      name: '校长室',
      description: '挑战学校最强者',
      emoji: '👨‍🏫',
      color: 'from-yellow-500 via-orange-500 to-red-600',
      path: '/principal-office',
      difficulty: '困难',
      rewards: 'SSR卡牌、大量金币',
      features: ['黄老师', '教导主任', '校长'],
      isHard: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-300 to-green-300 relative overflow-hidden">
      <PageGreeting pageName="main-world" pageGreetings={mainWorldGreetings} />
      {/* 云朵装饰 */}
      <div className="absolute top-20 left-10 w-32 h-16 bg-white/70 rounded-full blur-sm"></div>
      <div className="absolute top-40 right-20 w-40 h-20 bg-white/60 rounded-full blur-sm"></div>
      <div className="absolute top-60 left-1/3 w-36 h-18 bg-white/50 rounded-full blur-sm"></div>

      {/* 顶部导航 */}
      <div className="relative z-10 p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-6 text-gray-700" />
          </button>

          <div className="flex gap-3">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Zap className="size-5 text-yellow-500" />
              <span className="font-bold text-gray-700">{energy}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Trophy className="size-5 text-yellow-600" />
              <span className="font-bold text-gray-700">{coins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-2xl">🏫 阳光小学</h1>
            <p className="text-white/90 text-sm">选择副本开始你的冒险</p>
          </div>

          {/* 快速状态栏 */}
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Zap className="size-5 text-yellow-500" />
              <span className="font-bold text-gray-700">{energy}</span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Trophy className="size-5 text-yellow-600" />
              <span className="font-bold text-gray-700">{coins}</span>
            </div>
          </div>

          {/* 副本卡片列表 */}
          <div className="space-y-4">
            {dungeons.map((dungeon) => (
              <div
                key={dungeon.id}
                onClick={() => { navigate(dungeon.path); playSound('click'); }}
                className={`bg-gradient-to-r ${dungeon.color} rounded-2xl shadow-xl p-5 cursor-pointer hover:scale-102 transition-all relative overflow-hidden group`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:w-40 group-hover:h-40 transition-all" />

                <div className="relative flex items-center gap-4">
                  <span className="text-5xl">{dungeon.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{dungeon.name}</h3>
                    <p className="text-white/80 text-sm mb-2">{dungeon.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="bg-white/30 px-2 py-1 rounded text-xs text-white">难度: {dungeon.difficulty}</span>
                      <span className="bg-white/30 px-2 py-1 rounded text-xs text-white">⚡ 5-10体力</span>
                    </div>
                  </div>
                  <div className="text-3xl text-white/70 group-hover:translate-x-2 transition-transform">→</div>
                </div>

                {dungeon.isHard && (
                  <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🔥 高难度
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 底部快捷入口 */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/fun-quiz')}
              className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
            >
              <BookOpen className="size-5" />
              答题补给
            </button>
            <button
              onClick={() => navigate('/card-center')}
              className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
            >
              抽卡中心
            </button>
          </div>
        </div>
      </div>

      {/* 装饰元素 */}
      <div className="fixed bottom-10 left-8 text-6xl opacity-40 pointer-events-none animate-bounce" style={{ animationDuration: '3s' }}>
        🌳
      </div>
      <div className="fixed bottom-20 right-10 text-5xl opacity-40 pointer-events-none animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
        🎈
      </div>
      <div className="fixed top-1/3 left-12 text-4xl opacity-30 pointer-events-none animate-pulse">
        🦋
      </div>
    </div>
  );
}
