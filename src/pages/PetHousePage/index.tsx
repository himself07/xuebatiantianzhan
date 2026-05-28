import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import { MASCOT } from '../../constants/theme';
import { MASCOT_PORTRAIT_SRC } from '../../utils/bossAssets';

/**
 * 战宝陪伴页（原宠物小屋），口粮来自每日 Boss 战等答题奖励。
 */
export default function PetHousePage() {
  const [petName] = useState(MASCOT.name);
  const [petLevel] = useState(5);
  const [petHunger, setPetHunger] = useState(70);
  const [petIntimacy, setPetIntimacy] = useState(85);
  const [petFood, setPetFood] = useState(0);
  const [petMood, setPetMood] = useState<'happy' | 'hungry' | 'excited'>('happy');
  const handleBack = () => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack();
      return;
    }
    Taro.switchTab({ url: '/pages/MainWorldPage/index' });
  };

  useEffect(() => {
    const progress = Taro.getStorageSync('learningProgress') || {};
    setPetFood(progress.petFood || 0);

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

      const progress = Taro.getStorageSync('learningProgress') || {};
      progress.petFood = (progress.petFood || 0) - 5;
      Taro.setStorageSync('learningProgress', progress);

      setPetFood(petFood - 5);
      setPetMood('excited');
    } else {
      Taro.showModal({
        title: '口粮不足',
        content: '去答题获取更多口粮吧~',
        showCancel: false
      });
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
    <View style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fce7f3 0%, #f3e8ff 0%, #dbeafe 100%)', padding: '16px' }}>
      {/* 顶部导航 */}
      <View style={{ maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View
            onClick={handleBack}
            style={{ background: '#fff', padding: '12px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <Text style={{ color: '#374151' }}>←</Text>
          </View>
          <View style={{ background: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ color: '#ec4899' }}>❤️</Text>
            <Text style={{ fontWeight: 'bold', color: '#374151' }}>战宝小屋</Text>
          </View>
          <View style={{ background: '#fff', paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Text style={{ fontSize: '24px' }}>🍖</Text>
            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>{petFood}</Text>
          </View>
        </View>
      </View>

      {/* 宠物展示区 */}
      <View style={{ maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto' }}>
        <View style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
          {/* 装饰背景 */}
          <View style={{ position: 'absolute', top: 0, right: 0, width: '160px', height: '160px', background: 'linear-gradient(135deg, #fbcfe8 0%, #e9d5ff 100%)', borderRadius: '50%', filter: 'blur(60px)', opacity: 0.5 }}></View>
          
          <View style={{ position: 'relative' }}>
            {/* 宠物信息 */}
            <View style={{ textAlign: 'center', marginBottom: '24px' }}>
              <View style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, #ec4899 0%, #a855f7 100%)', color: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', marginBottom: '16px' }}>
                <Text style={{ fontSize: '14px', fontWeight: 'bold' }}>⭐ Lv.{petLevel} {getStageText()}</Text>
              </View>
              <Text style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>{petName}</Text>
              <Text style={{ fontSize: '14px', color: '#6b7280' }}>每日 Boss 战学习伙伴</Text>
            </View>

            {/* 宠物形象 */}
            <View style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <View style={{ position: 'relative' }}>
                <View>
                  <Image
                    src={MASCOT_PORTRAIT_SRC}
                    style={{ width: '192px', height: '192px', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', background: 'linear-gradient(135deg, #fbbf24, #f97316)' }}
                    mode="aspectFill"
                  />
                </View>
                {/* 状态指示器 */}
                <View style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  <Text style={{ fontSize: '24px' }}>{getPetEmoji()}</Text>
                </View>
              </View>
            </View>

            {/* 属性值 */}
            <View style={{ gap: '16px', marginBottom: '24px' }}>
              {/* 饱食度 */}
              <View>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '14px', fontWeight: 'medium', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    🍖 饱食度
                  </Text>
                  <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#ea580c' }}>{petHunger}/100</Text>
                </View>
                <View style={{ background: '#e5e7eb', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
                  <View 
                    style={{ background: 'linear-gradient(90deg, #fb923c 0%, #ef4444 100%)', height: '100%', borderRadius: '9999px', width: `${petHunger}%` }}
                  ></View>
                </View>
              </View>

              {/* 亲密度 */}
              <View>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '14px', fontWeight: 'medium', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    💖 亲密度
                  </Text>
                  <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#db2777' }}>{petIntimacy}/100</Text>
                </View>
                <View style={{ background: '#e5e7eb', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
                  <View 
                    style={{ background: 'linear-gradient(90deg, #f472b6 0%, #a855f7 100%)', height: '100%', borderRadius: '9999px', width: `${petIntimacy}%` }}
                  ></View>
                </View>
              </View>

              {/* 经验值 */}
              <View>
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '14px', fontWeight: 'medium', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⭐ 经验值
                  </Text>
                  <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#2563eb' }}>320/500</Text>
                </View>
                <View style={{ background: '#e5e7eb', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
                  <View 
                    style={{ background: 'linear-gradient(90deg, #60a5fa 0%, #06b6d4 100%)', height: '100%', borderRadius: '9999px', width: '64%' }}
                  ></View>
                </View>
              </View>
            </View>

            {/* 喂养按钮 */}
            <View
              onClick={feedPet}
              style={{ width: '100%', background: 'linear-gradient(90deg, #ec4899 0%, #a855f7 100%)', color: '#fff', paddingTop: '16px', paddingBottom: '16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
            >
              喂养战宝（消耗 5 口粮）
            </View>
          </View>
        </View>

        {/* 宠物能力 */}
        <View style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📈 宠物能力
          </Text>
          <View style={{ gap: '12px' }}>
            <View style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Text style={{ fontSize: '24px' }}>📖</Text>
                <Text style={{ fontWeight: 'bold', color: '#1e293b' }}>读题助手</Text>
              </View>
              <Text style={{ fontSize: '14px', color: '#4b5563' }}>在学习场景中为你朗读题目，帮助理解</Text>
            </View>
            <View style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Text style={{ fontSize: '24px' }}>💡</Text>
                <Text style={{ fontWeight: 'bold', color: '#1e293b' }}>错题提示</Text>
              </View>
              <Text style={{ fontSize: '14px', color: '#4b5563' }}>答错时给予温馨提示和知识点讲解</Text>
            </View>
            <View style={{ background: '#faf5ff', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Text style={{ fontSize: '24px' }}>⚔️</Text>
                <Text style={{ fontWeight: 'bold', color: '#1e293b' }}>场外助战</Text>
              </View>
              <Text style={{ fontSize: '14px', color: '#4b5563' }}>在竞技场助你一臂之力，释放特殊技能</Text>
            </View>
          </View>
        </View>

        {/* 宠物对话 */}
        <View style={{ background: 'linear-gradient(90deg, #ec4899 0%, #a855f7 100%)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', color: '#fff' }}>
          <View style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Text style={{ fontSize: '30px' }}>{MASCOT.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '14px', marginBottom: '8px' }}>{getPetMessage()}</Text>
              <Text style={{ fontSize: '12px', opacity: 0.75 }}>💡 完成每日 Boss 战可获得口粮</Text>
            </View>
          </View>
        </View>

        {/* 提示 */}
        <View style={{ marginTop: '24px', background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '12px', padding: '16px' }}>
          <Text style={{ fontSize: '14px', color: '#92400e', textAlign: 'center' }}>
            💡 战宝等级越高，在 Boss 战与竞技场能给你更多鼓励
          </Text>
        </View>
      </View>
    </View>
  );
}