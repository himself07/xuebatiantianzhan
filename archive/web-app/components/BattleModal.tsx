import { useState, useEffect } from 'react';
import { X, Swords, Trophy } from 'lucide-react';
import { CARD_DATA, Card } from '../types/card';
import { StorageManager } from '../utils/storage';

interface BattleModalProps {
  playerTeam: number[];
  onClose: () => void;
  onBattleEnd: (won: boolean, coinsEarned: number) => void;
}

interface BattleCard {
  card: Card;
  hp: number;
  maxHp: number;
}

export function BattleModal({ playerTeam, onClose, onBattleEnd }: BattleModalProps) {
  const [battleState, setBattleState] = useState<'matching' | 'battling' | 'result'>('matching');
  const [currentRound, setCurrentRound] = useState(0);
  const [playerCards, setPlayerCards] = useState<BattleCard[]>([]);
  const [opponentCards, setOpponentCards] = useState<BattleCard[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);

  useEffect(() => {
    // 匹配对手
    setTimeout(() => {
      initializeBattle();
      setBattleState('battling');
    }, 2000);
  }, []);

  const initializeBattle = () => {
    // 初始化玩家卡牌
    const pCards = playerTeam.map((id) => {
      const card = CARD_DATA.find((c) => c.id === id)!;
      return {
        card,
        hp: card.defense * 10,
        maxHp: card.defense * 10,
      };
    });

    // 生成对手卡牌（随机选择5张）
    const opponentTeam = [...CARD_DATA]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
    const oCards = opponentTeam.map((card) => ({
      card,
      hp: card.defense * 10,
      maxHp: card.defense * 10,
    }));

    setPlayerCards(pCards);
    setOpponentCards(oCards);
    setBattleLog(['战斗开始！']);

    // 开始自动战斗
    setTimeout(() => executeBattle(pCards, oCards), 1000);
  };

  const executeBattle = (pCards: BattleCard[], oCards: BattleCard[]) => {
    let playerTeam = [...pCards];
    let opponentTeam = [...oCards];
    let round = 1;
    let logs: string[] = ['战斗开始！'];

    const battleInterval = setInterval(() => {
      if (playerTeam.length === 0 || opponentTeam.length === 0) {
        clearInterval(battleInterval);
        const playerWon = playerTeam.length > 0;
        setWinner(playerWon ? 'player' : 'opponent');
        setBattleState('result');

        const coinsEarned = playerWon ? 50 + playerTeam.length * 10 : 0;
        if (playerWon) {
          logs.push(`🎉 胜利！获得 ${coinsEarned} 金币奖励！`);
        } else {
          logs.push('💪 失败了，继续努力吧！');
        }
        setBattleLog(logs);

        setTimeout(() => {
          onBattleEnd(playerWon, coinsEarned);
        }, 3000);
        return;
      }

      // 当前回合战斗
      const pCard = playerTeam[0];
      const oCard = opponentTeam[0];

      logs.push(`\n【第${round}回合】`);
      logs.push(`${pCard.card.name} VS ${oCard.card.name}`);

      // 攻击计算
      const pDamage = Math.floor(pCard.card.attack * (0.8 + Math.random() * 0.4));
      const oDamage = Math.floor(oCard.card.attack * (0.8 + Math.random() * 0.4));

      oCard.hp -= pDamage;
      pCard.hp -= oDamage;

      logs.push(`${pCard.card.name} 造成 ${pDamage} 伤害`);
      logs.push(`${oCard.card.name} 造成 ${oDamage} 伤害`);

      // 检查击败
      if (oCard.hp <= 0) {
        logs.push(`✨ ${oCard.card.name} 被击败了！`);
        opponentTeam.shift();
      }
      if (pCard.hp <= 0) {
        logs.push(`💥 ${pCard.card.name} 被击败了！`);
        playerTeam.shift();
      }

      setPlayerCards([...playerTeam]);
      setOpponentCards([...opponentTeam]);
      setBattleLog([...logs]);
      setCurrentRound(round);
      round++;
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 匹配中 */}
        {battleState === 'matching' && (
          <div className="text-center py-12">
            <Swords className="size-20 text-white mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-4">正在匹配对手...</h2>
            <p className="text-white/80">请稍候</p>
          </div>
        )}

        {/* 战斗中 */}
        {battleState === 'battling' && (
          <>
            {/* 头部 */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Swords className="size-6" />
                第 {currentRound} 回合
              </h2>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <X className="size-5 text-white" />
              </button>
            </div>

            {/* 战场 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* 玩家队伍 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 border-blue-400">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-blue-400">⚔️</span>
                  我的队伍
                </h3>
                <div className="space-y-2">
                  {playerCards.map((battleCard, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-r ${battleCard.card.color} rounded-xl p-3 ${
                        index === 0 ? 'ring-4 ring-yellow-400' : 'opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎴</span>
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {battleCard.card.name}
                            </h4>
                            <p className="text-xs text-white/80">
                              ⚔️{battleCard.card.attack} 🛡️{battleCard.card.defense}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/80">HP</div>
                          <div className="font-bold text-white">
                            {Math.max(0, battleCard.hp)}/{battleCard.maxHp}
                          </div>
                        </div>
                      </div>
                      <div className="bg-black/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-400 h-full transition-all duration-500"
                          style={{
                            width: `${Math.max(0, (battleCard.hp / battleCard.maxHp) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 对手队伍 */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border-2 border-red-400">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <span className="text-red-400">⚔️</span>
                  对手队伍
                </h3>
                <div className="space-y-2">
                  {opponentCards.map((battleCard, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-r ${battleCard.card.color} rounded-xl p-3 ${
                        index === 0 ? 'ring-4 ring-yellow-400' : 'opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🎴</span>
                          <div>
                            <h4 className="font-bold text-white text-sm">
                              {battleCard.card.name}
                            </h4>
                            <p className="text-xs text-white/80">
                              ⚔️{battleCard.card.attack} 🛡️{battleCard.card.defense}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/80">HP</div>
                          <div className="font-bold text-white">
                            {Math.max(0, battleCard.hp)}/{battleCard.maxHp}
                          </div>
                        </div>
                      </div>
                      <div className="bg-black/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-red-400 h-full transition-all duration-500"
                          style={{
                            width: `${Math.max(0, (battleCard.hp / battleCard.maxHp) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 战斗日志 */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <h3 className="font-bold text-white mb-3">战斗日志</h3>
              <div className="h-32 overflow-y-auto text-sm text-white/90 space-y-1 font-mono">
                {battleLog.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 战斗结果 */}
        {battleState === 'result' && (
          <div className="text-center py-12">
            {winner === 'player' ? (
              <>
                <Trophy className="size-24 text-yellow-400 mx-auto mb-6 animate-bounce" />
                <h2 className="text-4xl font-bold text-white mb-4">🎉 胜利！</h2>
                <p className="text-xl text-white/90 mb-6">
                  恭喜你击败了对手！
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">💪</div>
                <h2 className="text-4xl font-bold text-white mb-4">继续加油！</h2>
                <p className="text-xl text-white/90 mb-6">
                  虽然失败了，但你已经很棒了！
                </p>
              </>
            )}

            {/* 战斗日志 */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-md mx-auto">
              <div className="text-sm text-white/90 space-y-1 font-mono max-h-48 overflow-y-auto">
                {battleLog.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform"
            >
              返回竞技场
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
