import { useState, useEffect, useCallback } from 'react';
import { X, Swords, Trophy, Zap, Flame, Sparkles, Skull, Shield, Heart } from 'lucide-react';
import { CARD_DATA, Card, getCardStats, SkillType } from '../types/card';
import { StorageManager } from '../utils/storage';

interface BattleCard {
  card: Card;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  shield: number;
  attackBuff: number;
  defenseBuff: number;
  attackDebuff: number;
  defenseDebuff: number;
  skillCooldown: number;
  stars: number;
  level: number;
}

interface FloatingDamage {
  id: number;
  value: number;
  x: number;
  y: number;
  type: 'damage' | 'heal' | 'skill' | 'miss' | 'critical';
}

interface SkillEffect {
  id: number;
  type: SkillType;
  emoji: string;
  x: number;
  y: number;
  scale: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface ScreenShake {
  intensity: number;
  duration: number;
}

interface EnhancedBattleProps {
  playerTeamIds: number[];
  opponentTeamIds?: number[];
  onClose: () => void;
  onBattleEnd: (won: boolean, coinsEarned: number) => void;
}

const CRITICAL_COLOR = '#ff6b6b';
const SKILL_COLOR = '#a78bfa';
const DAMAGE_COLOR = '#ef4444';
const HEAL_COLOR = '#4ade80';
const SHIELD_COLOR = '#60a5fa';

export function EnhancedBattle({ playerTeamIds, opponentTeamIds, onClose, onBattleEnd }: EnhancedBattleProps) {
  const [battleState, setBattleState] = useState<'matching' | 'battling' | 'result'>('matching');
  const [currentRound, setCurrentRound] = useState(0);
  const [playerCards, setPlayerCards] = useState<BattleCard[]>([]);
  const [opponentCards, setOpponentCards] = useState<BattleCard[]>([]);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<'player' | 'opponent' | null>(null);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [skillEffects, setSkillEffects] = useState<SkillEffect[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [screenShake, setScreenShake] = useState<ScreenShake>({ intensity: 0, duration: 0 });
  const [comboCount, setComboCount] = useState(0);
  const [lastHitWasCritical, setLastHitWasCritical] = useState(false);
  const [attackingCard, setAttackingCard] = useState<'player' | 'opponent' | null>(null);
  const [hitCard, setHitCard] = useState<'player' | 'opponent' | null>(null);
  const [lightningFlash, setLightningFlash] = useState(false);
  const [victoryParticles, setVictoryParticles] = useState<Particle[]>([]);

  const triggerScreenShake = useCallback((intensity: number, duration: number) => {
    setScreenShake({ intensity, duration });
    setTimeout(() => setScreenShake({ intensity: 0, duration: 0 }), duration);
  }, []);

  const spawnParticles = useCallback((x: number, y: number, count: number, colors: string[], isExplosion: boolean = false) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = isExplosion ? 3 + Math.random() * 5 : 1 + Math.random() * 3;
      newParticles.push({
        id: Date.now() + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isExplosion ? 2 : 0),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: isExplosion ? 4 + Math.random() * 6 : 2 + Math.random() * 4,
        life: 1,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (battleState === 'result' && winner === 'player') {
      const colors = ['#ffd700', '#ff6b6b', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];
      const newParticles: Particle[] = [];
      for (let i = 0; i < 100; i++) {
        newParticles.push({
          id: Date.now() + i,
          x: Math.random() * 100,
          y: -10,
          vx: (Math.random() - 0.5) * 4,
          vy: 2 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 8,
          life: 1,
        });
      }
      setVictoryParticles(newParticles);
    }
  }, [battleState, winner]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVictoryParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.05,
            life: p.life - 0.008,
          }))
          .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const [battleReady, setBattleReady] = useState(false);

  useEffect(() => {
    if (!playerTeamIds || playerTeamIds.length === 0) {
      setTimeout(() => onBattleEnd(false, 0), 500);
      return;
    }
    setTimeout(() => {
      initializeBattle();
      setBattleState('battling');
      setBattleReady(true);
    }, 2000);
  }, [playerTeamIds]);

  const initializeBattle = () => {
    const ownedCards = StorageManager.getOwnedCards();
    const pCards = playerTeamIds.map((id) => {
      const card = CARD_DATA.find((c) => c.id === id)!;
      const owned = ownedCards.find((c) => c.cardId === id);
      const stars = owned?.stars || 1;
      const level = owned?.level || 1;
      const stats = getCardStats(card, stars, level);

      return {
        card,
        hp: stats.defense * 15,
        maxHp: stats.defense * 15,
        attack: stats.attack,
        defense: stats.defense,
        shield: 0,
        attackBuff: 0,
        defenseBuff: 0,
        attackDebuff: 0,
        defenseDebuff: 0,
        skillCooldown: 0,
        stars,
        level,
      };
    });

    const opponentIds = opponentTeamIds || [...CARD_DATA].sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.id);
    const oCards = opponentIds.map((id) => {
      const card = CARD_DATA.find((c) => c.id === id)!;
      const stars = Math.floor(Math.random() * 3) + 1;
      const level = Math.floor(Math.random() * 3) + 1;
      const stats = getCardStats(card, stars, level);

      return {
        card,
        hp: stats.defense * 15,
        maxHp: stats.defense * 15,
        attack: stats.attack,
        defense: stats.defense,
        shield: 0,
        attackBuff: 0,
        defenseBuff: 0,
        attackDebuff: 0,
        defenseDebuff: 0,
        skillCooldown: 0,
        stars,
        level,
      };
    });

    setPlayerCards(pCards);
    setOpponentCards(oCards);
    setBattleLog(['⚔️ 战斗开始！']);

    setLightningFlash(true);
    setTimeout(() => setLightningFlash(false), 200);

    setTimeout(() => executeBattle(pCards, oCards), 1000);
  };

  const addFloatingDamage = (value: number, isPlayer: boolean, type: FloatingDamage['type'], isCritical: boolean = false) => {
    const id = Date.now() + Math.random();
    const newDamage: FloatingDamage = {
      id,
      value,
      x: isPlayer ? 20 + Math.random() * 15 : 65 + Math.random() * 15,
      y: 35 + Math.random() * 20,
      type: isCritical ? 'critical' : type,
    };
    setFloatingDamages(prev => [...prev, newDamage]);
    setTimeout(() => {
      setFloatingDamages(prev => prev.filter(d => d.id !== id));
    }, 1500);
  };

  const addSkillEffect = (skill: { type: SkillType; emoji: string }, isPlayer: boolean) => {
    const id = Date.now() + Math.random();
    const newEffect: SkillEffect = {
      id,
      type: skill.type,
      emoji: skill.emoji,
      x: isPlayer ? 30 : 70,
      y: 40,
      scale: 1.5,
    };
    setSkillEffects(prev => [...prev, newEffect]);
    setTimeout(() => {
      setSkillEffects(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  const executeSkill = (attacker: BattleCard, defender: BattleCard, isPlayer: boolean): { attacker: BattleCard; defender: BattleCard; log: string[] } => {
    const skill = attacker.card.skill;
    const logs: string[] = [];
    let newAttacker = { ...attacker };
    let newDefender = { ...defender };

    addSkillEffect(skill, isPlayer);
    logs.push(`${attacker.card.name} 使用了技能【${skill.name}】${skill.emoji}`);

    setLightningFlash(true);
    setTimeout(() => setLightningFlash(false), 150);

    const particleColors = skill.type === 'heal' ? ['#4ade80', '#22c55e', '#86efac'] :
                           skill.type === 'shield' ? ['#60a5fa', '#3b82f6', '#93c5fd'] :
                           ['#a78bfa', '#8b5cf6', '#c4b5fd'];

    spawnParticles(isPlayer ? 25 : 75, 45, 20, particleColors, true);

    switch (skill.type) {
      case 'damage':
        const skillDamage = Math.floor((attacker.attack * skill.value) / 100);
        const actualDamage = Math.max(0, skillDamage - newDefender.shield);
        newDefender.shield = Math.max(0, newDefender.shield - skillDamage);
        if (actualDamage > 0) {
          newDefender.hp -= actualDamage;
        }
        addFloatingDamage(skillDamage, !isPlayer, 'skill');
        logs.push(`💥 造成 ${skillDamage} 点技能伤害！`);
        triggerScreenShake(8, 300);
        break;

      case 'heal':
        const healAmount = Math.floor((newAttacker.maxHp * skill.value) / 100);
        newAttacker.hp = Math.min(newAttacker.maxHp, newAttacker.hp + healAmount);
        addFloatingDamage(healAmount, isPlayer, 'heal');
        logs.push(`💚 恢复了 ${healAmount} 点生命值！`);
        break;

      case 'shield':
        const shieldAmount = Math.floor((newAttacker.defense * skill.value) / 100);
        newAttacker.shield += shieldAmount;
        logs.push(`🛡️ 获得 ${shieldAmount} 点护盾！`);
        break;

      case 'buff_attack':
        newAttacker.attackBuff = skill.value;
        logs.push(`🔥 攻击力提升 ${skill.value}%！`);
        break;

      case 'buff_defense':
        newAttacker.defenseBuff = skill.value;
        logs.push(`🏰 防御力提升 ${skill.value}%！`);
        break;

      case 'debuff_attack':
        newDefender.attackDebuff = skill.value;
        logs.push(`⬇️ 降低对手 ${skill.value}% 攻击力！`);
        break;

      case 'debuff_defense':
        newDefender.defenseDebuff = skill.value;
        logs.push(`⬇️ 降低对手 ${skill.value}% 防御力！`);
        break;

      case 'multi_attack':
        const hits = 3;
        let totalDamage = 0;
        for (let i = 0; i < hits; i++) {
          const hitDamage = Math.floor((attacker.attack * skill.value) / 100);
          const actualHit = Math.max(0, hitDamage - newDefender.shield);
          newDefender.shield = Math.max(0, newDefender.shield - hitDamage);
          if (actualHit > 0) {
            newDefender.hp -= actualHit;
          }
          totalDamage += hitDamage;
          setTimeout(() => {
            addFloatingDamage(hitDamage, !isPlayer, 'damage');
            spawnParticles(isPlayer ? 75 : 25, 45, 8, ['#ef4444', '#f97316', '#fbbf24'], true);
          }, i * 300);
        }
        logs.push(`💥 连续攻击${hits}次，共造成 ${totalDamage} 点伤害！`);
        triggerScreenShake(12, 500);
        break;

      case 'counter':
        newAttacker.defenseBuff = skill.value;
        logs.push(`🔄 进入反击状态，将反弹 ${skill.value}% 伤害！`);
        break;

      case 'pierce':
        const pierceDamage = Math.floor(attacker.attack * (1 + skill.value / 100));
        newDefender.hp -= pierceDamage;
        addFloatingDamage(pierceDamage, !isPlayer, 'skill');
        logs.push(`🎯 穿透攻击造成 ${pierceDamage} 点伤害！`);
        triggerScreenShake(10, 300);
        break;
    }

    newAttacker.skillCooldown = skill.cooldown;
    return { attacker: newAttacker, defender: newDefender, log: logs };
  };

  const executeBattle = (pCards: BattleCard[], oCards: BattleCard[]) => {
    let playerTeam = [...pCards];
    let opponentTeam = [...oCards];
    let round = 1;
    let logs: string[] = ['⚔️ 战斗开始！'];
    let combo = 0;

    const battleInterval = setInterval(() => {
      if (playerTeam.length === 0 || opponentTeam.length === 0) {
        clearInterval(battleInterval);
        const playerWon = playerTeam.length > 0;
        setWinner(playerWon ? 'player' : 'opponent');
        setBattleState('result');

        const coinsEarned = playerWon ? 50 + playerTeam.length * 20 : 0;
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

      logs.push(`\n【第${round}回合】`);
      setCurrentRound(round);

      const pCard = playerTeam[0];
      const oCard = opponentTeam[0];

      setCurrentAction(`${pCard.card.name} VS ${oCard.card.name}`);
      logs.push(`${pCard.card.name} VS ${oCard.card.name}`);

      let newPCard = { ...pCard };
      let newOCard = { ...oCard };

      if (newPCard.skillCooldown > 0) {
        newPCard.skillCooldown--;
      }
      if (newOCard.skillCooldown > 0) {
        newOCard.skillCooldown--;
      }

      let isCritical = false;
      let hitCombo = combo;

      if (newPCard.skillCooldown === 0 && Math.random() < 0.35) {
        setAttackingCard('player');
        setTimeout(() => setAttackingCard(null), 400);

        const skillResult = executeSkill(newPCard, newOCard, true);
        newPCard = skillResult.attacker;
        newOCard = skillResult.defender;
        logs.push(...skillResult.log);
        hitCombo = 0;
      } else {
        setAttackingCard('player');
        setTimeout(() => {
          setAttackingCard(null);
          setHitCard('opponent');
          setTimeout(() => setHitCard(null), 200);
        }, 300);

        const buffedAttack = Math.floor(newPCard.attack * (1 + newPCard.attackBuff / 100) * (1 - newPCard.attackDebuff / 100));
        isCritical = Math.random() < 0.15;
        let damage = Math.floor(buffedAttack * (0.9 + Math.random() * 0.2));
        if (isCritical) {
          damage = Math.floor(damage * 1.5);
          hitCombo++;
          setComboCount(hitCombo);
          setLastHitWasCritical(true);
        }
        const actualDamage = Math.max(0, damage - newOCard.shield);

        newOCard.shield = Math.max(0, newOCard.shield - damage);
        if (actualDamage > 0) {
          newOCard.hp -= actualDamage;
        }

        spawnParticles(75, 45, isCritical ? 25 : 12, isCritical ? ['#ff6b6b', '#ffd700', '#ff8c00'] : ['#ef4444', '#f97316'], true);
        addFloatingDamage(damage, false, 'damage', isCritical);
        logs.push(`${newPCard.card.name} 攻击${isCritical ? '💥暴击！' : ''}造成 ${damage} 伤害`);

        if (isCritical || hitCombo > 1) {
          triggerScreenShake(isCritical ? 10 : 4, isCritical ? 400 : 200);
        } else {
          triggerScreenShake(3, 150);
        }
      }

      if (newOCard.hp > 0) {
        const isOppCritical = Math.random() < 0.15;
        if (newOCard.skillCooldown === 0 && Math.random() < 0.35) {
          setAttackingCard('opponent');
          setTimeout(() => setAttackingCard(null), 400);

          const skillResult = executeSkill(newOCard, newPCard, false);
          newOCard = skillResult.attacker;
          newPCard = skillResult.defender;
          logs.push(...skillResult.log);
        } else {
          setAttackingCard('opponent');
          setTimeout(() => {
            setAttackingCard(null);
            setHitCard('player');
            setTimeout(() => setHitCard(null), 200);
          }, 300);

          const buffedAttack = Math.floor(newOCard.attack * (1 + newOCard.attackBuff / 100) * (1 - newOCard.attackDebuff / 100));
          let damage = Math.floor(buffedAttack * (0.9 + Math.random() * 0.2));
          if (isOppCritical) {
            damage = Math.floor(damage * 1.5);
          }
          const actualDamage = Math.max(0, damage - newPCard.shield);

          newPCard.shield = Math.max(0, newPCard.shield - damage);
          if (actualDamage > 0) {
            newPCard.hp -= actualDamage;
          }

          spawnParticles(25, 45, isOppCritical ? 25 : 12, isOppCritical ? ['#ff6b6b', '#ffd700', '#ff8c00'] : ['#ef4444', '#f97316'], true);
          addFloatingDamage(damage, true, 'damage', isOppCritical);
          logs.push(`${newOCard.card.name} 攻击${isOppCritical ? '💥暴击！' : ''}造成 ${damage} 伤害`);

          triggerScreenShake(isOppCritical ? 10 : 3, isOppCritical ? 400 : 150);
        }
      }

      if (newOCard.hp <= 0) {
        logs.push(`✨ ${newOCard.card.name} 被击败了！`);
        spawnParticles(75, 50, 40, ['#ffd700', '#ff6b6b', '#a78bfa', '#60a5fa'], true);
        opponentTeam.shift();
      }
      if (newPCard.hp <= 0) {
        logs.push(`💥 ${newPCard.card.name} 被击败了！`);
        spawnParticles(25, 50, 40, ['#ffd700', '#ff6b6b', '#a78bfa', '#60a5fa'], true);
        playerTeam.shift();
      }

      if (newPCard.hp > 0) playerTeam[0] = newPCard;
      if (newOCard.hp > 0) opponentTeam[0] = newOCard;

      setPlayerCards([...playerTeam]);
      setOpponentCards([...opponentTeam]);
      setBattleLog([...logs]);
      round++;
    }, 2000);

    return () => clearInterval(battleInterval);
  };

  const shakeStyle = screenShake.intensity > 0 ? {
    transform: `translate(${(Math.random() - 0.5) * screenShake.intensity}px, ${(Math.random() - 0.5) * screenShake.intensity}px)`,
    transition: `transform ${screenShake.duration}ms`,
  } : {};

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-hidden">
      {/* 动态背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 transition-opacity duration-300 ${lightningFlash ? 'opacity-100' : 'opacity-80'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* 背景光效 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* 背景粒子 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 闪电效果 */}
      {lightningFlash && (
        <div className="absolute inset-0 bg-white/30 pointer-events-none z-40" />
      )}

      {/* 粒子效果 */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none z-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.life,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}

      {/* 胜利粒子 */}
      {victoryParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none z-40"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.life,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}

      <div
        className="relative bg-gradient-to-br from-purple-900/90 via-pink-800/90 to-red-900/90 rounded-3xl p-6 max-w-6xl w-full max-h-[95vh] overflow-y-auto backdrop-blur-xl border-2 border-white/20 shadow-2xl"
        style={shakeStyle}
      >
        {/* 匹配中 */}
        {battleState === 'matching' && (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <Swords className="size-24 text-white animate-pulse" />
              <div className="absolute inset-0 bg-purple-500/50 rounded-full blur-xl animate-ping" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 animate-pulse">正在匹配对手...</h2>
            <p className="text-white/80">激烈战斗即将开始！</p>
            <div className="mt-6 flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 战斗中 */}
        {battleState === 'battling' && battleReady && (
          <>
            {/* 头部信息栏 */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <Swords className="size-6 text-yellow-400" />
                <span className="text-2xl font-bold text-white">第 {currentRound} 回合</span>
              </div>
              <div className="text-center">
                <div className="text-white/90 text-lg font-bold">
                  {currentAction}
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                <X className="size-5 text-white" />
              </button>
            </div>

            {/* 连击显示 */}
            {comboCount > 1 && (
              <div className="text-center mb-4">
                <span className="text-3xl font-bold text-yellow-400 animate-bounce">
                  {comboCount} COMBO!
                </span>
                {lastHitWasCritical && (
                  <span className="ml-2 text-xl text-red-400 font-bold">💥</span>
                )}
              </div>
            )}

            {/* 战场区域 - 左右对称布局 */}
            <div className="flex items-center justify-between gap-4 mb-6">
              {/* 玩家队伍 */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-blue-400" />
                  我的队伍
                </h3>
                <div className="space-y-2">
                  {playerCards.map((battleCard, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-r ${battleCard.card.color} rounded-xl p-3 transition-all duration-300 ${
                        index === 0 ? 'ring-2 ring-yellow-400' : 'opacity-50'
                      } ${attackingCard === 'player' && index === 0 ? 'animate-pulse' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{battleCard.card.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm truncate">{battleCard.card.name}</span>
                            <span className="text-xs text-yellow-300">{battleCard.stars}⭐</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-white/80">⚔️ {battleCard.attack}</span>
                            <span className="text-xs text-white/80">🛡️ {battleCard.defense}</span>
                            {battleCard.shield > 0 && (
                              <span className="text-xs text-blue-300">🛡️+{battleCard.shield}</span>
                            )}
                          </div>
                          <div className="mt-1 bg-black/30 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                battleCard.hp / battleCard.maxHp > 0.5 ? 'bg-green-500' :
                                battleCard.hp / battleCard.maxHp > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(0, (battleCard.hp / battleCard.maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/60">HP</div>
                          <div className="font-bold text-white">{Math.max(0, battleCard.hp)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VS 标志 */}
              <div className="flex flex-col items-center justify-center px-4">
                <div className="text-4xl font-bold text-white/50 animate-pulse">VS</div>
              </div>

              {/* 对手队伍 */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2 justify-end">
                  对手队伍
                  <Skull className="size-4 text-red-400" />
                </h3>
                <div className="space-y-2">
                  {opponentCards.map((battleCard, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-l ${battleCard.card.color} rounded-xl p-3 transition-all duration-300 ${
                        index === 0 ? 'ring-2 ring-red-400' : 'opacity-50'
                      } ${attackingCard === 'opponent' && index === 0 ? 'animate-pulse' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-white/60">HP</div>
                          <div className="font-bold text-white">{Math.max(0, battleCard.hp)}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-yellow-300">{battleCard.stars}⭐</span>
                            <span className="font-bold text-white text-sm truncate">{battleCard.card.name}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 justify-end">
                            {battleCard.shield > 0 && (
                              <span className="text-xs text-blue-300">🛡️+{battleCard.shield}</span>
                            )}
                            <span className="text-xs text-white/80">🛡️ {battleCard.defense}</span>
                            <span className="text-xs text-white/80">⚔️ {battleCard.attack}</span>
                          </div>
                          <div className="mt-1 bg-black/30 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ml-auto ${
                                battleCard.hp / battleCard.maxHp > 0.5 ? 'bg-green-500' :
                                battleCard.hp / battleCard.maxHp > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(0, (battleCard.hp / battleCard.maxHp) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-3xl">{battleCard.card.emoji}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 飘字效果 */}
            <div className="relative h-0">
              {floatingDamages.map((damage) => (
                <div
                  key={damage.id}
                  className="absolute text-4xl font-bold animate-ping"
                  style={{
                    left: damage.x > 50 ? '60%' : '30%',
                    top: '40%',
                    color: damage.type === 'heal' ? '#4ade80' :
                           damage.type === 'critical' ? '#ff6b6b' :
                           damage.type === 'skill' ? '#a78bfa' : '#ef4444',
                    textShadow: '0 0 10px currentColor',
                  }}
                >
                  {damage.type === 'heal' ? '+' : '-'}
                  {damage.value}
                </div>
              ))}
            </div>
          </>
        )}

        {/* 战斗结果 */}
        {battleState === 'result' && (
          <div className="text-center py-12 relative z-10">
            {winner === 'player' ? (
              <>
                <div className="relative inline-block">
                  <Trophy className="size-32 text-yellow-400 mx-auto mb-6 animate-bounce drop-shadow-lg" />
                  <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-2xl animate-ping" />
                </div>
                <h2 className="text-6xl font-bold text-white mb-4 animate-pulse drop-shadow-lg">
                  🎉 胜利！🎉
                </h2>
                <p className="text-2xl text-white/90 mb-6 animate-pulse">恭喜你击败了对手！</p>
                <div className="flex justify-center gap-4 mb-6">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                      {['⭐', '🏆', '💎'][i]}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="text-8xl mb-6 animate-pulse">💪</div>
                <h2 className="text-5xl font-bold text-white mb-4">继续加油！</h2>
                <p className="text-2xl text-white/90 mb-6">虽然失败了，但你已经很棒了！</p>
              </>
            )}

            <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/20 max-w-2xl mx-auto mb-6">
              <div className="text-sm text-white/90 space-y-1 font-mono max-h-64 overflow-y-auto">
                {battleLog.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>

            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white px-12 py-4 rounded-xl text-xl font-bold hover:scale-105 transition-transform shadow-2xl shadow-purple-500/50 animate-pulse"
            >
              返回
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-30px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.8);
          }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
}