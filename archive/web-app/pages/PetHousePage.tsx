import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Heart, Star, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { StorageManager } from '../utils/storage';
import { playSound } from '../utils/audio';

export function PetHousePage() {
  const navigate = useNavigate();
  const [petName] = useState('小智');
  const [petLevel] = useState(5);
  const [petHunger, setPetHunger] = useState(70);
  const [petIntimacy, setPetIntimacy] = useState(85);
  const [petFood, setPetFood] = useState(0);
  const [petMood, setPetMood] = useState<'happy' | 'hungry' | 'excited'>('happy');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [feedAnimation, setFeedAnimation] = useState(false);

  const welcomeMessages = [
    '主人来啦！开心开心！🎊',
    '欢迎回家！我好想你呀！🏠',
    '今天也想和我一起玩吗？💕',
  ];

  useEffect(() => {
    const msg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setWelcomeMessage(`${petName}: ${msg}`);
    setShowWelcome(true);
    playSound('petHappy');
    setTimeout(() => setShowWelcome(false), 4000);
  }, []);

  useEffect(() => {
    const progress = StorageManager.getProgress();
    setPetFood(progress.petFood);

    // 动态宠物情绪
    const interval = setInterval(() => {
      setPetMood((prev) => {
        if (petHunger < 50) return 'hungry';
        return prev === 'happy' ? 'excited' : 'happy';
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [petHunger]);

  const feedPet = () => {
    if (petFood >= 5) {
      const newHunger = Math.min(100, petHunger + 20);
      const newIntimacy = Math.min(100, petIntimacy + 5);

      setPetHunger(newHunger);
      setPetIntimacy(newIntimacy);

      StorageManager.updateProgress((progress) => ({
        petFood: progress.petFood - 5,
      }));

      setPetFood(petFood - 5);
      setPetMood('excited');
      setFeedAnimation(true);
      playSound('petHappy');
      setTimeout(() => setFeedAnimation(false), 1000);
    } else {
      playSound('error');
      alert('口粮不足！去答题获取更多口粮吧~');
    }
  };

  const getPetEmoji = () => {
    if (petHunger < 50) return '😢';
    if (petMood === 'excited') return '😍';
    return '😊';
  };

  const getPetMessage = () => {
    if (petHunger < 50) {
      return '主人，我有点饿了，记得喂我哦~ 🍖';
    }
    if (petIntimacy < 70) {
      return '多陪陪我，我们的关系会更好的！💕';
    }
    if (petMood === 'excited') {
      return '好开心呀！主人最棒了！一起加油学习吧！✨';
    }
    return '今天也要一起加油学习呀！我会一直陪着你的~ 💪';
  };

  const getStageText = () => {
    if (petLevel < 5) return '幼年期';
    if (petLevel < 10) return '成长期';
    return '成熟期';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50 p-4">
      {/* 顶部导航 */}
      <div className="max-w-md mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/')}
            className="bg-white p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="bg-white px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <Heart className="size-5 text-pink-500" />
            <span className="font-bold text-gray-700">宠物小屋</span>
          </div>
          <div className="bg-white px-3 py-2 rounded-full shadow-md flex items-center gap-1">
            <span className="text-2xl">🍖</span>
            <span className="text-sm font-bold text-gray-700">{petFood}</span>
          </div>
        </div>
      </div>

      {/* 宠物展示区 */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 relative overflow-hidden">
          {/* 装饰背景 */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative">
            {/* 宠物信息 */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full mb-4">
                <Star className="size-4" />
                <span className="text-sm font-bold">Lv.{petLevel} {getStageText()}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{petName}</h2>
              <p className="text-sm text-gray-500">你的学习小伙伴</p>
            </div>

            {/* 宠物形象 */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {/* 欢迎消息气泡 */}
                {showWelcome && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg px-4 py-2 max-w-64 relative">
                      <p className="text-sm text-white font-medium whitespace-nowrap">{welcomeMessage}</p>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-purple-500" />
                    </div>
                  </div>
                )}
                <div className={`transition-transform duration-500 ${feedAnimation ? 'scale-125' : ''} ${petMood === 'excited' ? 'animate-bounce' : 'animate-pulse'}`}>
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1765934879305-e2ee18822f9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2FydG9vbiUyMHBldCUyMGNhdHxlbnwxfHx8fDE3NzQzNTI2NzV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="宠物"
                    className={`w-48 h-48 rounded-full object-cover shadow-xl ${feedAnimation ? 'ring-4 ring-pink-400' : ''}`}
                  />
                </div>
                {/* 状态指示器 */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg">
                  <span className="text-2xl">{getPetEmoji()}</span>
                </div>
              </div>
            </div>

            {/* 属性值 */}
            <div className="space-y-4 mb-6">
              {/* 饱食度 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    🍖 饱食度
                  </span>
                  <span className="text-sm font-bold text-orange-600">{petHunger}/100</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-full rounded-full transition-all"
                    style={{ width: `${petHunger}%` }}
                  ></div>
                </div>
              </div>

              {/* 亲密度 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    💖 亲密度
                  </span>
                  <span className="text-sm font-bold text-pink-600">{petIntimacy}/100</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-pink-400 to-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${petIntimacy}%` }}
                  ></div>
                </div>
              </div>

              {/* 经验值 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    ⭐ 经验值
                  </span>
                  <span className="text-sm font-bold text-blue-600">320/500</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full rounded-full transition-all"
                    style={{ width: '64%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 喂养按钮 */}
            <button
              onClick={feedPet}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
            >
              喂养宠物（消耗 5 口粮）
            </button>
          </div>
        </div>

        {/* 宠物能力 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="size-5 text-purple-500" />
            宠物能力
          </h3>
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📖</span>
                <h4 className="font-bold text-gray-800">读题助手</h4>
              </div>
              <p className="text-sm text-gray-600">在学习场景中为你朗读题目，帮助理解</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💡</span>
                <h4 className="font-bold text-gray-800">错题提示</h4>
              </div>
              <p className="text-sm text-gray-600">答错时给予温馨提示和知识点讲解</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚔️</span>
                <h4 className="font-bold text-gray-800">场外助战</h4>
              </div>
              <p className="text-sm text-gray-600">在竞技场助你一臂之力，释放特殊技能</p>
            </div>
          </div>
        </div>

        {/* 宠物对话 */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-start gap-3">
            <div className={`text-3xl ${petMood === 'excited' ? 'animate-bounce' : ''}`}>🐱</div>
            <div className="flex-1">
              <p className="text-sm mb-2">{getPetMessage()}</p>
              <p className="text-xs opacity-75">💡 完成答题可以获得更多口粮</p>
            </div>
          </div>
        </div>

        {/* 提示 */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 text-center">
            💡 宠物等级越高，能力越强，在竞技场能发挥更大作用
          </p>
        </div>
      </div>
    </div>
  );
}
