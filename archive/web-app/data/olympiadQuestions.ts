// 三年级奥数题目库

export interface OlympiadQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  hint: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

// 黄老师（简单）- 适合三年级基础奥数
export const teacherHuangQuestions: OlympiadQuestion[] = [
  {
    id: 1,
    question: '小明买了3支铅笔，每支5元，付了20元，应找回多少元？',
    options: ['3元', '5元', '10元', '15元'],
    correctAnswer: 1,
    hint: '先算3支铅笔一共多少钱：3×5=15元，再用20元减去15元',
    difficulty: 'easy',
    category: '应用题',
  },
  {
    id: 2,
    question: '找规律填数：2、4、6、8、（ ）、12',
    options: ['9', '10', '11', '14'],
    correctAnswer: 1,
    hint: '这是偶数数列，每次增加2',
    difficulty: 'easy',
    category: '找规律',
  },
  {
    id: 3,
    question: '一个长方形长8厘米，宽5厘米，它的周长是多少厘米？',
    options: ['13厘米', '18厘米', '26厘米', '40厘米'],
    correctAnswer: 2,
    hint: '长方形周长 = (长 + 宽) × 2 = (8 + 5) × 2',
    difficulty: 'easy',
    category: '几何',
  },
  {
    id: 4,
    question: '小红有24颗糖果，平均分给6个小朋友，每人分得几颗？',
    options: ['3颗', '4颗', '5颗', '6颗'],
    correctAnswer: 1,
    hint: '24 ÷ 6 = 4',
    difficulty: 'easy',
    category: '除法应用',
  },
  {
    id: 5,
    question: '比80多25的数是多少？',
    options: ['55', '95', '105', '115'],
    correctAnswer: 2,
    hint: '80 + 25 = 105',
    difficulty: 'easy',
    category: '加法应用',
  },
];

// 教导主任（中等）- 需要思考的奥数题
export const directorQuestions: OlympiadQuestion[] = [
  {
    id: 11,
    question: '一个数加上8，乘以8，减去8，除以8，结果还是8，这个数是多少？',
    options: ['1', '8', '9', '16'],
    correctAnswer: 2,
    hint: '倒推：8×8=64，64+8=72，72÷8=9，9-8=1',
    difficulty: 'medium',
    category: '逆推问题',
  },
  {
    id: 12,
    question: '有一堆苹果，2个2个数余1个，3个3个数余1个，5个5个数余1个，这堆苹果最少有多少个？',
    options: ['15个', '21个', '30个', '31个'],
    correctAnswer: 3,
    hint: '找2、3、5的最小公倍数是30，再加1',
    difficulty: 'medium',
    category: '数论',
  },
  {
    id: 13,
    question: '小明从家到学校，去时每分钟走60米，回来时每分钟走40米，往返共用30分钟，家到学校有多远？',
    options: ['600米', '720米', '800米', '900米'],
    correctAnswer: 1,
    hint: '设距离为x米，x÷60 + x÷40 = 30，解得x = 720米',
    difficulty: 'medium',
    category: '行程问题',
  },
  {
    id: 14,
    question: '用1、2、3三个数字组成的两位数中，能被3整除的有几个？',
    options: ['2个', '3个', '4个', '6个'],
    correctAnswer: 1,
    hint: '两位数有12、13、21、23、31、32，能被3整除的要各位数字之和能被3整除：12(1+2=3)、21(2+1=3)、33不能组成，所以是2个',
    difficulty: 'medium',
    category: '数的整除',
  },
  {
    id: 15,
    question: '一个正方形的周长是24厘米，如果把它的边长增加3厘米，新正方形的面积是多少平方厘米？',
    options: ['36', '49', '64', '81'],
    correctAnswer: 3,
    hint: '原边长=24÷4=6厘米，新边长=6+3=9厘米，面积=9×9=81',
    difficulty: 'medium',
    category: '几何变换',
  },
];

// 校长（困难）- 高难度奥数题
export const principalQuestions: OlympiadQuestion[] = [
  {
    id: 21,
    question: '有红、黄、蓝三种颜色的球各10个，混放在一起。至少要摸出多少个球，才能保证有4个球的颜色相同？',
    options: ['10个', '11个', '12个', '13个'],
    correctAnswer: 0,
    hint: '最坏情况：每种颜色都摸3个共9个，再摸1个必有4个同色，所以是10个',
    difficulty: 'hard',
    category: '抽屉原理',
  },
  {
    id: 22,
    question: '甲、乙两数的和是187，甲数除以乙数商11余7，甲数是多少？',
    options: ['152', '157', '162', '172'],
    correctAnswer: 2,
    hint: '设乙数为x，则甲数=11x+7，11x+7+x=187，12x=180，x=15，甲=11×15+7=172',
    difficulty: 'hard',
    category: '方程思想',
  },
  {
    id: 23,
    question: '有一个两位数，在它的某一位数字前面加上一个小数点，再与这个两位数相加，得数是20.3，原来的两位数是多少？',
    options: ['15', '18', '20', '25'],
    correctAnswer: 1,
    hint: '设两位数为AB，若在A前加小数点：0.AB + AB = 1.AB × 10.1 = 20.3，若在B前：A.B + AB = 20.3，推出AB=18',
    difficulty: 'hard',
    category: '小数应用',
  },
  {
    id: 24,
    question: '用绳子测井深，把绳子三折来量，井外余6米；把绳子四折来量，井外余4米。井深多少米？',
    options: ['12米', '14米', '16米', '18米'],
    correctAnswer: 2,
    hint: '设井深x米，绳长三折：3x+6，四折：4x+4，所以3(3x+6)=4(4x+4)，解得x=16',
    difficulty: 'hard',
    category: '方程应用',
  },
  {
    id: 25,
    question: '一个长方形，如果宽增加2厘米，面积就增加24平方厘米；如果长增加3厘米，面积就增加36平方厘米。原长方形面积是多少平方厘米？',
    options: ['96', '120', '144', '168'],
    correctAnswer: 0,
    hint: '宽增加2厘米，面积增加24，说明长=24÷2=12厘米；长增加3厘米，面积增加36，说明宽=36÷3=12厘米；面积=12×12=144',
    difficulty: 'hard',
    category: '几何推理',
  },
];

// 获取随机题目
export const getRandomQuestions = (
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5
): OlympiadQuestion[] => {
  let pool: OlympiadQuestion[] = [];
  switch (difficulty) {
    case 'easy':
      pool = teacherHuangQuestions;
      break;
    case 'medium':
      pool = directorQuestions;
      break;
    case 'hard':
      pool = principalQuestions;
      break;
  }

  // 随机打乱并取前count个
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
