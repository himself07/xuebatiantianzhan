export type SkillType =
  | 'damage'
  | 'heal'
  | 'shield'
  | 'buff_attack'
  | 'buff_defense'
  | 'debuff_attack'
  | 'debuff_defense'
  | 'multi_attack'
  | 'counter'
  | 'pierce';

export interface CardSkill {
  name: string;
  type: SkillType;
  description: string;
  value: number;
  cooldown: number;
  emoji: string;
}

export interface Card {
  id: number;
  name: string;
  rarity: 'R' | 'SR' | 'S' | 'SSR';
  knowledge: string;
  color: string;
  attack: number;
  defense: number;
  skill: CardSkill;
  image: string;
  emoji: string;
}

export interface OwnedCard {
  cardId: number;
  stars: number;
  obtainedAt: number;
  level: number;
}

export const CARD_DATA: Card[] = [
  {
    id: 1,
    name: '班长',
    rarity: 'R',
    knowledge: '加法运算',
    color: 'from-blue-400 to-blue-600',
    attack: 50,
    defense: 40,
    skill: {
      name: '快速计算',
      type: 'damage',
      description: '对敌方造成120%攻击力的伤害',
      value: 120,
      cooldown: 2,
      emoji: '⚡',
    },
    image: '',
    emoji: '👨‍💼',
  },
  {
    id: 2,
    name: '学习委员',
    rarity: 'SR',
    knowledge: '乘法口诀',
    color: 'from-purple-400 to-purple-600',
    attack: 70,
    defense: 60,
    skill: {
      name: '口诀连击',
      type: 'multi_attack',
      description: '连续攻击3次，每次造成50%伤害',
      value: 50,
      cooldown: 3,
      emoji: '💥',
    },
    image: '',
    emoji: '👩‍🎓',
  },
  {
    id: 3,
    name: '体育委员',
    rarity: 'SR',
    knowledge: '图形认知',
    color: 'from-green-400 to-green-600',
    attack: 65,
    defense: 70,
    skill: {
      name: '空间护盾',
      type: 'shield',
      description: '为自己生成相当于防御力150%的护盾',
      value: 150,
      cooldown: 4,
      emoji: '🛡️',
    },
    image: '',
    emoji: '🏃',
  },
  {
    id: 4,
    name: '隔壁小王',
    rarity: 'S',
    knowledge: '综合计算',
    color: 'from-orange-400 to-red-600',
    attack: 95,
    defense: 85,
    skill: {
      name: '全能强化',
      type: 'buff_attack',
      description: '提升自身50%攻击力，持续3回合',
      value: 50,
      cooldown: 5,
      emoji: '🔥',
    },
    image: '',
    emoji: '😎',
  },
  {
    id: 5,
    name: '刁蛮公主',
    rarity: 'SR',
    knowledge: '应用题解析',
    color: 'from-pink-400 to-pink-600',
    attack: 75,
    defense: 65,
    skill: {
      name: '逻辑穿透',
      type: 'pierce',
      description: '无视对方50%防御进行攻击',
      value: 50,
      cooldown: 3,
      emoji: '🎯',
    },
    image: '',
    emoji: '👸',
  },
  {
    id: 6,
    name: '清洁工',
    rarity: 'R',
    knowledge: '减法运算',
    color: 'from-cyan-400 to-blue-600',
    attack: 45,
    defense: 50,
    skill: {
      name: '坚守阵地',
      type: 'buff_defense',
      description: '提升自身40%防御力，持续3回合',
      value: 40,
      cooldown: 3,
      emoji: '🏰',
    },
    image: '',
    emoji: '🧹',
  },
  {
    id: 7,
    name: '劳动委员',
    rarity: 'R',
    knowledge: '除法运算',
    color: 'from-yellow-400 to-orange-600',
    attack: 55,
    defense: 45,
    skill: {
      name: '精准削弱',
      type: 'debuff_attack',
      description: '降低对方30%攻击力，持续2回合',
      value: 30,
      cooldown: 3,
      emoji: '⬇️',
    },
    image: '',
    emoji: '🧤',
  },
  {
    id: 8,
    name: '小画家',
    rarity: 'SR',
    knowledge: '分数运算',
    color: 'from-indigo-400 to-purple-600',
    attack: 80,
    defense: 70,
    skill: {
      name: '分数治疗',
      type: 'heal',
      description: '恢复自身最大生命值的30%',
      value: 30,
      cooldown: 4,
      emoji: '💚',
    },
    image: '',
    emoji: '🎨',
  },
  {
    id: 9,
    name: '课代表',
    rarity: 'SSR',
    knowledge: '奥数思维',
    color: 'from-yellow-400 via-orange-500 to-red-600',
    attack: 120,
    defense: 100,
    skill: {
      name: '天才一击',
      type: 'damage',
      description: '造成200%攻击力的毁灭性伤害',
      value: 200,
      cooldown: 5,
      emoji: '⚡',
    },
    image: '',
    emoji: '📚',
  },
  {
    id: 10,
    name: '广播员',
    rarity: 'SR',
    knowledge: '速算技巧',
    color: 'from-yellow-300 to-yellow-600',
    attack: 85,
    defense: 55,
    skill: {
      name: '闪电连击',
      type: 'multi_attack',
      description: '连续攻击5次，每次造成30%伤害',
      value: 30,
      cooldown: 4,
      emoji: '⚡',
    },
    image: '',
    emoji: '📻',
  },
  {
    id: 11,
    name: '小霸王',
    rarity: 'SR',
    knowledge: '逆向思维',
    color: 'from-red-400 to-red-700',
    attack: 72,
    defense: 78,
    skill: {
      name: '完美反击',
      type: 'counter',
      description: '反弹受到伤害的80%给对手',
      value: 80,
      cooldown: 3,
      emoji: '🔄',
    },
    image: '',
    emoji: '😈',
  },
  {
    id: 12,
    name: '嘟嘟嘴',
    rarity: 'S',
    knowledge: '全科精通',
    color: 'from-purple-500 via-pink-500 to-red-500',
    attack: 90,
    defense: 90,
    skill: {
      name: '智慧之光',
      type: 'heal',
      description: '恢复自身最大生命值的50%并解除负面状态',
      value: 50,
      cooldown: 5,
      emoji: '✨',
    },
    image: '',
    emoji: '😮',
  },
];

export const getStarDisplay = (stars: number): string => {
  return '⭐'.repeat(Math.min(stars, 7));
};

export const getCardStats = (card: Card, stars: number, level: number = 1) => {
  const starMultiplier = 1 + (stars - 1) * 0.15;
  const levelMultiplier = 1 + (level - 1) * 0.1;
  const totalMultiplier = starMultiplier * levelMultiplier;

  return {
    attack: Math.floor(card.attack * totalMultiplier),
    defense: Math.floor(card.defense * totalMultiplier),
  };
};

export const getUpgradeCost = (currentLevel: number, stars: number): number => {
  const baseCards = currentLevel;
  const starBonus = stars - 1;
  return baseCards + starBonus;
};

export const getRarityColor = (rarity: Card['rarity']): string => {
  switch (rarity) {
    case 'R':
      return 'text-blue-500';
    case 'SR':
      return 'text-purple-500';
    case 'S':
      return 'text-orange-500';
    case 'SSR':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

export const getRarityBorder = (rarity: Card['rarity']): string => {
  switch (rarity) {
    case 'R':
      return 'border-blue-400';
    case 'SR':
      return 'border-purple-400';
    case 'S':
      return 'border-orange-400';
    case 'SSR':
      return 'border-red-400 shadow-red-500/50';
    default:
      return 'border-gray-400';
  }
};