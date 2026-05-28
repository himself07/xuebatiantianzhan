import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Swords, Users, Trophy } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import { TeamSetupModal } from '../components/TeamSetupModal';
import { EnhancedBattle } from '../components/EnhancedBattle';
import { PageGreeting } from '../components/PageGreeting';
import { playSound } from '../utils/audio';

const arenaGreetings = [
  '竞技场开战！让我为你加油！⚔️',
  '展现真正实力的时候到了！🏆',
  '战斗吧！我会一直支持你的！💖',
];

export function ArenaPage() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'solo' | 'team' | null>(null);
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [playerTeam, setPlayerTeam] = useState<number[]>([]);
  const [currentBattleTeam, setCurrentBattleTeam] = useState<number[]>([]);
  const [energy, setEnergy] = useState(0);

  useEffect(() => {
    const progress = StorageManager.getProgress();
    setEnergy(progress.energy);
    setPlayerTeam(StorageManager.getCardTeam());
  }, []);

  const startBattle = (mode: 'solo' | 'team') => {
    if (energy < 10) {
      playSound('error');
      alert('体力不足！需要10点体力才能参加竞技');
      return;
    }

    setSelectedMode(mode);
    playSound('battleStart');
    setShowTeamSetup(true);
  };

  const handleTeamConfirm = (teamIds: number[]) => {
    setPlayerTeam(teamIds);
    setShowTeamSetup(false);

    StorageManager.updateProgress((progress) => ({
      energy: progress.energy - 10,
    }));

    setTimeout(() => {
      setEnergy(energy - 10);
      setCurrentBattleTeam(teamIds);
      setShowBattle(true);
    }, 100);
  };

  const handleBattleEnd = (won: boolean, coinsEarned: number) => {
    if (won && coinsEarned > 0) {
      playSound('battleWin');
      StorageManager.updateProgress((progress) => ({
        coins: progress.coins + coinsEarned,
      }));
    } else {
      playSound('error');
    }
    setShowBattle(false);
  };

  const rankings = [
    { rank: 1, name: '小华', class: '三(1)班', score: 1580, avatar: '👦' },
    { rank: 2, name: '小芳', class: '三(3)班', score: 1520, avatar: '👧' },
    { rank: 3, name: '小明', class: '三(2)班', score: 1480, avatar: '👦' },
    { rank: 4, name: '小红', class: '三(2)班', score: 1450, avatar: '👧' },
    { rank: 5, name: '小刚', class: '三(1)班', score: 1420, avatar: '👦' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-700 to-red-600 p-4">
      <PageGreeting pageName="arena" pageGreetings={arenaGreetings} />
      {/* 顶部导航 */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/main-world')}
            className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-md hover:scale-110 transition-transform"
          >
            <ArrowLeft className="size-5 text-gray-700" />
          </button>
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md flex items-center gap-2">
            <Swords className="size-5 text-purple-500" />
            <span className="font-bold text-gray-700">竞技场</span>
          </div>
          <div className="bg-green-500 px-3 py-2 rounded-full shadow-md flex items-center gap-1">
            <span className="text-sm font-bold text-white">{energy} ⚡</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* 竞技模式选择 */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Swords className="size-6 text-yellow-400" />
            选择竞技模式
          </h3>

          {/* 个人跨班战 */}
          <div
            onClick={() => startBattle('solo')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 cursor-pointer hover:scale-102 transition-all border-2 border-white/20"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Swords className="size-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">⚔️ 个人跨班战</h3>
                  <p className="text-white/80 text-sm">1v1卡牌对决，答题辅助</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-white/30 px-2 py-1 rounded text-xs">⚡ 10体力</span>
                    <span className="bg-yellow-500/50 px-2 py-1 rounded text-xs">🏆 50+金币</span>
                  </div>
                </div>
              </div>
              <div className="text-3xl">→</div>
            </div>
          </div>

          {/* 班级小队战 */}
          <div
            onClick={() => startBattle('team')}
            className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-5 cursor-pointer hover:scale-102 transition-all border-2 border-white/20"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl">
                  <Users className="size-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">👥 班级小队战</h3>
                  <p className="text-white/80 text-sm">3-5人组队，团队协作</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-white/30 px-2 py-1 rounded text-xs">⚡ 10体力</span>
                    <span className="bg-yellow-500/50 px-2 py-1 rounded text-xs">🏆 团队奖励</span>
                  </div>
                </div>
              </div>
              <div className="text-3xl">→</div>
            </div>
          </div>
        </div>

        {/* 竞技规则 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <span>📋</span> 竞技规则
          </h3>
          <div className="space-y-2 text-sm text-white/90">
            <p>• 卡牌实力占70%，答题表现占30%</p>
            <p>• 胜利获得金币和稀有卡牌奖励</p>
            <p>• 失败无惩罚，保护学习兴趣</p>
          </div>
        </div>

        {/* 实时排行榜 */}
        <div className="bg-white rounded-3xl shadow-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="size-6 text-yellow-500" />
            本周排行榜
          </h3>

          <div className="space-y-3">
            {rankings.map((player) => (
              <div 
                key={player.rank}
                className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                  player.rank <= 3 
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' 
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* 排名 */}
                  <div className={`size-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    player.rank === 1 
                      ? 'bg-yellow-400 text-white' 
                      : player.rank === 2 
                      ? 'bg-gray-300 text-white'
                      : player.rank === 3
                      ? 'bg-orange-300 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                  </div>

                  {/* 头像和信息 */}
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{player.avatar}</div>
                    <div>
                      <p className="font-bold text-gray-800">{player.name}</p>
                      <p className="text-xs text-gray-500">{player.class}</p>
                    </div>
                  </div>
                </div>

                {/* 积分 */}
                <div className="text-right">
                  <p className="text-xl font-bold text-purple-600">{player.score}</p>
                  <p className="text-xs text-gray-500">积分</p>
                </div>
              </div>
            ))}
          </div>

          {/* 我的排名 */}
          <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  23
                </div>
                <div>
                  <p className="font-bold text-gray-800">我的排名</p>
                  <p className="text-xs text-gray-500">三(2)班</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">980</p>
                <p className="text-xs text-gray-500">积分</p>
              </div>
            </div>
          </div>
        </div>

        {/* 奖励预览 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>🎁</span>
            排名奖励
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-3xl mb-2">🥇</div>
              <p className="text-xs text-white/90 mb-1">第1名</p>
              <p className="text-xs text-yellow-300 font-bold">传说卡牌</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-3xl mb-2">🥈</div>
              <p className="text-xs text-white/90 mb-1">第2名</p>
              <p className="text-xs text-purple-300 font-bold">稀有卡牌</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-3xl mb-2">🥉</div>
              <p className="text-xs text-white/90 mb-1">第3名</p>
              <p className="text-xs text-blue-300 font-bold">高级卡牌</p>
            </div>
          </div>
        </div>

        {/* 提示 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800 text-center">
            💡 答题能力是胜负关键！多做题、多练习才能提升排名
          </p>
        </div>
      </div>

      {/* 队伍设置弹窗 */}
      {showTeamSetup && (
        <TeamSetupModal
          onClose={() => setShowTeamSetup(false)}
          onConfirm={handleTeamConfirm}
        />
      )}

      {/* 战斗弹窗 */}
      {showBattle && (
        <EnhancedBattle
          playerTeamIds={currentBattleTeam}
          onClose={() => setShowBattle(false)}
          onBattleEnd={handleBattleEnd}
        />
      )}
    </div>
  );
}
