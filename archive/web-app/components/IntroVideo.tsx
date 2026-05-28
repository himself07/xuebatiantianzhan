import { useState, useEffect } from 'react';
import { Sparkles, Swords, Trophy, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface IntroVideoProps {
  onComplete: () => void;
}

export function IntroVideo({ onComplete }: IntroVideoProps) {
  const [step, setStep] = useState<'loading' | 'title' | 'cards' | 'battle' | 'ready'>('loading');
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // 允许在2秒后跳过
    const skipTimer = setTimeout(() => setCanSkip(true), 2000);

    // 动画序列
    const loadingTimer = setTimeout(() => setStep('title'), 1000);
    const titleTimer = setTimeout(() => setStep('cards'), 3000);
    const cardsTimer = setTimeout(() => setStep('battle'), 5000);
    const battleTimer = setTimeout(() => setStep('ready'), 7000);
    const endTimer = setTimeout(() => onComplete(), 9000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(loadingTimer);
      clearTimeout(titleTimer);
      clearTimeout(cardsTimer);
      clearTimeout(battleTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (canSkip) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 flex items-center justify-center overflow-hidden">
      {/* 背景动画 */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-50"
            initial={{ x: Math.random() * window.innerWidth, y: -20, opacity: 0 }}
            animate={{
              y: window.innerHeight + 20,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* 主内容 */}
      <div className="relative z-10 text-center px-4">
        {/* Loading 阶段 */}
        {step === 'loading' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-8xl mb-4">🎴</div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="size-12 text-white mx-auto" />
            </motion.div>
          </motion.div>
        )}

        {/* 标题阶段 */}
        {step === 'title' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-6xl font-bold text-white mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              学霸天天战
            </motion.h1>
            <motion.p
              className="text-2xl text-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              卡牌对战 · 学习闯关
            </motion.p>
          </motion.div>
        )}

        {/* 卡牌展示阶段 */}
        {step === 'cards' && (
          <div>
            <motion.h2
              className="text-4xl font-bold text-white mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              收集强大卡牌
            </motion.h2>
            <div className="flex justify-center gap-4">
              {['🎴', '⭐', '✨'].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="w-24 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-2xl flex items-center justify-center text-5xl"
                  initial={{ opacity: 0, x: -100, rotateY: 90 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: i * 0.3, duration: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 战斗阶段 */}
        {step === 'battle' && (
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Swords className="size-24 text-white mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">竞技场对战</h2>
              <div className="flex justify-center items-center gap-8">
                <motion.div
                  className="text-6xl"
                  animate={{ x: [0, 20, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ⚔️
                </motion.div>
                <motion.div
                  className="text-5xl"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  💥
                </motion.div>
                <motion.div
                  className="text-6xl"
                  animate={{ x: [0, -20, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🛡️
                </motion.div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 准备阶段 */}
        {step === 'ready' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Trophy className="size-24 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-5xl font-bold text-white mb-4">准备好了吗？</h2>
            <motion.button
              onClick={onComplete}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-2">
                <Play className="size-6" />
                开始冒险
              </div>
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* 跳过按钮 */}
      {canSkip && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleSkip}
          className="absolute top-8 right-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-2 rounded-full font-bold transition-all"
        >
          跳过
        </motion.button>
      )}
    </div>
  );
}
