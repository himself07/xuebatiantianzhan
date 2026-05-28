import { useState, useEffect } from 'react';
import { Coins, Lightbulb } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { playSound } from '../utils/audio';

interface FloatingPetProps {
  coins: number;
  onUseHint: () => void;
  hint?: string;
  disabled?: boolean;
  mood?: 'idle' | 'thinking' | 'happy' | 'cheering';
  petName?: string;
}

const cheerMessages = [
  '💪 加油！你一定可以的！',
  '✨ 相信自己，你很棒！',
  '🌟 继续努力，胜利在望！',
  '🎯 专注思考，你能行！',
  '💖 你是最棒的！',
  '🚀 冲刺吧，小主人！',
];

const greetMessages = [
  '你好呀！',
  '主人好！',
  '见到你真开心！',
  '今天也想努力呢！',
];

export function FloatingPet({ coins, onUseHint, hint, disabled = false, mood = 'idle', petName = '小智' }: FloatingPetProps) {
  const [showHintDialog, setShowHintDialog] = useState(false);
  const [cheerMessage, setCheerMessage] = useState(cheerMessages[0]);
  const [showCheer, setShowCheer] = useState(false);
  const [greetMessage, setGreetMessage] = useState('');
  const [showGreet, setShowGreet] = useState(false);

  // 首次加载显示欢迎语
  useEffect(() => {
    const hasGreeted = sessionStorage.getItem('petGreeted');
    if (!hasGreeted && !disabled) {
      setTimeout(() => {
        const greet = greetMessages[Math.floor(Math.random() * greetMessages.length)];
        setGreetMessage(`${petName}: ${greet}`);
        setShowGreet(true);
        playSound('petHappy');
        setTimeout(() => setShowGreet(false), 3000);
        sessionStorage.setItem('petGreeted', 'true');
      }, 1000);
    }
  }, [disabled, petName]);

  // 定期显示鼓励语
  useEffect(() => {
    const cheerInterval = setInterval(() => {
      setCheerMessage(cheerMessages[Math.floor(Math.random() * cheerMessages.length)]);
      setShowCheer(true);
      setTimeout(() => setShowCheer(false), 3000);
    }, 8000);

    return () => clearInterval(cheerInterval);
  }, []);

  const handlePetClick = () => {
    if (disabled) return;
    const clickMessages = [
      '摸摸我~',
      '还要摸摸！',
      '好舒服呀~',
      '嘿嘿~',
    ];
    setGreetMessage(`${petName}: ${clickMessages[Math.floor(Math.random() * clickMessages.length)]}`);
    setShowGreet(true);
    setTimeout(() => setShowGreet(false), 2000);
    setShowHintDialog(true);
  };

  const handleConfirmHint = () => {
    if (coins < 10) {
      alert('金币不足！需要10金币才能获得提示');
      return;
    }
    onUseHint();
    setShowHintDialog(false);
  };

  const getPetAnimation = () => {
    switch (mood) {
      case 'thinking':
        return 'animate-bounce';
      case 'happy':
        return 'animate-pulse';
      case 'cheering':
        return 'animate-bounce';
      default:
        return '';
    }
  };

  return (
    <>
      {/* 悬浮宠物 */}
      <div className="fixed bottom-24 right-6 z-40">
        {/* 欢迎气泡 */}
        {showGreet && (
          <div className="absolute bottom-full right-0 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg px-4 py-2 max-w-48 relative">
              <p className="text-sm text-white font-medium">{greetMessage}</p>
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-purple-500" />
            </div>
          </div>
        )}
        {/* 鼓励气泡 */}
        {showCheer && (
          <div className="absolute bottom-full right-0 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white rounded-2xl shadow-lg px-4 py-2 max-w-48 relative">
              <p className="text-sm text-gray-700 font-medium">{cheerMessage}</p>
              <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white" />
            </div>
          </div>
        )}

        {/* 宠物图标 */}
        <button
          onClick={handlePetClick}
          disabled={disabled}
          className={`relative group ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'} transition-transform ${getPetAnimation()}`}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative bg-white rounded-full p-2 shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1765934879305-e2ee18822f9c?w=200"
                alt="宠物助手"
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
          </div>

          {/* 提示图标 */}
          {!disabled && (
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full p-2 shadow-lg animate-pulse">
              <Lightbulb className="size-4 text-white" />
            </div>
          )}
        </button>
      </div>

      {/* 提示弹窗 */}
      {showHintDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">🐱</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">需要帮助吗？</h3>
              <p className="text-sm text-gray-600 mb-4">
                小主人，我可以给你一个提示哦~
              </p>
              <p className="text-xs text-gray-500 mb-4">
                需要消耗 <span className="font-bold text-orange-600">10金币</span>
              </p>
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-4 mb-4">
                <div className="flex items-center justify-center gap-2 text-gray-800">
                  <Coins className="size-6 text-yellow-600" />
                  <span className="text-xl font-bold">当前金币：{coins}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHintDialog(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                再想想
              </button>
              <button
                onClick={handleConfirmHint}
                disabled={coins < 10}
                className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                  coins >= 10
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Lightbulb className="size-5" />
                  <span>获得提示</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提示显示 */}
      {hint && (
        <div className="fixed bottom-48 right-6 z-40 max-w-xs animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl p-4 text-white">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="size-5 flex-shrink-0 mt-0.5" />
              <p className="font-bold">宠物提示</p>
            </div>
            <p className="text-sm leading-relaxed">{hint}</p>
          </div>
        </div>
      )}
    </>
  );
}
