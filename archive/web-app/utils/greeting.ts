import { useState, useEffect } from 'react';
import { playSound } from './audio';

export interface GreetingConfig {
  pageName: string;
  greetings: string[];
  mood?: 'happy' | 'excited' | 'idle';
}

export const pageGreetings: GreetingConfig[] = [
  {
    pageName: 'main-world',
    greetings: [
      '主人，欢迎回来！今天我们要学习什么呀？🌟',
      '你好呀！新的一天，新的挑战！💪',
      '哇，今天也想努力变强呢！🚀',
    ],
    mood: 'happy',
  },
  {
    pageName: 'daily-challenge',
    greetings: [
      '每日挑战来啦！我相信你一定能行的！🎯',
      '加油加油！今天的题目一定很棒！✨',
      '准备好了吗？让我们开始吧！🏃',
    ],
    mood: 'excited',
  },
  {
    pageName: 'fun-quiz',
    greetings: [
      '趣味问答时间到啦！轻松一下~ 🎮',
      '有趣的问题等着你呢！😄',
      '玩得开心学得轻松！🎉',
    ],
    mood: 'happy',
  },
  {
    pageName: 'classroom',
    greetings: [
      '课堂学习开始啦！认真听讲哦~ 📖',
      '知识的大门正在打开！🚪',
      '准备好吸收新知识了吗？💡',
    ],
    mood: 'idle',
  },
  {
    pageName: 'arena',
    greetings: [
      '竞技场开战！让我为你加油！⚔️',
      '展现真正实力的时候到了！🏆',
      '战斗吧！我会一直支持你的！💖',
    ],
    mood: 'excited',
  },
  {
    pageName: 'card-center',
    greetings: [
      '卡牌中心到啦！看看有什么新卡牌~ 🎴',
      '收集更多的卡牌吧！✨',
      '每张卡牌都有它的力量！🌈',
    ],
    mood: 'happy',
  },
  {
    pageName: 'card-warehouse',
    greetings: [
      '卡牌仓库到了！整理一下我们的珍藏吧~ 📦',
      '这里有好多卡牌呢！🔮',
    ],
    mood: 'idle',
  },
  {
    pageName: 'pet-house',
    greetings: [
      '欢迎回家！我好想你呀！🏠',
      '来看我啦！开心开心！🎊',
      '主人来啦！今天也要一起玩哦！💕',
    ],
    mood: 'excited',
  },
  {
    pageName: 'profile',
    greetings: [
      '个人信息页面~让我看看你的成就！🏅',
      '做得很棒呢！继续加油！🌟',
    ],
    mood: 'happy',
  },
  {
    pageName: 'error-book',
    greetings: [
      '错题本来啦！温故知新~ 📚',
      '让我们一起把错题学会吧！💪',
      '每次改进都是进步！✨',
    ],
    mood: 'idle',
  },
  {
    pageName: 'principal-office',
    greetings: [
      '校长室到了！尊敬的老师在等你~ 👨‍🎓',
      '有什么重要的事情呢？🏫',
    ],
    mood: 'idle',
  },
];

export function usePageGreeting(pageName: string): { greeting: string; mood: string } {
  const [greeting, setGreeting] = useState<string>('');
  const [mood, setMood] = useState<string>('idle');

  useEffect(() => {
    const config = pageGreetings.find((g) => g.pageName === pageName);
    if (config) {
      const randomGreeting = config.greetings[Math.floor(Math.random() * config.greetings.length)];
      setGreeting(randomGreeting);
      setMood(config.mood || 'idle');
      playSound('pageEnter');
    }
  }, [pageName]);

  return { greeting, mood };
}

export function usePetGreeting(type: 'greet' | 'feed' | 'click'): { message: string; emoji: string } {
  const [message, setMessage] = useState<string>('');
  const [emoji, setEmoji] = useState<string>('😊');

  useEffect(() => {
    if (type === 'greet') {
      const greetings = [
        '你好呀！',
        '主人好！',
        '见到你真开心！',
        '今天也想努力呢！',
      ];
      const randomMsg = greetings[Math.floor(Math.random() * greetings.length)];
      setMessage(randomMsg);
      setEmoji(Math.random() > 0.5 ? '🐱' : '😸');
      playSound('petHappy');
    } else if (type === 'feed') {
      const feedMessages = [
        '谢谢你！我好饱呀~',
        '好吃好吃！主人最好了！',
        '能量满满！可以战斗了！',
        '饱饱的，开心！',
      ];
      setMessage(feedMessages[Math.floor(Math.random() * feedMessages.length)]);
      setEmoji('😋');
      playSound('petHappy');
    } else if (type === 'click') {
      const clickMessages = [
        '摸摸我~',
        '还要摸摸！',
        '好舒服呀~',
        '嘿嘿~',
      ];
      setMessage(clickMessages[Math.floor(Math.random() * clickMessages.length)]);
      setEmoji('😊');
    }
  }, [type]);

  return { message, emoji };
}