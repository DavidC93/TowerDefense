import { GOAL, GRID_SIZE, START, TILE, LOCKED_TOWER_TILES, STARTING_UNLOCKED_TOWER_TILES, getBuildingConfig, getTowerDisplayName, getTowerRuntimeConfig } from './config.js';

const PASSIVE_SKILL_KEYS = ['tower_damage', 'tower_fire_rate', 'tower_range', 'tower_money'];
const ACTIVE_SKILL_KEYS = ['toxic_gas', 'glue_bomb', 'phosphorus_bomb'];
const CHOICE_TYPE_SKILL = 'skill';
const CHOICE_TYPE_UNLOCK_TOWER = 'unlock_tower';

export function createSimulation(api) {
  function getConfig() { return api.getConfig(); }
  function getState() { return api.getState(); }

  function createEmptyGrid() { return Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => TILE.EMPTY)); }
  function getEnemyLevelForWave(wave) { const every = Math.max(1, Number(getConfig().enemies.global.levelEveryWaves) || 1); return Math.floor((wave - 1) / every) + 1; }
  function getWaveEnemyCount(wave) { return Number(getConfig().enemies.global.waveEnemyBase) + Math.floor(wave * Number(getConfig().enemies.global.waveEnemyGrowth)); }
  function getSpecialWaveSpawns(wave) { const spawns = []; if (wave % 6 === 0) { spawns.push('miniboss'); spawns.push('boss'); } else if (wave % 3 === 0) { spawns.push('miniboss'); } return spawns; }
  function getSpawnDelay(wave) { const g = getConfig().enemies.global; return Math.max(Number(g.spawnDelayMin), Number(g.spawnDelayBase) - wave * Number(g.spawnDelayWaveDelta)); }
  function getIntermissionDuration(wave) { const g = getConfig().enemies.global; return Math.max(Number(g.intermissionMin), Number(g.intermissionBase) - wave * Number(g.intermissionWaveDelta)); }
  function getWaveCountdownDuration() { return Math.max(0, Number(getConfig().enemies.global.countdownSeconds ?? 3)); }
  function getEnemyConfig(type) { return getConfig().enemies[type]; }

  function keyOf(x, y) { return x + ',' + y; }
  function inBounds(x, y) { return x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function cloneGrid(grid) { return grid.map((row) => row.slice()); }
  function isBlocked(grid, x, y) {
    if (!inBounds(x, y)) return true;
    if ((x === START.x && y === START.y) || (x === GOAL.x && y === GOAL.y)) return false;
    return grid[y][x] !== TILE.EMPTY;
  }
  function findPath(grid, start, goal) {
    const queue = [start], visited = new Set([keyOf(start.x, start.y)]), parents = new Map(), dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let head = 0;
    while (head < queue.length) {
      const current = queue[head++];
      if (current.x === goal.x && current.y === goal.y) {
        const path = [];
        let cursor = current;
        while (cursor) { path.push(cursor); cursor = parents.get(keyOf(cursor.x, cursor.y)) || null; }
        return path.reverse();
      }
      for (const [dx, dy] of dirs) {
        const nx = current.x + dx, ny = current.y + dy, k = keyOf(nx, ny);
        if (!inBounds(nx, ny) || visited.has(k) || isBlocked(grid, nx, ny)) continue;
        visited.add(k); parents.set(k, current); queue.push({ x: nx, y: ny });
      }
    }
    return null;
  }
  function chooseEnemyType() {
    const options = ['grunt', 'fast', 'tank', 'flyer', 'flyer_heavy'].map((type) => ({ type, weight: Number(getConfig().enemies[type].spawnWeight) })).filter((x) => x.weight > 0);
    const total = options.reduce((sum, item) => sum + item.weight, 0);
    if (total <= 0) return 'grunt';
    let roll = Math.random() * total;
    for (const item of options) { roll -= item.weight; if (roll <= 0) return item.type; }
    return options[options.length - 1].type;
  }
  function createUnlockedTowerState() {
    const unlockedTowers = Object.fromEntries(LOCKED_TOWER_TILES.map((tile) => [tile, false]));
    for (const tile of STARTING_UNLOCKED_TOWER_TILES) unlockedTowers[tile] = true;
    return unlockedTowers;
  }
  function createSkillState() {
    const levels = Object.fromEntries([...PASSIVE_SKILL_KEYS, ...ACTIVE_SKILL_KEYS].map((key) => [key, 0]));
    const cooldowns = Object.fromEntries(ACTIVE_SKILL_KEYS.map((key) => [key, 0]));
    return { levels, cooldowns, choices: [], activeEffects: [], pendingTargetSkill: null, selectionWave: null, totalSelections: 0, unlockedTowers: createUnlockedTowerState() };
  }
  function isTowerUnlocked(tile) { return Boolean(getState().skills?.unlockedTowers?.[tile]); }
  function listLockedTowerChoices() {
    return LOCKED_TOWER_TILES.filter((tile) => !isTowerUnlocked(tile)).map((tile) => ({
      type: CHOICE_TYPE_UNLOCK_TOWER,
      key: tile,
      label: getTowerDisplayName(getConfig(), tile),
    }));
  }
  function getSkillLevel(skillKey) { return Number(getState().skills?.levels?.[skillKey] || 0); }
  function getPassiveBonusPct(skillKey) {
    const cfg = getConfig().skills?.[skillKey];
    return getSkillLevel(skillKey) * Number(cfg?.valuePerLevelPct || 0);
  }
  function getSkillDefinition(skillKey) { return getConfig().skills?.[skillKey] || null; }
  function getActiveSkillDamageMultiplier(skillKey) {
    const cfg = getSkillDefinition(skillKey);
    const wave = Math.max(1, Number(getState().wave || 1));
    return 1 + (wave * Number(cfg?.waveDamageMultiplierPct || 0) / 100);
  }
  function getActiveSkillStats(skillKey) {
    const level = getSkillLevel(skillKey);
    const cfg = getSkillDefinition(skillKey);
    if (!cfg) return null;
    const damageMultiplier = getActiveSkillDamageMultiplier(skillKey);
    if (skillKey === 'toxic_gas') return { radius: Number(cfg.radius || 0), duration: Number(cfg.duration || 0) + Math.max(0, level - 1) * Number(cfg.durationPerLevel || 0), dps: (Number(cfg.dps || 0) + Math.max(0, level - 1) * Number(cfg.dpsPerLevel || 0)) * damageMultiplier, damageMultiplier, cooldown: Math.max(1, Number(cfg.cooldown || 0) - Math.max(0, level - 1) * Number(cfg.cooldownReductionPerLevel || 0)) };
    if (skillKey === 'glue_bomb') return { slowPct: Number(cfg.slowPct || 0) + Math.max(0, level - 1) * Number(cfg.slowPctPerLevel || 0), duration: Number(cfg.duration || 0) + Math.max(0, level - 1) * Number(cfg.durationPerLevel || 0), damageMultiplier, cooldown: Math.max(1, Number(cfg.cooldown || 0) - Math.max(0, level - 1) * Number(cfg.cooldownReductionPerLevel || 0)) };
    if (skillKey === 'phosphorus_bomb') return { burnDps: (Number(cfg.burnDps || 0) + Math.max(0, level - 1) * Number(cfg.burnDpsPerLevel || 0)) * damageMultiplier, damageMultiplier, burnDuration: Number(cfg.burnDuration || 0) + Math.max(0, level - 1) * Number(cfg.burnDurationPerLevel || 0), tileDuration: Number(cfg.tileDuration || 0) + Math.max(0, level - 1) * Number(cfg.tileDurationPerLevel || 0), cooldown: Math.max(1, Number(cfg.cooldown || 0) - Math.max(0, level - 1) * Number(cfg.cooldownReductionPerLevel || 0)) };
    return null;
  }
  function listAvailableSkills() { return [...PASSIVE_SKILL_KEYS, ...ACTIVE_SKILL_KEYS]; }
  function shuffle(array) {
    const pool = array.slice();
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }
  function buildSkillChoices() {
    const totalChoices = Math.max(1, Math.round(Number(getConfig().skills?.progression?.choicesPerOffer) || 3));
    const lockedTowerChoices = listLockedTowerChoices();
    const choices = [];
    if (lockedTowerChoices.length > 0) choices.push(shuffle(lockedTowerChoices)[0]);
    const regularChoiceCount = Math.max(0, Math.min(listAvailableSkills().length, totalChoices - choices.length));
    const regularChoices = shuffle(listAvailableSkills()).slice(0, regularChoiceCount).map((skillKey) => ({ type: CHOICE_TYPE_SKILL, key: skillKey }));
    return shuffle([...choices, ...regularChoices]);
  }
  function queueSkillChoiceForWave(wave) {
    const state = getState();
    state.skills.choices = buildSkillChoices();
    state.skills.selectionWave = wave;
    state.pendingSkillChoice = true;
  }
  function chooseSkill(choiceIndex) {
    const state = getState();
    const choice = state.skills.choices?.[choiceIndex];
    if (!choice) return false;
    if (choice.type === CHOICE_TYPE_UNLOCK_TOWER) state.skills.unlockedTowers[choice.key] = true;
    else if (choice.type === CHOICE_TYPE_SKILL && listAvailableSkills().includes(choice.key)) state.skills.levels[choice.key] = Number(state.skills.levels[choice.key] || 0) + 1;
    else return false;
    state.skills.choices = [];
    state.skills.selectionWave = null;
    state.skills.totalSelections = Number(state.skills.totalSelections || 0) + 1;
    state.pendingSkillChoice = false;
    state.preWaveCountdown = getWaveCountdownDuration();
    return choice;
  }
  function setPendingTargetSkill(skillKey) {
    const state = getState();
    const level = getSkillLevel(skillKey);
    if (level <= 0) return false;
    if (Number(state.skills.cooldowns?.[skillKey] || 0) > 0) return false;
    state.skills.pendingTargetSkill = skillKey;
    return true;
  }
  function clearPendingTargetSkill() { getState().skills.pendingTargetSkill = null; }
  function castPendingSkillAt(x, y) {
    const state = getState();
    const skillKey = state.skills.pendingTargetSkill;
    if (!skillKey) return false;
    const stats = getActiveSkillStats(skillKey);
    if (!stats) return false;
    const nowSec = performance.now() / 1000;
    if (skillKey === 'toxic_gas') state.skills.activeEffects.push({ kind: 'toxic_gas', x, y, ttl: stats.duration, radius: stats.radius, dps: stats.dps });
    if (skillKey === 'glue_bomb') state.skills.activeEffects.push({ kind: 'glue_bomb', x, y, ttl: stats.duration, slowPct: stats.slowPct });
    if (skillKey === 'phosphorus_bomb') state.skills.activeEffects.push({ kind: 'phosphorus_bomb', x, y, ttl: stats.tileDuration, burnDps: stats.burnDps, burnDuration: stats.burnDuration });
    state.skills.cooldowns[skillKey] = stats.cooldown;
    state.skills.pendingTargetSkill = null;
    state.skills.lastCastAt = nowSec;
    return true;
  }
  function spawnEnemy(id, wave, grid, forcedType = null) {
    const type = forcedType || chooseEnemyType(), enemyCfg = getEnemyConfig(type), level = getEnemyLevelForWave(wave);
    const hpMultiplier = 1 + ((level - 1) * Number(enemyCfg.hpPerLevelPct) / 100);
    const rewardMultiplier = 1 + ((level - 1) * Number(enemyCfg.rewardPerLevelPct) / 100);
    const reward = Math.round(Number(enemyCfg.baseReward) * rewardMultiplier);
    const isFlying = type === 'flyer' || type === 'flyer_heavy';
    const path = isFlying ? [START, GOAL] : (findPath(grid, START, GOAL) || [START, GOAL]);
    const hp = Math.round(Number(enemyCfg.baseHp) * (1 + ((wave - 1) * Number(enemyCfg.hpPerWavePct) / 100)) * hpMultiplier);
    return { id, type, x: START.x, y: START.y, hp, maxHp: hp, baseSpeed: Number(enemyCfg.speed) + Math.min(Number(getConfig().enemies.global.speedPerWaveCap), wave * Number(getConfig().enemies.global.speedPerWave)), speed: 0, reward, level, path, pathIndex: path.length > 1 ? 1 : 0, slowFactor: 1, slowUntil: 0, burnDps: 0, burnUntil: 0, isFlying };
  }
  function rebuildEnemyPath(enemy, grid) {
    if (enemy.isFlying) return { ...enemy, path: [START, GOAL], pathIndex: 1 };
    const cellX = clamp(Math.round(enemy.x), 0, GRID_SIZE - 1), cellY = clamp(Math.round(enemy.y), 0, GRID_SIZE - 1);
    const path = findPath(grid, { x: cellX, y: cellY }, GOAL);
    if (!path || path.length === 0) return enemy;
    return { ...enemy, path, pathIndex: path.length > 1 ? 1 : 0 };
  }
  function rebuildAllEnemyPaths() { const state = getState(); state.enemies = state.enemies.map((enemy) => rebuildEnemyPath(enemy, state.grid)); }
  function applySlow(enemy, slowPct, duration, nowSec) {
    const factor = Math.max(0.1, 1 - (Number(slowPct) / 100));
    if (nowSec + duration > (enemy.slowUntil || 0) || factor < (enemy.slowFactor || 1)) { enemy.slowFactor = factor; enemy.slowUntil = nowSec + Number(duration); }
  }
  function applyBurn(enemy, dps, duration, nowSec) {
    enemy.burnDps = Math.max(Number(enemy.burnDps || 0), Number(dps || 0));
    enemy.burnUntil = Math.max(Number(enemy.burnUntil || 0), nowSec + Number(duration || 0));
  }
  function updateEnemyStatus(nowSec, dt = 0) {
    const state = getState();
    for (const enemy of state.enemies) {
      if ((enemy.slowUntil || 0) <= nowSec) enemy.slowFactor = 1;
      if ((enemy.burnUntil || 0) > nowSec && Number(enemy.burnDps || 0) > 0) enemy.hp -= Number(enemy.burnDps) * dt;
      else enemy.burnDps = 0;
      enemy.speed = enemy.baseSpeed * (enemy.slowFactor || 1);
    }
  }
  function updateSkillEffects(dt, nowSec) {
    const state = getState();
    for (const skillKey of ACTIVE_SKILL_KEYS) state.skills.cooldowns[skillKey] = Math.max(0, Number(state.skills.cooldowns[skillKey] || 0) - dt);
    const nextEffects = [];
    for (const effect of state.skills.activeEffects) {
      const next = { ...effect, ttl: Number(effect.ttl || 0) - dt };
      if (effect.kind === 'toxic_gas') {
        for (const enemy of state.enemies) if (Math.hypot(enemy.x - effect.x, enemy.y - effect.y) <= Number(effect.radius || 0)) enemy.hp -= Number(effect.dps || 0) * dt;
      } else if (effect.kind === 'glue_bomb') {
        for (const enemy of state.enemies) {
          if (Math.abs(enemy.x - effect.x) <= 0.5 && Math.abs(enemy.y - effect.y) <= 0.5) applySlow(enemy, Number(effect.slowPct || 0), dt + 0.05, nowSec);
        }
      } else if (effect.kind === 'phosphorus_bomb') {
        for (const enemy of state.enemies) {
          if (Math.abs(enemy.x - effect.x) <= 0.5 && Math.abs(enemy.y - effect.y) <= 0.5) applyBurn(enemy, Number(effect.burnDps || 0), Number(effect.burnDuration || 0), nowSec);
        }
      }
      if (next.ttl > 0) nextEffects.push(next);
    }
    state.skills.activeEffects = nextEffects;
  }
  function moveEnemy(enemy, dt) {
    const next = { ...enemy }; let travel = next.speed * dt;
    while (travel > 0) {
      if (!next.path || next.pathIndex >= next.path.length) return { enemy: next, leaked: true };
      const target = next.path[next.pathIndex], dx = target.x - next.x, dy = target.y - next.y, distance = Math.hypot(dx, dy);
      if (distance < 0.0001) { next.x = target.x; next.y = target.y; next.pathIndex += 1; continue; }
      const step = Math.min(travel, distance);
      next.x += (dx / distance) * step; next.y += (dy / distance) * step; travel -= step;
      if (step === distance) { next.x = target.x; next.y = target.y; next.pathIndex += 1; }
    }
    if (Math.round(next.x) === GOAL.x && Math.round(next.y) === GOAL.y && next.pathIndex >= next.path.length) return { enemy: next, leaked: true };
    return { enemy: next, leaked: false };
  }
  function updateEnemies(dt) {
    const state = getState();
    const survivors = []; let leakedNow = 0;
    for (const enemy of state.enemies) {
      const result = moveEnemy(enemy, dt);
      if (result.leaked) leakedNow += 1; else survivors.push(result.enemy);
    }
    state.enemies = survivors; state.leaked += leakedNow;
  }
  function canTowerHitEnemy(towerOrType, enemy) {
    const tower = typeof towerOrType === 'string' ? { type: towerOrType } : towerOrType;
    const cfg = getTowerRuntimeConfig(getConfig(), tower, tower?.type);
    if (!cfg) return false;
    const canHitAir = Boolean(Number(cfg.canHitAir ?? 0));
    const airOnly = Boolean(Number(cfg.airOnly ?? 0));
    if (enemy.isFlying) return canHitAir;
    if (airOnly) return false;
    return true;
  }
  function getTowerRange(tower, tileType) {
    const cfg = getTowerRuntimeConfig(getConfig(), tower, tileType);
    if (!cfg) return 0;
    const baseRange = Number(cfg.range ?? cfg.flameLength ?? 0);
    const passiveBonus = getPassiveBonusPct('tower_range');
    return baseRange * (1 + passiveBonus / 100);
  }
  function getEnemyRemainingDistance(enemy) {
    if (!enemy.path || enemy.path.length === 0 || enemy.pathIndex >= enemy.path.length) return Math.hypot(GOAL.x - enemy.x, GOAL.y - enemy.y);
    let remaining = 0;
    const nextWaypoint = enemy.path[enemy.pathIndex];
    remaining += Math.hypot(nextWaypoint.x - enemy.x, nextWaypoint.y - enemy.y);
    for (let i = enemy.pathIndex; i < enemy.path.length - 1; i += 1) {
      const from = enemy.path[i];
      const to = enemy.path[i + 1];
      remaining += Math.hypot(to.x - from.x, to.y - from.y);
    }
    return remaining;
  }
  function chooseTarget(towerX, towerY, range, tower) {
    const state = getState();
    let bestEnemy = null, bestRemainingDistance = Infinity, bestDistanceFromTower = Infinity;
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0 || !canTowerHitEnemy(tower, enemy)) continue;
      const distanceFromTower = Math.hypot(enemy.x - towerX, enemy.y - towerY);
      if (distanceFromTower > range) continue;
      const remainingDistance = getEnemyRemainingDistance(enemy);
      if (remainingDistance < bestRemainingDistance - 0.0001 || (Math.abs(remainingDistance - bestRemainingDistance) <= 0.0001 && distanceFromTower < bestDistanceFromTower)) {
        bestEnemy = enemy;
        bestRemainingDistance = remainingDistance;
        bestDistanceFromTower = distanceFromTower;
      }
    }
    return bestEnemy;
  }
  function getAdjacentBuffs(x, y) {
    const state = getState();
    let damageBuffPct = 0; let fireRateBuffPct = 0;
    for (let oy = -1; oy <= 1; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        if (ox === 0 && oy === 0) continue;
        const neighbor = state.towers[keyOf(x + ox, y + oy)];
        if (!neighbor || neighbor.type !== TILE.TOWER_BUFFER) continue;
        const cfg = getBuildingConfig(getConfig(), TILE.TOWER_BUFFER), level = Number(neighbor.level || 0), bonusUpgrade = Number(cfg.upgradeDamagePct || 0) * level;
        damageBuffPct += Number(cfg.damageBuffPct || 0) + bonusUpgrade;
        fireRateBuffPct += Number(cfg.fireRateBuffPct || 0) + bonusUpgrade;
      }
    }
    return { damageBuffPct, fireRateBuffPct };
  }
  function getTowerDamage(tower, tileType, x, y) {
    const cfg = getTowerRuntimeConfig(getConfig(), tower, tileType);
    if (!cfg) return 0;
    const baseDamage = Number(tower.baseDamage ?? tower.damage ?? cfg.damage ?? 0);
    if (tileType === TILE.TOWER_BUFFER || x == null || y == null) return baseDamage;
    const buffs = getAdjacentBuffs(x, y);
    const passiveBonus = getPassiveBonusPct('tower_damage');
    return Math.round(baseDamage * (1 + (buffs.damageBuffPct + passiveBonus) / 100));
  }
  function getTowerSlowPct(tower, tileType) {
    const cfg = getTowerRuntimeConfig(getConfig(), tower, tileType);
    if (!cfg) return 0;
    return Number(cfg.slowPct || 0) + (Number(tower.level || 0) * Number(cfg.slowUpgradePct || 0));
  }
  function getTowerFireRate(tower, tileType, x, y) {
    const cfg = getTowerRuntimeConfig(getConfig(), tower, tileType);
    if (!cfg) return 0;
    const buffs = tileType === TILE.TOWER_BUFFER ? { fireRateBuffPct: 0 } : getAdjacentBuffs(x, y);
    const passiveBonus = getPassiveBonusPct('tower_fire_rate');
    const totalBonusPct = buffs.fireRateBuffPct + passiveBonus;
    return Math.max(1, Number(cfg.fireRate || 60) * (1 + (totalBonusPct / 100)));
  }
  function getTowerFireInterval(tower, tileType, x, y) {
    const rpm = getTowerFireRate(tower, tileType, x, y);
    return Math.max(0.04, 60 / Math.max(1, rpm));
  }
  function pointLineDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
    const dot = A * C + B * D, lenSq = C * C + D * D; let t = lenSq ? dot / lenSq : -1;
    t = Math.max(0, Math.min(1, t));
    const ex = x1 + t * C, ey = y1 + t * D;
    return Math.hypot(px - ex, py - ey);
  }
  function updateTowers(dt, nowSec) {
    const state = getState();
    for (const key of Object.keys(state.towers)) {
      const tower = state.towers[key], [x, y] = key.split(',').map(Number), config = getTowerRuntimeConfig(getConfig(), tower, tower.type);
      if (!config) continue;
      tower.cooldown = Math.max(0, tower.cooldown - dt);
      tower.recoil = Math.max(0, (tower.recoil || 0) - dt * 3.5);
      if (tower.cooldown > 0) continue;
      if (tower.type === TILE.TOWER_BUFFER) { tower.cooldown = 0.25; continue; }
      const range = getTowerRange(tower, tower.type);
      const target = chooseTarget(x, y, range, tower);
      if (!target) continue;
      const damage = getTowerDamage(tower, tower.type, x, y);
      if (tower.type === TILE.TOWER_CANNON) {
        for (const enemy of state.enemies) if (canTowerHitEnemy(tower, enemy) && Math.hypot(enemy.x - target.x, enemy.y - target.y) <= Number(config.splashRadius)) enemy.hp -= damage;
        state.projectiles.push({ fromX: x, fromY: y, toX: target.x, toY: target.y, ttl: 0.12, thick: true });
        state.explosions.push({ x: target.x, y: target.y, radius: Number(config.splashRadius), ttl: 0.18 });
      } else if (tower.type === TILE.TOWER_SNIPER) {
        target.hp -= damage;
        state.projectiles.push({ fromX: x, fromY: y, toX: target.x, toY: target.y, ttl: 0.14, thick: true, sniper: true });
      } else if (tower.type === TILE.TOWER_EMP) {
        for (const enemy of state.enemies) { if (!canTowerHitEnemy(tower, enemy)) continue; if (Math.hypot(enemy.x - x, enemy.y - y) <= range) { enemy.hp -= damage; applySlow(enemy, getTowerSlowPct(tower, tower.type), Number(config.slowDuration), nowSec); } }
        state.pulses.push({ x, y, radius: range, ttl: 0.22 });
      } else if (tower.type === TILE.TOWER_RAILGUN) {
        const maxTargets = Math.max(1, Math.round(Number(config.pierceCount))), lineWidth = Number(config.lineWidth), dx = target.x - x, dy = target.y - y, targetDistance = Math.hypot(dx, dy) || 1, dirX = dx / targetDistance, dirY = dy / targetDistance, beamEndX = x + dirX * range, beamEndY = y + dirY * range, hits = [];
        for (const enemy of state.enemies) { if (!canTowerHitEnemy(tower, enemy)) continue; const fromStart = Math.hypot(enemy.x - x, enemy.y - y); if (fromStart > range) continue; const lineDist = pointLineDistance(enemy.x, enemy.y, x, y, beamEndX, beamEndY), forward = (enemy.x - x) * dirX + (enemy.y - y) * dirY; if (lineDist <= lineWidth && forward >= 0) hits.push({ enemy, forward }); }
        hits.sort((a, b) => a.forward - b.forward);
        for (const hit of hits.slice(0, maxTargets)) hit.enemy.hp -= damage;
        state.beams.push({ fromX: x, fromY: y, toX: beamEndX, toY: beamEndY, ttl: 0.1, width: 4, color: 'rgba(239,68,68,0.85)' });
      } else if (tower.type === TILE.TOWER_FREEZE) {
        target.hp -= damage;
        applySlow(target, getTowerSlowPct(tower, tower.type), Number(config.slowDuration), nowSec);
        state.beams.push({ fromX: x, fromY: y, toX: target.x, toY: target.y, ttl: 0.12, width: 3, color: 'rgba(96,165,250,0.85)' });
      } else if (tower.type === TILE.TOWER_AA) {
        if (Number(config.homingMissile || 0)) state.projectiles.push({ missileTracking: true, x, y, targetId: target.id, lastKnownX: target.x, lastKnownY: target.y, speed: 8.8, damage, ttl: 5, antiAirMissile: true, missileTowerType: TILE.TOWER_AA, missilePremiumKey: tower.premiumKey || null });
        else {
          target.hp -= damage;
          state.projectiles.push({ fromX: x, fromY: y, toX: target.x, toY: target.y, ttl: 0.06, aa: true });
        }
      } else if (tower.type === TILE.TOWER_MISSILE) {
        state.projectiles.push({ missileTracking: true, x, y, targetId: target.id, lastKnownX: target.x, lastKnownY: target.y, speed: tower.premiumKey === 'mini_nuke' ? 5.2 : 6.5, damage, ttl: 6, miniNuke: tower.premiumKey === 'mini_nuke' });
      } else if (tower.type === TILE.TOWER_FLAMER) {
        const flameLength = range, coneWidth = Number(config.coneWidth || 0.85), dx = target.x - x, dy = target.y - y, baseAngle = Math.atan2(dy, dx), endX = x + Math.cos(baseAngle) * flameLength, endY = y + Math.sin(baseAngle) * flameLength;
        let hitAny = false;
        for (const enemy of state.enemies) {
          if (!canTowerHitEnemy(tower, enemy)) continue;
          const ex = enemy.x - x, ey = enemy.y - y, dist = Math.hypot(ex, ey);
          if (dist > flameLength) continue;
          const enemyAngle = Math.atan2(ey, ex);
          let angleDiff = Math.abs(enemyAngle - baseAngle);
          if (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - (Math.PI * 2));
          if (angleDiff <= coneWidth / 2) { enemy.hp -= damage; applyBurn(enemy, Number(config.burnDps || 0), Number(config.burnDuration || 0), nowSec); hitAny = true; }
        }
        if (hitAny) state.beams.push({ fromX: x, fromY: y, toX: endX, toY: endY, ttl: 0.12, width: 1, color: '', flame: true });
      } else {
        target.hp -= damage;
        state.projectiles.push({ fromX: x, fromY: y, toX: target.x, toY: target.y, ttl: 0.08 });
      }
      tower.recoil = tower.type === TILE.TOWER_FLAMER ? 0.08 : 0.22;
      tower.cooldown = getTowerFireInterval(tower, tower.type, x, y);
    }
    const living = [];
    for (const enemy of state.enemies) { if (enemy.hp <= 0) { const moneyBonus = getPassiveBonusPct('tower_money'); state.money += Math.round(enemy.reward * (1 + moneyBonus / 100)); state.killed += 1; } else living.push(enemy); }
    state.enemies = living;
  }
  function updateMissiles(dt) {
    const state = getState();
    const nextMissiles = [];
    for (const missile of state.projectiles.filter((p) => p.missileTracking)) {
      const target = state.enemies.find((e) => e.id === missile.targetId && e.hp > 0);
      let tx = missile.lastKnownX, ty = missile.lastKnownY;
      if (target) { tx = target.x; ty = target.y; }
      const dx = tx - missile.x, dy = ty - missile.y, dist = Math.hypot(dx, dy) || 0.0001, step = Math.min(missile.speed * dt, dist), nx = missile.x + (dx / dist) * step, ny = missile.y + (dy / dist) * step;
      const hit = dist <= 0.18 || (target && Math.hypot(target.x - nx, target.y - ny) <= 0.22);
      if (hit) {
        const missileTowerType = missile.missileTowerType || TILE.TOWER_MISSILE;
        const cfg = getTowerRuntimeConfig(getConfig(), { type: missileTowerType, premiumKey: missile.missilePremiumKey || (missile.miniNuke ? 'mini_nuke' : null) }, missileTowerType);
        const splashRadius = Number(cfg.splashRadius || 0);
        if (splashRadius > 0) {
          for (const enemy of state.enemies) if (Math.hypot(enemy.x - tx, enemy.y - ty) <= splashRadius) enemy.hp -= missile.damage;
          state.explosions.push({ x: tx, y: ty, radius: splashRadius, ttl: missile.miniNuke ? 0.48 : 0.22, kind: missile.miniNuke ? 'mini_nuke' : 'standard' });
        } else if (target) {
          target.hp -= missile.damage;
          state.explosions.push({ x: tx, y: ty, radius: missile.antiAirMissile ? 0.65 : 0.5, ttl: 0.18, kind: missile.antiAirMissile ? 'anti_air_hit' : 'standard' });
        }
      } else nextMissiles.push({ ...missile, x: nx, y: ny, lastKnownX: tx, lastKnownY: ty, ttl: missile.ttl - dt });
    }
    state.projectiles = state.projectiles.filter((p) => !p.missileTracking && (p.ttl - dt) > 0).map((p) => ({ ...p, ttl: p.ttl - dt })).concat(nextMissiles.filter((p) => p.ttl > 0));
  }
  function updateEffects(dt) {
    const state = getState();
    updateMissiles(dt);
    state.explosions = state.explosions.map((x) => ({ ...x, ttl: x.ttl - dt })).filter((x) => x.ttl > 0);
    state.pulses = state.pulses.map((x) => ({ ...x, ttl: x.ttl - dt })).filter((x) => x.ttl > 0);
    state.beams = state.beams.map((x) => ({ ...x, ttl: x.ttl - dt })).filter((x) => x.ttl > 0);
  }
  function createInitialState() {
    return { grid: createEmptyGrid(), towers: {}, enemies: [], projectiles: [], explosions: [], pulses: [], beams: [], money: 140, wave: 1, running: false, hasStarted: false, spawnQueue: getWaveEnemyCount(1), specialSpawnQueue: getSpecialWaveSpawns(1), spawnCooldown: 0.6, intermission: 0, enemyId: 1, killed: 0, leaked: 0, pendingSkillChoice: false, preWaveCountdown: getWaveCountdownDuration(), skills: createSkillState() };
  }
  function update(dt) {
    const state = getState();
    if (!state.running || state.pendingSkillChoice || state.skills.pendingTargetSkill) return;
    const nowSec = performance.now() / 1000;
    if (Number(state.preWaveCountdown || 0) > 0) {
      state.preWaveCountdown = Math.max(0, Number(state.preWaveCountdown) - dt);
      updateSkillEffects(dt, nowSec);
      updateEnemyStatus(nowSec, dt);
      updateEffects(dt);
      return;
    }
    if (state.specialSpawnQueue.length > 0 || state.spawnQueue > 0) {
      state.spawnCooldown -= dt;
      while ((state.specialSpawnQueue.length > 0 || state.spawnQueue > 0) && state.spawnCooldown <= 0) {
        if (state.specialSpawnQueue.length > 0) { const specialType = state.specialSpawnQueue.shift(); state.enemies.push(spawnEnemy(state.enemyId++, state.wave, state.grid, specialType)); }
        else { state.enemies.push(spawnEnemy(state.enemyId++, state.wave, state.grid)); state.spawnQueue -= 1; }
        state.spawnCooldown += getSpawnDelay(state.wave);
      }
    }
    updateSkillEffects(dt, nowSec); updateEnemyStatus(nowSec, dt); updateEnemies(dt); updateTowers(dt, nowSec); updateEffects(dt);
    if (state.spawnQueue === 0 && state.specialSpawnQueue.length === 0 && state.enemies.length === 0) {
      state.intermission += dt;
      if (state.intermission >= getIntermissionDuration(state.wave)) {
        state.wave += 1;
        state.spawnQueue = getWaveEnemyCount(state.wave);
        state.specialSpawnQueue = getSpecialWaveSpawns(state.wave);
        state.spawnCooldown = 0.5;
        state.intermission = 0;
        const wavesPerChoice = Math.max(1, Math.round(Number(getConfig().skills?.progression?.wavesPerChoice) || 3));
        if (state.wave > 1 && (state.wave - 1) % wavesPerChoice === 0) queueSkillChoiceForWave(state.wave);
        else state.preWaveCountdown = getWaveCountdownDuration();
      }
    } else state.intermission = 0;
  }

  return { ACTIVE_SKILL_KEYS, PASSIVE_SKILL_KEYS, castPendingSkillAt, chooseSkill, clearPendingTargetSkill, cloneGrid, createInitialState, findPath, getActiveSkillDamageMultiplier, getActiveSkillStats, getAdjacentBuffs, getEnemyLevelForWave, getPassiveBonusPct, getSkillDefinition, getSkillLevel, getTowerDamage, getTowerFireInterval, getTowerFireRate, getTowerRange, getTowerSlowPct, getWaveEnemyCount, isTowerUnlocked, keyOf, rebuildAllEnemyPaths, setPendingTargetSkill, spawnEnemy, update };
}

