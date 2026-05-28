import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';

export default function ErrorBookPage() {
  const handleBack = () => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack();
      return;
    }
    Taro.switchTab({ url: '/pages/MainWorldPage/index' });
  };

  const handleRetry = (questionId: number) => {
    Taro.showModal({
      title: '开始订正',
      content: `开始订正题目 #${questionId}`,
      showCancel: false
    });
  };

  const errorQuestions = [
    {
      id: 1,
      question: '45 + 28 = ?',
      yourAnswer: '63',
      correctAnswer: '73',
      date: '2026-03-23',
    },
    {
      id: 2,
      question: '小明买了3支铅笔，每支5元，他付了20元，应该找回多少钱？',
      yourAnswer: '10元',
      correctAnswer: '5元',
      date: '2026-03-22',
    },
    {
      id: 3,
      question: '7 × 8 = ?',
      yourAnswer: '54',
      correctAnswer: '56',
      date: '2026-03-21',
    },
  ];

  return (
    <View style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #fef2f2 0%, #ffedd5 100%)', padding: '16px' }}>
      {/* 顶部导航 */}
      <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '24px' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View
            onClick={handleBack}
            style={{ background: '#fff', padding: '12px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <Text style={{ color: '#374151' }}>←</Text>
          </View>
          <View style={{ background: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text style={{ color: '#ef4444' }}>⚠️</Text>
            <Text style={{ fontWeight: 'bold', color: '#374151' }}>错题本</Text>
          </View>
          <View style={{ width: '44px' }}></View>
        </View>

        {/* 统计卡片 */}
        <View style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '24px' }}>
          <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
            <View>
              <Text style={{ fontSize: '30px', fontWeight: 'bold', color: '#ef4444' }}>{errorQuestions.length}</Text>
              <Text style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>待订正</Text>
            </View>
            <View>
              <Text style={{ fontSize: '30px', fontWeight: 'bold', color: '#22c55e' }}>12</Text>
              <Text style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>已订正</Text>
            </View>
            <View>
              <Text style={{ fontSize: '30px', fontWeight: 'bold', color: '#7c3aed' }}>80%</Text>
              <Text style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>订正率</Text>
            </View>
          </View>
        </View>

        <View style={{ background: '#ffedd5', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
          <Text style={{ fontSize: '14px', color: '#c2410c', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Text>💡</Text>
            <Text>订正错题可获得爱心口粮，强化薄弱知识点</Text>
          </Text>
        </View>
      </View>

      {/* 错题列表 */}
      <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto' }}>
        {errorQuestions.map((item, index) => (
          <View key={item.id} style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '24px', marginBottom: '16px' }}>
            <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <View style={{ background: '#fee2e2', color: '#ef4444', fontWeight: 'bold', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {index + 1}
                </View>
                <View>
                  <Text style={{ fontSize: '12px', color: '#6b7280' }}>{item.date}</Text>
                </View>
              </View>
              <View
                onClick={() => handleRetry(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)', color: '#fff', paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px', borderRadius: '9999px', fontSize: '14px', fontWeight: 'bold' }}
              >
                <Text>🔄</Text>
                重新作答
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>{item.question}</Text>
              
              <View style={{ gap: '8px' }}>
                <View style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '14px', color: '#4b5563' }}>你的答案</Text>
                  <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>{item.yourAnswer}</Text>
                </View>
                <View style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '14px', color: '#4b5563' }}>正确答案</Text>
                  <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#22c55e' }}>{item.correctAnswer}</Text>
                </View>
              </View>
            </View>

            {/* 知识点提示 */}
            <View style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Text style={{ fontSize: '18px' }}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '12px', color: '#1e40af' }}>
                  <Text style={{ fontWeight: 'bold', color: '#1d4ed8' }}>知识点：</Text>
                  {index === 0 && '两位数加法进位计算'}
                  {index === 1 && '应用题中的找零计算'}
                  {index === 2 && '乘法口诀表'}
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* 空状态提示 */}
        {errorQuestions.length === 0 && (
          <View style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', padding: '48px', textAlign: 'center' }}>
            <Text style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</Text>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>太棒了！</Text>
            <Text style={{ color: '#4b5563' }}>目前没有错题，继续保持哦~</Text>
          </View>
        )}
      </View>

      {/* 宠物鼓励 */}
      <View style={{ maxWidth: '672px', marginLeft: 'auto', marginRight: 'auto', marginTop: '24px' }}>
        <View style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Text style={{ fontSize: '30px' }}>🐱</Text>
          <Text style={{ fontSize: '14px', color: '#4b5563' }}>
            错题是最好的老师！把每道错题都弄懂，你就会越来越厉害~
          </Text>
        </View>
      </View>
    </View>
  );
}