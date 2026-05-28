import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import { StorageManager } from '../../utils/storage';
import { View, Text } from '@tarojs/components';

export default function ProfilePage() {
  const [progress, setProgress] = useState(StorageManager.getProgress());
  const goHome = () => Taro.switchTab({ url: '/pages/MainWorldPage/index' });

  useDidShow(() => {
    setProgress(StorageManager.getProgress());
  });

  return (
    <View style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #eff6ff 0%, #f3e8ff 100%)', padding: '16px' }}>
      {/* 顶部导航 */}
      <View style={{ maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View
            onClick={goHome}
            style={{ background: '#fff', padding: '10px 14px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <Text style={{ color: '#374151', fontSize: '13px', fontWeight: 'bold' }}>回首页</Text>
          </View>
          <View style={{ background: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ color: '#3b82f6' }}>👤</Text>
            <Text style={{ fontWeight: 'bold', color: '#374151' }}>个人主页</Text>
          </View>
          <View style={{ width: '44px' }}></View>
        </View>
      </View>

      <View style={{ maxWidth: '448px', marginLeft: 'auto', marginRight: 'auto' }}>
        {/* 个人信息卡片 */}
        <View style={{ background: '#fff', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <View style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #60a5fa 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '30px', fontWeight: 'bold' }}>
              小明
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>小明同学</Text>
              <Text style={{ fontSize: '14px', color: '#6b7280' }}>三年级2班 · 学号08</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <View style={{ background: '#ffedd5', color: '#ea580c', paddingLeft: '12px', paddingRight: '12px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>
                  Lv.12
                </View>
                <View style={{ background: '#dcfce7', color: '#16a34a', paddingLeft: '12px', paddingRight: '12px', paddingTop: '4px', paddingBottom: '4px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>
                  连续{progress.signInInfo?.continuousDays || 1}天
                </View>
              </View>
            </View>
          </View>

          {/* 学习统计 */}
          <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <View style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{progress.todayAnswerCount || 0}</Text>
              <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>今日答题</Text>
            </View>
            <View style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{progress.todayCorrectRate || 0}%</Text>
              <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>正确率</Text>
            </View>
            <View style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>368</Text>
              <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>总答题数</Text>
            </View>
          </View>
        </View>

        {/* 学习成就 */}
        <View style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏆 学习成就
          </Text>
          <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <View style={{ background: '#fef3c7', borderRadius: '12px', padding: '16px', border: '1px solid #fde68a' }}>
              <Text style={{ fontSize: '30px', marginBottom: '8px' }}>🏆</Text>
              <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>连续学习7天</Text>
              <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>已解锁</Text>
            </View>
            <View style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', border: '1px solid #bfdbfe' }}>
              <Text style={{ fontSize: '30px', marginBottom: '8px' }}>📚</Text>
              <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>答题小能手</Text>
              <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>已解锁</Text>
            </View>
            <View style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', border: '1px solid #bbf7d0' }}>
              <Text style={{ fontSize: '30px', marginBottom: '8px' }}>✨</Text>
              <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>正确率达人</Text>
              <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>已解锁</Text>
            </View>
            <View style={{ background: '#f3f4f6', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb', opacity: 0.5 }}>
              <Text style={{ fontSize: '30px', marginBottom: '8px' }}>👑</Text>
              <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>学霸之王</Text>
              <Text style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>未解锁</Text>
            </View>
          </View>
        </View>

        {/* 本周学习数据 */}
        <View style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📈 本周学习趋势
          </Text>
          <View style={{ gap: '12px' }}>
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
              const count = [15, 23, 18, 25, 20, 12, progress.todayAnswerCount || 0][index];
              const percentage = (count / 30) * 100;
              return (
                <View key={day}>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text style={{ fontSize: '14px', color: '#4b5563' }}>{day}</Text>
                    <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#7c3aed' }}>{count}题</Text>
                  </View>
                  <View style={{ background: '#e5e7eb', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
                    <View 
                      style={{ background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)', height: '100%', borderRadius: '9999px', width: `${Math.min(percentage, 100)}%` }}
                    ></View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 知识点掌握情况 */}
        <View style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}>
          <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📖 知识点掌握
          </Text>
          <View style={{ gap: '12px' }}>
            <View>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ fontSize: '14px', color: '#374151' }}>加减法运算</Text>
                <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>95%</Text>
              </View>
              <View style={{ background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                <View style={{ background: '#22c55e', height: '100%', borderRadius: '9999px', width: '95%' }}></View>
              </View>
            </View>
            <View>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ fontSize: '14px', color: '#374151' }}>乘法口诀</Text>
                <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#2563eb' }}>88%</Text>
              </View>
              <View style={{ background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                <View style={{ background: '#3b82f6', height: '100%', borderRadius: '9999px', width: '88%' }}></View>
              </View>
            </View>
            <View>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ fontSize: '14px', color: '#374151' }}>应用题解析</Text>
                <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#ea580c' }}>72%</Text>
              </View>
              <View style={{ background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                <View style={{ background: '#f97316', height: '100%', borderRadius: '9999px', width: '72%' }}></View>
              </View>
            </View>
            <View>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ fontSize: '14px', color: '#374151' }}>几何图形</Text>
                <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#7c3aed' }}>80%</Text>
              </View>
              <View style={{ background: '#e5e7eb', borderRadius: '9999px', height: '8px' }}>
                <View style={{ background: '#a855f7', height: '100%', borderRadius: '9999px', width: '80%' }}></View>
              </View>
            </View>
          </View>
        </View>

        {/* 班级排名 */}
        <View style={{ background: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', color: '#fff' }}>
          <Text style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏅 班级排名
          </Text>
          <View style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '12px', padding: '16px', backdropFilter: 'blur(10px)' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text>班级排名</Text>
              <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>第 5 名</Text>
            </View>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>年级排名</Text>
              <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>第 23 名</Text>
            </View>
          </View>
          <Text style={{ fontSize: '14px', textAlign: 'center', marginTop: '16px', opacity: 0.9 }}>
            💪 继续加油，冲刺前三名！
          </Text>
        </View>
      </View>
    </View>
  );
}