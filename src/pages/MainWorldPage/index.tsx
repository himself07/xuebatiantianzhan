import Taro, { useDidShow } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import { StorageManager } from '../../utils/storage';
import { safeNavigate } from '../../utils/navigation';
import { MASCOT } from '../../constants/theme';
import { getTodayBoss } from '../../data/dailyBoss';

interface NavItem {
  id: string;
  name: string;
  emoji: string;
  route: string;
  desc: string;
  bg: string;
}

const CORE_ACTIONS: NavItem[] = [
  {
    id: 'challenge',
    name: '今日Boss战',
    emoji: '👾',
    route: '/pages/DailyChallengePage/index',
    desc: '打Boss领奖励',
    bg: 'linear-gradient(135deg, #fb7185 0%, #f97316 100%)',
  },
  {
    id: 'quest',
    name: '任务中心',
    emoji: '📋',
    route: '/pages/QuestCenterPage/index',
    desc: '领奖励',
    bg: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)',
  },
  {
    id: 'card',
    name: '卡牌中心',
    emoji: '🎴',
    route: '/pages/CardCenterPage/index',
    desc: '抽卡养成',
    bg: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)',
  },
  {
    id: 'arena',
    name: '卡牌复仇',
    emoji: '⚔️',
    route: '/pages/ArenaPage/index',
    desc: '今日加成对战',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
];

const WORLD_BUILDINGS: NavItem[] = [
  {
    id: 'funquiz',
    name: 'Boss热身',
    emoji: '🔥',
    route: '/pages/FunQuizPage/index',
    desc: '开战前练练手',
    bg: 'linear-gradient(135deg, #f472b6 0%, #fb7185 100%)',
  },
  {
    id: 'classroom',
    name: '智慧教室',
    emoji: '📚',
    route: '/pages/ClassroomPage/index',
    desc: '班级领地',
    bg: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
  },
  {
    id: 'errorbook',
    name: '错题本',
    emoji: '📝',
    route: '/pages/ErrorBookPage/index',
    desc: '查漏补缺',
    bg: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
  },
  {
    id: 'pet',
    name: '宠物小屋',
    emoji: '🐱',
    route: '/pages/PetHousePage/index',
    desc: '互动伙伴',
    bg: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
  },
  {
    id: 'principal',
    name: '校长室',
    emoji: '👑',
    route: '/pages/PrincipalOfficePage/index',
    desc: '高手挑战',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #dc2626 100%)',
  },
];

export default function MainWorldPage() {
  const [progress, setProgress] = useState(StorageManager.getProgress());
  const [showMoreWorld, setShowMoreWorld] = useState(false);
  const todayBoss = getTodayBoss();

  const refreshProgress = () => {
    StorageManager.checkAndResetDaily();
    setProgress(StorageManager.getProgress());
  };

  useEffect(() => {
    refreshProgress();
  }, []);

  useDidShow(() => {
    refreshProgress();
  });

  const buttonStyles = {
    primary: {
      borderRadius: '12px',
      padding: '10px 14px',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      boxShadow: '0 6px 12px rgba(79,70,229,0.24)',
    },
    secondary: {
      borderRadius: '12px',
      padding: '10px 14px',
      background: '#eef2ff',
      border: '1px solid #c7d2fe',
    },
    ghost: {
      borderRadius: '999px',
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.14)',
    },
  };

  const handleCloseApp = () => {
    Taro.showModal({
      title: '确认关闭',
      content: '确认关闭当前小程序吗？',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        Taro.exitMiniProgram({
          fail: () => Taro.showToast({ title: '当前环境不支持关闭', icon: 'none' }),
        });
      },
    });
  };

  const goTo = (route: string) => {
    safeNavigate(route);
  };

  return (
    <View
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #dbeafe 0%, #ede9fe 45%, #fae8ff 100%)',
        padding: '16px',
      }}
    >
      <View style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto', paddingTop: '36px' }}>
        <View
          style={{
            background: '#ffffff',
            borderRadius: '22px',
            padding: '16px',
            boxShadow: '0 8px 22px rgba(79,70,229,0.12)',
            marginBottom: '14px',
          }}
        >
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#1e1b4b', fontSize: '24px', fontWeight: 'bold' }}>
                {MASCOT.emoji} 校园冒险世界
              </Text>
              <Text style={{ color: '#6366f1', fontSize: '13px' }}>
                今日通缉：{todayBoss.dailyNickname} · {todayBoss.motherTopicSummary}
              </Text>
            </View>
            <View
              onClick={handleCloseApp}
              style={buttonStyles.ghost}
            >
              <Text style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>关闭</Text>
            </View>
          </View>

          <View style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <View style={{ flex: 1, background: '#fef3c7', borderRadius: '14px', padding: '10px 12px' }}>
              <Text style={{ color: '#92400e', fontSize: '12px' }}>金币</Text>
              <Text style={{ color: '#78350f', fontSize: '18px', fontWeight: 'bold' }}>{progress.coins} 🪙</Text>
            </View>
            <View style={{ flex: 1, background: '#dcfce7', borderRadius: '14px', padding: '10px 12px' }}>
              <Text style={{ color: '#166534', fontSize: '12px' }}>体力</Text>
              <Text style={{ color: '#166534', fontSize: '18px', fontWeight: 'bold' }}>
                {progress.energy}/{progress.maxEnergy} ⚡
              </Text>
            </View>
          </View>
        </View>

        <View style={{ marginBottom: '14px' }}>
          <Text style={{ color: '#3730a3', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
            快捷入口
          </Text>
          <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {CORE_ACTIONS.map((item) => (
              <View
                key={item.id}
                onClick={() => goTo(item.route)}
                style={{
                  borderRadius: '16px',
                  padding: '14px',
                  background: item.bg,
                  boxShadow: '0 6px 16px rgba(15,23,42,0.18)',
                  border: item.id === 'challenge' ? '2px solid rgba(255,255,255,0.6)' : 'none',
                }}
              >
                <Text style={{ fontSize: '28px' }}>{item.emoji}</Text>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px', display: 'block' }}>
                  {item.name}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: '12px', display: 'block' }}>
                  {item.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            background: 'rgba(255,255,255,0.74)',
            borderRadius: '18px',
            padding: '12px',
            marginBottom: '14px',
          }}
        >
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showMoreWorld ? '8px' : '0' }}>
            <Text style={{ color: '#4338ca', fontSize: '13px', fontWeight: 'bold', display: 'block' }}>
              更多学习功能
            </Text>
            <View
              onClick={() => setShowMoreWorld((prev) => !prev)}
              style={showMoreWorld ? buttonStyles.secondary : buttonStyles.primary}
            >
              <Text style={{ color: showMoreWorld ? '#4338ca' : '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                {showMoreWorld ? '收起' : '展开'}
              </Text>
            </View>
          </View>
          {showMoreWorld && (
            <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {WORLD_BUILDINGS.map((item) => (
                <View
                  key={item.id}
                  onClick={() => goTo(item.route)}
                  style={{
                    borderRadius: '14px',
                    padding: '10px',
                    background: '#fff',
                    border: '1px solid #e0e7ff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Text style={{ fontSize: '22px' }}>{item.emoji}</Text>
                  <View>
                    <Text style={{ color: '#1f2937', fontSize: '13px', fontWeight: 'bold', display: 'block' }}>
                      {item.name}
                    </Text>
                    <Text style={{ color: '#6b7280', fontSize: '11px', display: 'block' }}>
                      {item.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ background: '#fff', borderRadius: '16px', padding: '12px', marginBottom: '90px' }}>
          <Text style={{ color: '#1e293b', fontSize: '13px', fontWeight: 'bold' }}>
            今日目标：答题 {progress.todayAnswerCount || 0}/20，正确率 {progress.todayCorrectRate || 0}%
          </Text>
        </View>
      </View>
    </View>
  );
}
