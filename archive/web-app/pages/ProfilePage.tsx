import { useNavigate } from 'react-router';
import { ArrowLeft, User, Trophy, BookOpen, Award, TrendingUp } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const progress = JSON.parse(localStorage.getItem('learningProgress') || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
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
            <User className="size-5 text-blue-500" />
            <span className="font-bold text-gray-700">个人主页</span>
          </div>
          <div className="w-11"></div>
        </div>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        {/* 个人信息卡片 */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="size-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              小明
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">小明同学</h2>
              <p className="text-sm text-gray-500">三年级2班 · 学号08</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                  Lv.12
                </div>
                <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                  连续{progress.continuousDays || 1}天
                </div>
              </div>
            </div>
          </div>

          {/* 学习统计 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{progress.todayAnswerCount || 0}</p>
              <p className="text-xs text-gray-500 mt-1">今日答题</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{progress.todayCorrectRate || 0}%</p>
              <p className="text-xs text-gray-500 mt-1">正确率</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">368</p>
              <p className="text-xs text-gray-500 mt-1">总答题数</p>
            </div>
          </div>
        </div>

        {/* 学习成就 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="size-6 text-yellow-500" />
            学习成就
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm font-bold text-gray-800">连续学习7天</p>
              <p className="text-xs text-gray-500 mt-1">已解锁</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-sm font-bold text-gray-800">答题小能手</p>
              <p className="text-xs text-gray-500 mt-1">已解锁</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm font-bold text-gray-800">正确率达人</p>
              <p className="text-xs text-gray-500 mt-1">已解锁</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 border border-gray-200 opacity-50">
              <div className="text-3xl mb-2">👑</div>
              <p className="text-sm font-bold text-gray-800">学霸之王</p>
              <p className="text-xs text-gray-500 mt-1">未解锁</p>
            </div>
          </div>
        </div>

        {/* 本周学习数据 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="size-6 text-purple-500" />
            本周学习趋势
          </h3>
          <div className="space-y-3">
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
              const count = [15, 23, 18, 25, 20, 12, progress.todayAnswerCount || 0][index];
              const percentage = (count / 30) * 100;
              return (
                <div key={day}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{day}</span>
                    <span className="text-sm font-bold text-purple-600">{count}题</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 知识点掌握情况 */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="size-6 text-blue-500" />
            知识点掌握
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">加减法运算</span>
                <span className="text-sm font-bold text-green-600">95%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-full rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">乘法口诀</span>
                <span className="text-sm font-bold text-blue-600">88%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">应用题解析</span>
                <span className="text-sm font-bold text-orange-600">72%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">几何图形</span>
                <span className="text-sm font-bold text-purple-600">80%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 班级排名 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="size-6" />
            班级排名
          </h3>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span>班级排名</span>
              <span className="text-2xl font-bold">第 5 名</span>
            </div>
            <div className="flex items-center justify-between">
              <span>年级排名</span>
              <span className="text-2xl font-bold">第 23 名</span>
            </div>
          </div>
          <p className="text-sm text-center mt-4 opacity-90">
            💪 继续加油，冲刺前三名！
          </p>
        </div>
      </div>
    </div>
  );
}
