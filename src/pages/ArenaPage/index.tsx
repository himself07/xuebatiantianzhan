import Taro, { useShareAppMessage } from '@tarojs/taro';
import { useEffect, useRef, useState } from 'react';
import { Text, View, Image } from '@tarojs/components';
import { StorageManager } from '../../utils/storage';
import { ARENA_CARD_LIBRARY, ArenaCardTemplate, CARD_KNOWLEDGE_TAGS, getCardById } from '../../types/card';
import { getTodayBoss } from '../../data/dailyBoss';
import GameCard from '../../components/GameCard';

type Phase = 'select' | 'match' | 'battle' | 'result';
type Side = 'player' | 'enemy';
type SkillType = 'damage' | 'heal' | 'buff';

interface LearningProgress {
  energy?: number;
  coins?: number;
  rankInfo?: {
    level: number;
    points: number;
    seasonStartTime: number;
  };
  ownedCards?: Array<{ cardId?: number }>;
}

interface TeamCard extends ArenaCardTemplate {
  uid: string;
  hp: number;
  basicAttackCount: number;
  attackBuff: number;
  buffTurns: number;
}

/**
 * 生成区间随机整数。
 */
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * 洗牌工具，返回新数组。
 */
const shuffle = <T,>(source: T[]): T[] => {
  const cloned = [...source];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

/**
 * 读取学习进度，兼容对象与字符串缓存。
 */
const getProgress = (): LearningProgress => {
  const stored = Taro.getStorageSync('learningProgress');
  if (typeof stored === 'string' && stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }
  if (stored && typeof stored === 'object') {
    return stored;
  }
  return {};
};

/**
 * 今日母题匹配卡牌攻击 +10%。
 */
const applyMotherTopicBuff = (template: ArenaCardTemplate, side: Side): ArenaCardTemplate => {
  if (side !== 'player') {
    return template;
  }
  const tag = StorageManager.getTodayKnowledgeTag();
  if (!tag || CARD_KNOWLEDGE_TAGS[template.id] !== tag) {
    return template;
  }
  return {
    ...template,
    attack: Math.floor(template.attack * 1.1),
  };
};

/**
 * 将卡牌模板转换为运行时对战卡牌。
 */
const toTeamCard = (template: ArenaCardTemplate, side: Side, order: number): TeamCard => ({
  ...template,
  uid: `${side}-${template.id}-${Date.now()}-${order}-${Math.random()}`,
  hp: template.baseHp,
  basicAttackCount: 0,
  attackBuff: 0,
  buffTurns: 0,
});

/**
 * 从拥有卡牌中构建可选出战池。
 */
const buildSelectPool = (progress: LearningProgress): ArenaCardTemplate[] => {
  const rawOwned = Array.isArray(progress.ownedCards) ? progress.ownedCards : [];
  const ownedIds = Array.from(
    new Set(
      rawOwned
        .map((item) => item.cardId)
        .filter((id): id is number => typeof id === 'number')
    )
  );
  const ownedCards = ARENA_CARD_LIBRARY.filter((card) => ownedIds.includes(card.id));
  if (ownedCards.length === 0) {
    return shuffle(ARENA_CARD_LIBRARY).slice(0, 5);
  }
  return shuffle(ownedCards);
};

/**
 * 获取队伍中下一个存活卡牌下标。
 */
const getNextAliveIndex = (team: TeamCard[], start: number): number => {
  if (team.length === 0) {
    return -1;
  }
  for (let step = 0; step < team.length; step += 1) {
    const idx = (start + step) % team.length;
    if (team[idx].hp > 0) {
      return idx;
    }
  }
  return -1;
};

const countAlive = (team: TeamCard[]) => team.filter((card) => card.hp > 0).length;

const getHpPercent = (card: TeamCard) =>
  Math.max(0, Math.min(100, Math.round((card.hp / card.baseHp) * 100)));

export default function ArenaPage() {
  const [phase, setPhase] = useState<Phase>('select');
  const [energy, setEnergy] = useState(0);
  const [selectPool, setSelectPool] = useState<ArenaCardTemplate[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);
  const [playerTeam, setPlayerTeam] = useState<TeamCard[]>([]);
  const [enemyTeam, setEnemyTeam] = useState<TeamCard[]>([]);
  const [round, setRound] = useState(1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [skillText, setSkillText] = useState('请选择1-5张卡牌组成队伍');
  const [activeAttackerId, setActiveAttackerId] = useState<string | null>(null);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [winner, setWinner] = useState<Side | null>(null);
  const [resultRewardText, setResultRewardText] = useState('');
  const [honorText, setHonorText] = useState('');
  const [battleSpeed, setBattleSpeed] = useState<1 | 2>(1);
  const [paused, setPaused] = useState(false);
  const [shareBattleText, setShareBattleText] = useState('来和我队伍对战！');

  const playerTeamRef = useRef<TeamCard[]>([]);
  const enemyTeamRef = useRef<TeamCard[]>([]);
  const playerActiveIndexRef = useRef(0);
  const enemyActiveIndexRef = useRef(0);
  const turnSideRef = useRef<Side>('player');
  const phaseRef = useRef<Phase>('select');
  const runningRef = useRef(false);
  const pausedRef = useRef(false);
  const speedRef = useRef<1 | 2>(1);
  const matchTimerRef = useRef<number | null>(null);
  const autoTurnTimerRef = useRef<number | null>(null);
  const effectTimerRef = useRef<number | null>(null);

  useShareAppMessage(() => {
    StorageManager.recordShareAction(false);
    const reward = StorageManager.claimDailyShareReward();
    if (reward.success) {
      Taro.showToast({ title: reward.message, icon: 'success' });
    }
    return {
      title: shareBattleText,
      path: '/pages/ArenaPage/index',
    };
  });

  useEffect(() => {
    const progress = getProgress();
    setEnergy(progress.energy || 0);
    const pool = buildSelectPool(progress);
    setSelectPool(pool);
    setSelectedTemplateIds(pool.slice(0, Math.min(3, pool.length)).map((card) => card.id));

    return () => {
      if (matchTimerRef.current) {
        clearTimeout(matchTimerRef.current);
      }
      if (autoTurnTimerRef.current) {
        clearTimeout(autoTurnTimerRef.current);
      }
      if (effectTimerRef.current) {
        clearTimeout(effectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    speedRef.current = battleSpeed;
  }, [battleSpeed]);

  /**
   * 切换出战卡牌选择，限制最多5张。
   */
  const toggleCardSelection = (templateId: number) => {
    setSelectedTemplateIds((prev) => {
      if (prev.includes(templateId)) {
        if (prev.length === 1) {
          Taro.showToast({ title: '至少保留1张出战卡牌', icon: 'none' });
          return prev;
        }
        return prev.filter((id) => id !== templateId);
      }
      if (prev.length >= 5) {
        Taro.showToast({ title: '最多选择5张卡牌', icon: 'none' });
        return prev;
      }
      return [...prev, templateId];
    });
  };

  /**
   * 刷新可选卡池。
   */
  const refreshSelectPool = () => {
    if (phase !== 'select') {
      return;
    }
    const progress = getProgress();
    const pool = buildSelectPool(progress);
    setSelectPool(pool);
    setSelectedTemplateIds(pool.slice(0, Math.min(3, pool.length)).map((card) => card.id));
  };

  /**
   * 对战日志追加工具。
   */
  const appendLogs = (logs: string[]) => {
    setBattleLog((prev) => [...prev, ...logs]);
  };

  /**
   * 结算一次行动回合。
   */
  const executeTurn = (side: Side): { ended: boolean; winner?: Side } => {
    const attackerTeam = side === 'player' ? playerTeamRef.current : enemyTeamRef.current;
    const defenderTeam = side === 'player' ? enemyTeamRef.current : playerTeamRef.current;
    const attackerActiveRef = side === 'player' ? playerActiveIndexRef : enemyActiveIndexRef;
    const defenderActiveRef = side === 'player' ? enemyActiveIndexRef : playerActiveIndexRef;

    let attackerIdx = attackerActiveRef.current;
    if (
      attackerIdx < 0 ||
      attackerIdx >= attackerTeam.length ||
      attackerTeam[attackerIdx].hp <= 0
    ) {
      attackerIdx = getNextAliveIndex(attackerTeam, 0);
      attackerActiveRef.current = attackerIdx;
    }
    if (attackerIdx < 0) {
      return { ended: true, winner: side === 'player' ? 'enemy' : 'player' };
    }

    let defenderIdx = defenderActiveRef.current;
    if (
      defenderIdx < 0 ||
      defenderIdx >= defenderTeam.length ||
      defenderTeam[defenderIdx].hp <= 0
    ) {
      defenderIdx = getNextAliveIndex(defenderTeam, 0);
      defenderActiveRef.current = defenderIdx;
    }
    if (defenderIdx < 0) {
      return { ended: true, winner: side };
    }

    const attacker = { ...attackerTeam[attackerIdx] };
    const defender = { ...defenderTeam[defenderIdx] };
    const defenderSide = side === 'player' ? 'enemy' : 'player';
    const preBuffTurns = attacker.buffTurns;

    const baseDamage = Math.max(
      1,
      attacker.attack + attacker.attackBuff - Math.floor(defender.defense * 0.55) + randomInt(-2, 5)
    );
    defender.hp = Math.max(0, defender.hp - baseDamage);
    attacker.basicAttackCount += 1;

    setActiveAttackerId(attacker.uid);
    setActiveTargetId(defender.uid);

    const turnLogs = [
      `${side === 'player' ? '我方' : '敌方'}【${attacker.name}】普攻命中【${defender.name}】${baseDamage} 点`,
    ];
    let skillBanner = '';

    if (attacker.basicAttackCount % 2 === 0 && attacker.hp > 0) {
      if (attacker.skill.type === 'damage' && defender.hp > 0) {
        const skillDamage = Math.max(
          2,
          Math.floor(
            attacker.attack * (attacker.skill.damageRate || 1.4) -
              Math.floor(defender.defense * 0.3) +
              randomInt(0, 8)
          )
        );
        defender.hp = Math.max(0, defender.hp - skillDamage);
        skillBanner = `${side === 'player' ? '我方' : '敌方'}施放【${attacker.skill.name}】造成 ${skillDamage} 额外伤害`;
        turnLogs.push(`✨ ${skillBanner}`);
      } else if (attacker.skill.type === 'heal') {
        const aliveAllyIndexes = attackerTeam
          .map((card, index) => ({ card, index }))
          .filter((entry) => entry.card.hp > 0)
          .sort((a, b) => a.card.hp - b.card.hp);
        if (aliveAllyIndexes.length > 0) {
          const healTargetIndex = aliveAllyIndexes[0].index;
          const healTarget =
            healTargetIndex === attackerIdx
              ? attacker
              : { ...attackerTeam[healTargetIndex] };
          const healValue = Math.max(8, Math.floor(attacker.attack * (attacker.skill.healRate || 0.8)));
          healTarget.hp = Math.min(healTarget.baseHp, healTarget.hp + healValue);
          attackerTeam[healTargetIndex] = healTarget;
          skillBanner = `${side === 'player' ? '我方' : '敌方'}施放【${attacker.skill.name}】为【${healTarget.name}】回复 ${healValue}`;
          turnLogs.push(`💚 ${skillBanner}`);
        }
      } else if (attacker.skill.type === 'buff') {
        attacker.attackBuff = Math.max(attacker.attackBuff, attacker.skill.buffAttack || 8);
        attacker.buffTurns = 2;
        skillBanner = `${side === 'player' ? '我方' : '敌方'}施放【${attacker.skill.name}】，接下来两次行动攻击强化`;
        turnLogs.push(`🛡️ ${skillBanner}`);
      }
    }

    if (preBuffTurns > 0) {
      attacker.buffTurns = Math.max(0, attacker.buffTurns - 1);
      if (attacker.buffTurns === 0) {
        attacker.attackBuff = 0;
        turnLogs.push(`⏳ 【${attacker.name}】强化效果结束`);
      }
    }

    attackerTeam[attackerIdx] = attacker;
    defenderTeam[defenderIdx] = defender;

    if (defender.hp <= 0) {
      const nextDefender = getNextAliveIndex(defenderTeam, defenderIdx + 1);
      defenderActiveRef.current = nextDefender;
      if (nextDefender >= 0) {
        turnLogs.push(`🔁 ${defenderSide === 'enemy' ? '敌方' : '我方'}下一张卡牌【${defenderTeam[nextDefender].name}】出列`);
      } else {
        turnLogs.push(`☠️ ${defenderSide === 'enemy' ? '敌方' : '我方'}队伍全员倒下`);
      }
    }

    if (side === 'player') {
      playerTeamRef.current = [...attackerTeam];
      enemyTeamRef.current = [...defenderTeam];
      setPlayerTeam(playerTeamRef.current);
      setEnemyTeam(enemyTeamRef.current);
    } else {
      enemyTeamRef.current = [...attackerTeam];
      playerTeamRef.current = [...defenderTeam];
      setEnemyTeam(enemyTeamRef.current);
      setPlayerTeam(playerTeamRef.current);
      setRound((prev) => prev + 1);
    }

    if (effectTimerRef.current) {
      clearTimeout(effectTimerRef.current);
    }
    effectTimerRef.current = setTimeout(() => {
      setActiveAttackerId(null);
      setActiveTargetId(null);
      if (!skillBanner) {
        setSkillText('自动轮战中：每张卡牌2次普攻后释放主动技能');
      }
    }, 520);

    if (skillBanner) {
      setSkillText(skillBanner);
    }
    appendLogs(turnLogs);

    const defenderAlive = countAlive(defenderSide === 'enemy' ? enemyTeamRef.current : playerTeamRef.current);
    if (defenderAlive === 0) {
      return { ended: true, winner: side };
    }
    return { ended: false };
  };

  /**
   * 自动战斗循环。
   */
  const runAutoBattleLoop = () => {
    if (autoTurnTimerRef.current) {
      clearTimeout(autoTurnTimerRef.current);
    }
    autoTurnTimerRef.current = setTimeout(() => {
      if (!runningRef.current || phaseRef.current !== 'battle') {
        return;
      }
      if (pausedRef.current) {
        return;
      }
      const turn = executeTurn(turnSideRef.current);
      if (turn.ended && turn.winner) {
        finishBattle(turn.winner);
        return;
      }
      turnSideRef.current = turnSideRef.current === 'player' ? 'enemy' : 'player';
      runAutoBattleLoop();
    }, speedRef.current === 2 ? 420 : 850);
  };

  /**
   * 结算战斗并发放奖励。
   */
  const finishBattle = (winnerSide: Side) => {
    runningRef.current = false;
    if (autoTurnTimerRef.current) {
      clearTimeout(autoTurnTimerRef.current);
    }
    setWinner(winnerSide);
    setPaused(false);
    setPhase('result');

    const progress = getProgress();
    if (winnerSide === 'player') {
      const remain = countAlive(playerTeamRef.current);
      const coinsReward = 60 + remain * 8;
      const rankReward = 18 + remain * 2;
      progress.coins = (progress.coins || 0) + coinsReward;
      progress.rankInfo = progress.rankInfo || {
        level: 1,
        points: 0,
        seasonStartTime: Date.now(),
      };
      progress.rankInfo.points += rankReward;
      setResultRewardText(`🎁 +${coinsReward} 金币 +${rankReward} 段位积分`);
      const battleStats = StorageManager.recordBattleResult({
        isWin: true,
        isMvp: remain >= Math.max(1, Math.ceil(playerTeamRef.current.length / 2)),
      });
      setHonorText(
        `荣誉：${battleStats.currentWinStreak}连胜 · MVP ${battleStats.mvpCount}次 · 胜场${battleStats.totalWins}`
      );
      appendLogs([`🏆 队伍获胜，存活 ${remain} 张，结算奖励已发放`]);
    } else {
      setResultRewardText('💪 本次惜败，调整卡组后再次挑战');
      const battleStats = StorageManager.recordBattleResult({ isWin: false });
      setHonorText(
        `荣誉：历史最高${battleStats.bestWinStreak}连胜 · 总场次${battleStats.totalBattles}`
      );
      appendLogs(['💥 队伍战败，建议提高卡牌搭配与技能节奏']);
    }
    Taro.setStorageSync('learningProgress', progress);
  };

  const handleShareBattle = () => {
    const rankInfo = StorageManager.getRankInfo();
    const text = `我在队伍竞技场${winner === 'player' ? '获胜' : '挑战中'}，段位积分${rankInfo.points}，来复仇！`;
    setShareBattleText(text);
    Taro.showShareMenu({ withShareTicket: true });
    Taro.showModal({
      title: '分享对战战绩',
      content: '点击右上角「···」分享给好友，首次分享可得 +5 金币',
      showCancel: false,
    });
  };

  /**
   * 开始队伍战斗：最多5张卡牌。
   */
  const startBattle = () => {
    const progress = getProgress();
    if (selectedTemplateIds.length < 1 || selectedTemplateIds.length > 5) {
      Taro.showModal({
        title: '队伍配置有误',
        content: '请选择1到5张卡牌出战',
        showCancel: false,
      });
      return;
    }
    if ((progress.energy || 0) < 10) {
      Taro.showModal({
        title: '体力不足',
        content: '需要10点体力进入竞技场',
        showCancel: false,
      });
      return;
    }

    progress.energy = (progress.energy || 0) - 10;
    Taro.setStorageSync('learningProgress', progress);
    setEnergy(progress.energy || 0);

    const selectedTemplates = selectPool
      .filter((card) => selectedTemplateIds.includes(card.id))
      .map((template) => applyMotherTopicBuff(template, 'player'));
    const playerLineup = selectedTemplates.map((template, index) => toTeamCard(template, 'player', index));
    const enemyTemplates = shuffle(ARENA_CARD_LIBRARY).slice(0, playerLineup.length);
    const enemyLineup = enemyTemplates.map((template, index) => toTeamCard(template, 'enemy', index));

    playerTeamRef.current = playerLineup;
    enemyTeamRef.current = enemyLineup;
    playerActiveIndexRef.current = getNextAliveIndex(playerLineup, 0);
    enemyActiveIndexRef.current = getNextAliveIndex(enemyLineup, 0);
    turnSideRef.current = 'player';
    runningRef.current = false;

    setPlayerTeam(playerLineup);
    setEnemyTeam(enemyLineup);
    setRound(1);
    setWinner(null);
    setBattleLog([
      `🎮 我方派出 ${playerLineup.length} 张卡牌，敌方同规模迎战`,
      '规则：当前上阵卡牌持续对战，倒下后下一张补位；普攻2次后自动释放主动技能',
    ]);
    setSkillText('战斗准备中，马上开始轮流出列对战');
    setPhase('match');
    setBattleSpeed(1);
    setPaused(false);

    if (matchTimerRef.current) {
      clearTimeout(matchTimerRef.current);
    }
    matchTimerRef.current = setTimeout(() => {
      setPhase('battle');
      runningRef.current = true;
      pausedRef.current = false;
      speedRef.current = 1;
      setSkillText('自动轮战中：每张卡牌2次普攻后释放主动技能');
      runAutoBattleLoop();
    }, 1600);
  };

  /**
   * 返回竞技场选择页。
   */
  const goBack = () => {
    runningRef.current = false;
    if (matchTimerRef.current) {
      clearTimeout(matchTimerRef.current);
    }
    if (autoTurnTimerRef.current) {
      clearTimeout(autoTurnTimerRef.current);
    }
    if (effectTimerRef.current) {
      clearTimeout(effectTimerRef.current);
    }
    setActiveAttackerId(null);
    setActiveTargetId(null);
    setPaused(false);
    setBattleSpeed(1);
    setSkillText('请选择1-5张卡牌组成队伍');
    setPhase('select');
  };

  /**
   * 切换战斗速度（1x / 2x）。
   */
  const toggleSpeed = () => {
    const next = battleSpeed === 1 ? 2 : 1;
    setBattleSpeed(next);
    speedRef.current = next;
    setSkillText(`已切换为 ${next}x 战斗速度`);
    if (phase === 'battle' && runningRef.current && !pausedRef.current) {
      runAutoBattleLoop();
    }
  };

  /**
   * 暂停或继续自动战斗。
   */
  const togglePause = () => {
    const nextPaused = !paused;
    setPaused(nextPaused);
    pausedRef.current = nextPaused;
    if (nextPaused) {
      if (autoTurnTimerRef.current) {
        clearTimeout(autoTurnTimerRef.current);
      }
      setSkillText('战斗已暂停，点击继续恢复自动对战');
      return;
    }
    setSkillText('战斗继续，自动轮战执行中');
    if (phase === 'battle' && runningRef.current) {
      runAutoBattleLoop();
    }
  };

  const renderTeamPanel = (team: TeamCard[], side: Side) => (
    <View
      style={{
        flex: 1,
        borderRadius: '16px',
        padding: '12px',
        background: side === 'player' ? 'rgba(59,130,246,0.2)' : 'rgba(244,63,94,0.2)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', display: 'block' }}>
        {side === 'player' ? '我方队伍' : '敌方队伍'}（存活 {countAlive(team)}/{team.length}）
      </Text>
      {team.map((card, index) => {
        const alive = card.hp > 0;
        const isAttacker = activeAttackerId === card.uid;
        const isTarget = activeTargetId === card.uid;
        const activeIndex = side === 'player' ? playerActiveIndexRef.current : enemyActiveIndexRef.current;
        const isCurrentFighter = alive && index === activeIndex;
        return (
          <View
            key={card.uid}
            style={{
              marginBottom: '8px',
              borderRadius: '12px',
              padding: '8px',
              background: !alive
                ? 'rgba(107,114,128,0.35)'
                : isAttacker
                ? 'rgba(250,204,21,0.35)'
                : isTarget
                ? 'rgba(239,68,68,0.35)'
                : 'rgba(15,23,42,0.35)',
              opacity: alive ? 1 : 0.6,
              transform: isAttacker ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.3s ease',
            }}
          >
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {card.portrait ? (
                  <Image src={card.portrait} mode="aspectFill" style={{ width: '28px', height: '36px', borderRadius: '6px' }} />
                ) : (
                  <Text style={{ fontSize: '18px' }}>{card.avatar}</Text>
                )}
                <Text style={{ color: '#fff', fontSize: '13px' }}>
                  {card.name}
                  {isCurrentFighter ? '（当前上阵）' : ''}
                </Text>
              </View>
              <Text style={{ color: '#cbd5e1', fontSize: '11px' }}>
                ATK {card.attack + card.attackBuff} / DEF {card.defense}
              </Text>
            </View>
            <View
              style={{
                marginTop: '6px',
                height: '8px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.18)',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${getHpPercent(card)}%`,
                  height: '100%',
                  background:
                    getHpPercent(card) > 50
                      ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)'
                      : getHpPercent(card) > 25
                      ? 'linear-gradient(90deg, #f59e0b 0%, #f97316 100%)'
                      : 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                }}
              />
            </View>
            <Text style={{ color: '#cbd5e1', fontSize: '10px', marginTop: '4px', display: 'block' }}>
              HP {card.hp}/{card.baseHp} | 普攻计数 {card.basicAttackCount % 2}/2
              {card.buffTurns > 0 ? ` | 强化剩余${card.buffTurns}回合` : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );

  if (phase === 'match') {
    return (
      <View
        style={{
          minHeight: '100vh',
          background: '#0f172a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: '84px' }}>🃏</Text>
        <Text style={{ color: '#fff', fontSize: '28px', fontWeight: 'bold', marginTop: '16px' }}>
          队伍匹配中...
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: '14px', marginTop: '10px' }}>
          卡牌将轮流出列，自动展开队伍对战
        </Text>
      </View>
    );
  }

  if (phase === 'battle') {
    return (
      <View
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #111827 0%, #1e1b4b 55%, #0b1020 100%)',
          padding: '28px 14px 14px',
        }}
      >
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <View
            onClick={goBack}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: '20px' }}>✕</Text>
          </View>
          <View style={{ background: 'rgba(255,255,255,0.16)', borderRadius: '999px', padding: '6px 14px' }}>
            <Text style={{ color: '#fff', fontSize: '13px' }}>第 {round} 回合</Text>
          </View>
          <View style={{ background: '#22c55e', borderRadius: '999px', padding: '6px 12px' }}>
            <Text style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}>{energy} ⚡</Text>
          </View>
        </View>

        <View style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <View
            onClick={toggleSpeed}
            style={{
              flex: 1,
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              background: 'rgba(59,130,246,0.35)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Text style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
              速度：{battleSpeed}x（点击切换）
            </Text>
          </View>
          <View
            onClick={togglePause}
            style={{
              flex: 1,
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              background: paused ? 'rgba(34,197,94,0.35)' : 'rgba(251,191,36,0.35)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Text style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
              {paused ? '继续对战' : '暂停对战'}
            </Text>
          </View>
        </View>

        <View style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          {renderTeamPanel(playerTeam, 'player')}
          {renderTeamPanel(enemyTeam, 'enemy')}
        </View>

        <View
          style={{
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.12)',
            padding: '10px 12px',
            marginBottom: '10px',
            minHeight: '40px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fde047', fontSize: '12px' }}>{skillText}</Text>
        </View>

        <View
          style={{
            borderRadius: '14px',
            background: 'rgba(15,23,42,0.58)',
            padding: '12px',
            flex: 1,
          }}
        >
          {battleLog.slice(-8).map((item, index) => (
            <Text
              key={`${item}-${index}`}
              style={{ color: '#e2e8f0', fontSize: '12px', display: 'block', marginBottom: '4px' }}
            >
              {item}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  if (phase === 'result') {
    const playerAlive = countAlive(playerTeam);
    const enemyAlive = countAlive(enemyTeam);
    const isWin = winner === 'player';
    return (
      <View
        style={{
          minHeight: '100vh',
          background: isWin
            ? 'linear-gradient(135deg, #064e3b 0%, #047857 100%)'
            : 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <Text style={{ fontSize: '84px' }}>{isWin ? '🏆' : '💥'}</Text>
        <Text style={{ color: '#fff', fontSize: '30px', fontWeight: 'bold', marginTop: '8px' }}>
          {isWin ? '队伍对战胜利' : '队伍对战失败'}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', marginTop: '8px' }}>
          我方存活：{playerAlive} 张 | 敌方存活：{enemyAlive} 张
        </Text>
        <View
          style={{
            marginTop: '16px',
            borderRadius: '14px',
            padding: '10px 20px',
            background: isWin
              ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)'
              : 'rgba(255,255,255,0.22)',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>{resultRewardText}</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginTop: '10px' }}>{honorText}</Text>
        <View
          onClick={handleShareBattle}
          style={{
            marginTop: '16px',
            borderRadius: '14px',
            padding: '12px 22px',
            background: '#16a34a',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold' }}>一键分享到微信</Text>
        </View>
        <View
          onClick={goBack}
          style={{
            marginTop: '20px',
            borderRadius: '14px',
            padding: '14px 28px',
            background: 'rgba(255,255,255,0.2)',
          }}
        >
          <Text style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>返回竞技场</Text>
        </View>
      </View>
    );
  }

  const selectedCount = selectedTemplateIds.length;
  const todayBoss = getTodayBoss();
  const motherTag = StorageManager.getTodayKnowledgeTag();

  return (
    <View
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #581c87 0%, #be185d 50%, #dc2626 100%)',
        padding: '16px',
      }}
    >
      <View style={{ maxWidth: '720px', marginLeft: 'auto', marginRight: 'auto' }}>
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            paddingTop: '24px',
          }}
        >
          <View
            onClick={() => Taro.navigateBack()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#374151' }}>←</Text>
          </View>
          <View
            style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '8px 20px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Text style={{ fontSize: '20px' }}>🃏</Text>
            <Text style={{ fontWeight: 'bold', color: '#374151' }}>用今日卡牌复仇</Text>
          </View>
          <View
            style={{
              background: '#22c55e',
              padding: '8px 16px',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{energy} ⚡</Text>
          </View>
        </View>

        {motherTag ? (
          <View
            style={{
              background: 'rgba(250,204,21,0.25)',
              borderRadius: '14px',
              padding: '12px',
              marginBottom: '12px',
              border: '1px solid rgba(253,224,71,0.5)',
            }}
          >
            <Text style={{ color: '#fde68a', fontSize: '13px' }}>
              今日母题【{todayBoss.motherTopicSummary}】：匹配属性卡牌攻击 +10%
            </Text>
          </View>
        ) : null}

        <View
          style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '18px',
            padding: '16px',
            marginBottom: '14px',
          }}
        >
          <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>🃏 选择出战队伍（最多5张）</Text>
            <Text style={{ color: '#fde047', fontSize: '12px' }}>已选 {selectedCount}/5</Text>
          </View>

          {selectPool.map((card) => {
            const selected = selectedTemplateIds.includes(card.id);
            const cardDef = getCardById(card.id);
            return (
              <View
                key={card.id}
                onClick={() => toggleCardSelection(card.id)}
                style={{
                  marginBottom: '10px',
                  borderRadius: '14px',
                  padding: '12px',
                  background: selected ? 'rgba(59,130,246,0.35)' : 'rgba(15,23,42,0.45)',
                  border: selected ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                {cardDef ? (
                  <GameCard card={cardDef} size="sm" owned showInfo={false} />
                ) : (
                  <Text style={{ fontSize: '26px' }}>{card.avatar}</Text>
                )}
                <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', display: 'block' }}>
                  {card.name} {selected ? '（出战中）' : ''}
                </Text>
                <Text style={{ color: '#cbd5e1', fontSize: '12px', display: 'block' }}>
                  攻击 {card.attack} | 防御 {card.defense} | HP {card.baseHp}
                </Text>
                <Text style={{ color: '#fde047', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  主动技能：{card.skill.name}（{card.skill.type === 'damage' ? '伤害' : card.skill.type === 'heal' ? '治疗' : '增益'}）
                </Text>
                </View>
              </View>
            );
          })}

          <View style={{ display: 'flex', gap: '10px' }}>
            <View
              onClick={refreshSelectPool}
              style={{
                flex: 1,
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                background: 'rgba(255,255,255,0.2)',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>刷新卡池</Text>
            </View>
            <View
              onClick={startBattle}
              style={{
                flex: 1,
                borderRadius: '12px',
                padding: '12px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>开始队伍对战</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '18px',
            padding: '14px',
          }}
        >
          <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>📋 规则说明</Text>
          <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: '13px', lineHeight: 1.7 }}>
            • 队伍最多选择5张卡牌，双方卡牌将轮流出列自动对战{'\n'}
            • 每张卡牌普攻2次后自动释放1次主动技能{'\n'}
            • 主动技能分为伤害、治疗、增益三类{'\n'}
            • 先击败对方全部卡牌的一方获胜
          </Text>
        </View>
      </View>
    </View>
  );
}
