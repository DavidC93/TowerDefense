import { GOAL, GRID_SIZE, START, TILE, TOOL, getBuildingConfig, getTowerDisplayName } from './config.js';

const RENDER_ACTIVE_SKILL_KEYS = ['toxic_gas', 'glue_bomb', 'phosphorus_bomb'];
const TOOL_PREVIEW_MAP = {
  [TOOL.TOWER]: { tile: TILE.TOWER_BASIC, label: 'GS' },
  [TOOL.CANNON]: { tile: TILE.TOWER_CANNON, label: 'C' },
  [TOOL.SNIPER]: { tile: TILE.TOWER_SNIPER, label: 'S' },
  [TOOL.EMP]: { tile: TILE.TOWER_EMP, label: 'E' },
  [TOOL.RAILGUN]: { tile: TILE.TOWER_RAILGUN, label: 'R' },
  [TOOL.FREEZE]: { tile: TILE.TOWER_FREEZE, label: 'F' },
  [TOOL.AA]: { tile: TILE.TOWER_AA, label: 'AA' },
  [TOOL.MISSILE]: { tile: TILE.TOWER_MISSILE, label: 'M' },
  [TOOL.BUFFER]: { tile: TILE.TOWER_BUFFER, label: 'B' },
  [TOOL.FLAMER]: { tile: TILE.TOWER_FLAMER, label: 'FL' },
};

export function createRenderer(api) {
  function getConfig() { return api.getConfig(); }
  function getState() { return api.getState(); }
  function getSelected() { return api.getSelected(); }
  function getHoveredCell() { return api.getHoveredCell(); }
  function getCurrentTool() { return api.getCurrentTool(); }
  function getSelectedTower() { return api.getSelectedTower(); }
  function getUpgradeCost(tower) { return api.getUpgradeCost(tower); }
  function getUpgradeContext(tower) { return api.getUpgradeContext(tower); }
  function upgradeSelectedTower() { return api.upgradeSelectedTower(); }
  function chooseSkill(skillKey) { return api.chooseSkill(skillKey); }
  function activateSkill(skillKey) { return api.activateSkill(skillKey); }
  function getDom() { return api.dom; }
  function getSimulation() { return api.simulation; }

  function cellSizePx() { const rect = getDom().boardEl.getBoundingClientRect(); return rect.width / GRID_SIZE; }
  function cellCenterPx(x, y) { const cell = cellSizePx(); return { x: x * cell + cell / 2, y: y * cell + cell / 2 }; }
  function towerName(tile, tower = null) { return getTowerDisplayName(getConfig(), tile, tower); }
  function setBuildButtonContent(button, label, cost, iconPath) {
    button.innerHTML = `<span class="build-card-media"><img src="${iconPath}" alt="${label}" /></span><span class="build-card-meta"><span class="build-card-name">${label}</span><span class="build-card-cost">${cost}</span></span>`;
  }
  function syncButtonLabels() {
    const config = getConfig(), dom = getDom();
    setBuildButtonContent(dom.buildWallBtn, 'חומה', `${Math.round(config.buildings.wall.cost)}$`, 'assets/towers/wall.svg');
    setBuildButtonContent(dom.buildTowerBtn, 'מגדל שמירה', `${Math.round(config.buildings.tower_basic.cost)}$`, 'assets/towers/basic.svg');
    setBuildButtonContent(dom.buildCannonBtn, 'תותח', `${Math.round(config.buildings.tower_cannon.cost)}$`, 'assets/towers/cannon.svg');
    setBuildButtonContent(dom.buildSniperBtn, 'צלף', `${Math.round(config.buildings.tower_sniper.cost)}$`, 'assets/towers/sniper.svg');
    setBuildButtonContent(dom.buildEmpBtn, 'EMP', `${Math.round(config.buildings.tower_emp.cost)}$`, 'assets/towers/emp.svg');
    setBuildButtonContent(dom.buildRailgunBtn, 'Railgun', `${Math.round(config.buildings.tower_railgun.cost)}$`, 'assets/towers/railgun.svg');
    setBuildButtonContent(dom.buildFreezeBtn, 'קירור', `${Math.round(config.buildings.tower_freeze.cost)}$`, 'assets/towers/freeze.svg');
    setBuildButtonContent(dom.buildAABtn, 'נ"מ', `${Math.round(config.buildings.tower_aa.cost)}$`, 'assets/towers/aa.svg');
    setBuildButtonContent(dom.buildMissileBtn, 'טילים', `${Math.round(config.buildings.tower_missile.cost)}$`, 'assets/towers/missile.svg');
    setBuildButtonContent(dom.buildBufferBtn, 'באף', `${Math.round(config.buildings.tower_buffer.cost)}$`, 'assets/towers/buffer.svg');
    setBuildButtonContent(dom.buildFlamerBtn, 'להביור', `${Math.round(config.buildings.tower_flamer.cost)}$`, 'assets/towers/flamer.svg');
  }
  function skillLabel(skillKey) { return getConfig().skills?.[skillKey]?.label || skillKey; }
  function skillLevel(skillKey) { return getSimulation().getSkillLevel(skillKey); }
  function describeSkill(skillKey, previewLevel = null) {
    const simulation = getSimulation();
    const cfg = getConfig().skills?.[skillKey];
    const effectiveLevel = previewLevel ?? simulation.getSkillLevel(skillKey);
    if (skillKey === 'tower_damage') return `כל המגדלים גורמים +${(effectiveLevel * Number(cfg?.valuePerLevelPct || 0)).toFixed(1).replace(/\.0$/, '')}% נזק`;
    if (skillKey === 'tower_fire_rate') return `כל המגדלים מקבלים +${(effectiveLevel * Number(cfg?.valuePerLevelPct || 0)).toFixed(1).replace(/\.0$/, '')}% קצב אש`;
    if (skillKey === 'tower_range') return `כל המגדלים מקבלים +${(effectiveLevel * Number(cfg?.valuePerLevelPct || 0)).toFixed(1).replace(/\.0$/, '')}% טווח`;
    if (skillKey === 'tower_money') return `כל חיסול נותן +${(effectiveLevel * Number(cfg?.valuePerLevelPct || 0)).toFixed(1).replace(/\.0$/, '')}% כסף`;
    const stats = simulation.getActiveSkillStats(skillKey);
    if (!stats) return '';
    if (skillKey === 'toxic_gas') return `ענן ברדיוס ${stats.radius} ל-${stats.duration.toFixed(1).replace(/\.0$/, '')}שנ' עם ${Math.round(stats.dps)} DPS. מכפיל גל x${stats.damageMultiplier.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}. טעינה ${stats.cooldown.toFixed(1).replace(/\.0$/, '')}שנ'`;
    if (skillKey === 'glue_bomb') return `משבצת מאטה ב-${Math.round(stats.slowPct)}% ל-${stats.duration.toFixed(1).replace(/\.0$/, '')}שנ'. טעינה ${stats.cooldown.toFixed(1).replace(/\.0$/, '')}שנ'`;
    if (skillKey === 'phosphorus_bomb') return `משבצת בוערת ל-${stats.tileDuration.toFixed(1).replace(/\.0$/, '')}שנ', שריפה ${Math.round(stats.burnDps)} DPS ל-${stats.burnDuration.toFixed(1).replace(/\.0$/, '')}שנ'. מכפיל גל x${stats.damageMultiplier.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}. טעינה ${stats.cooldown.toFixed(1).replace(/\.0$/, '')}שנ'`;
    return '';
  }
  function describeNextSkillLevel(skillKey) {
    const current = skillLevel(skillKey);
    if (current === 0) return describeSkill(skillKey, 1);
    const cfg = getConfig().skills[skillKey];
    if (skillKey === 'tower_damage') return `הרמה הבאה תעלה את הבונוס ל-${(Number(cfg.valuePerLevelPct) * (current + 1)).toFixed(1).replace(/\.0$/, '')}% נזק`;
    if (skillKey === 'tower_fire_rate') return `הרמה הבאה תעלה את הבונוס ל-${(Number(cfg.valuePerLevelPct) * (current + 1)).toFixed(1).replace(/\.0$/, '')}% קצב אש`;
    if (skillKey === 'tower_range') return `הרמה הבאה תעלה את הבונוס ל-${(Number(cfg.valuePerLevelPct) * (current + 1)).toFixed(1).replace(/\.0$/, '')}% טווח`;
    if (skillKey === 'tower_money') return `הרמה הבאה תעלה את הבונוס ל-${(Number(cfg.valuePerLevelPct) * (current + 1)).toFixed(1).replace(/\.0$/, '')}% כסף`;
    return describeSkill(skillKey);
  }
  function renderHud() {
    const state = getState(), dom = getDom(), simulation = getSimulation();
    const byType = { grunt: 0, fast: 0, tank: 0, flyer: 0, flyer_heavy: 0, miniboss: 0, boss: 0 };
    for (const enemy of state.enemies) byType[enemy.type] += 1;
    const passiveText = ['tower_damage', 'tower_fire_rate', 'tower_range', 'tower_money']
      .map((key) => `${skillLabel(key)} +${simulation.getPassiveBonusPct(key).toFixed(1).replace(/\.0$/, '')}%`)
      .join(' | ');
    const countdownChip = state.hasStarted && Number(state.preWaveCountdown || 0) > 0 ? `<div class="chip chip-warn">הגל מתחיל בעוד ${Math.ceil(state.preWaveCountdown)}</div>` : '';
    dom.hudStatsEl.innerHTML = `<div class="chip">$ ${state.money}</div><div class="chip">גל ${state.wave}</div><div class="chip">רמת אויב ${simulation.getEnemyLevelForWave(state.wave)}</div><div class="chip">קרקע ${byType.grunt + byType.fast + byType.tank}</div><div class="chip">אוויר ${byType.flyer + byType.flyer_heavy}</div><div class="chip">מיני בוס ${byType.miniboss}</div><div class="chip">בוס ${byType.boss}</div><div class="chip">חיסולים ${state.killed}</div><div class="chip">דליפות ${state.leaked}</div>${countdownChip}<div class="chip">${passiveText}</div>`;
    dom.pauseBtn.textContent = state.hasStarted ? (state.running ? 'השהה' : 'המשך') : 'התחל';
    dom.pauseBtn.classList.toggle('btn-start-pulse', !state.hasStarted);
  }
  function renderSelectedInfo() {
    const dom = getDom(), selected = getSelected(), state = getState();
    const labels = { [TOOL.SELECT]: 'בחירה', [TOOL.WALL]: 'חומה', [TOOL.TOWER]: 'מגדל שמירה', [TOOL.CANNON]: 'תותח', [TOOL.SNIPER]: 'צלף', [TOOL.EMP]: 'EMP', [TOOL.RAILGUN]: 'Railgun', [TOOL.FREEZE]: 'קרן קירור', [TOOL.AA]: 'נ"מ', [TOOL.MISSILE]: 'טילים', [TOOL.BUFFER]: 'באף', [TOOL.FLAMER]: 'להביור', [TOOL.UPGRADE]: 'שדרוג מהיר', [TOOL.DESTROY]: 'הריסה' };
    if (state.skills.pendingTargetSkill) { dom.selectedInfoEl.textContent = `בחר משבצת עבור ${skillLabel(state.skills.pendingTargetSkill)}`; return; }
    if (state.pendingSkillChoice) { dom.selectedInfoEl.textContent = 'המשחק ממתין לבחירת סקיל'; return; }
    if (!selected) { dom.selectedInfoEl.textContent = `מצב: ${labels[getCurrentTool()]}`; return; }
    const tile = state.grid[selected.y][selected.x], tower = getSelectedTower();
    let text = `מצב: ${labels[getCurrentTool()]} · ${towerName(tile, tower)}`;
    if (tower) text += tower.premiumKey ? ' · פרימיום' : ` · רמה ${tower.level || 0}`;
    dom.selectedInfoEl.textContent = text;
  }
  function renderGrid() {
    const dom = getDom(), selected = getSelected(), hoveredCell = getHoveredCell(), state = getState(), simulation = getSimulation(), currentTool = getCurrentTool();
    const preview = TOOL_PREVIEW_MAP[currentTool] || null;
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const button = dom.cellButtons[y][x], tile = state.grid[y][x], tower = state.towers[simulation.keyOf(x, y)] || null;
        button.className = 'cell'; button.textContent = ''; button.innerHTML = '';
        if (x === START.x && y === START.y) { button.classList.add('start'); button.textContent = 'S'; }
        else if (x === GOAL.x && y === GOAL.y) { button.classList.add('goal'); button.textContent = 'E'; }
        else if (tile === TILE.WALL) button.classList.add('wall');
        else if (tile === TILE.TOWER_BASIC) { button.classList.add('tower_basic'); button.textContent = tower?.premiumKey === 'gatling_gun' ? 'GG' : 'GS'; }
        else if (tile === TILE.TOWER_CANNON) { button.classList.add('tower_cannon'); button.textContent = 'C'; }
        else if (tile === TILE.TOWER_SNIPER) { button.classList.add('tower_sniper'); button.textContent = 'S'; }
        else if (tile === TILE.TOWER_EMP) { button.classList.add('tower_emp'); button.textContent = 'E'; }
        else if (tile === TILE.TOWER_RAILGUN) { button.classList.add('tower_railgun'); button.textContent = 'R'; }
        else if (tile === TILE.TOWER_FREEZE) { button.classList.add('tower_freeze'); button.textContent = 'F'; }
        else if (tile === TILE.TOWER_AA) { button.classList.add('tower_aa'); button.textContent = 'AA'; }
        else if (tile === TILE.TOWER_MISSILE) { button.classList.add('tower_missile'); button.textContent = 'M'; }
        else if (tile === TILE.TOWER_BUFFER) { button.classList.add('tower_buffer'); button.textContent = 'B'; }
        else if (tile === TILE.TOWER_FLAMER) { button.classList.add('tower_flamer'); button.textContent = 'FL'; }
        if (tower) {
          const level = tower.level || 0;
          if (level > 0 && !tower.premiumKey) {
            const base = button.textContent;
            button.innerHTML = `<div class="cell-stack"><div>${base}</div><div class="cell-level">L${level}</div></div>`;
          } else {
            button.innerHTML = `<div class="cell-stack${tower.premiumKey ? ' preview-stack' : ''}"><div>${button.textContent}</div>${tower.premiumKey ? '<div class="cell-level premium-badge">PREM</div>' : ''}</div>`;
          }
          if (tower.premiumKey) button.classList.add('premium');
          if (tower.recoil > 0) button.classList.add('recoil');
        } else if (preview && hoveredCell && hoveredCell.x === x && hoveredCell.y === y && tile === TILE.EMPTY && !(x === START.x && y === START.y) && !(x === GOAL.x && y === GOAL.y)) {
          button.classList.add(preview.tile, 'preview');
          button.innerHTML = `<div class="cell-stack preview-stack"><div>${preview.label}</div></div>`;
        }
        if (selected && selected.x === x && selected.y === y) button.classList.add('selected');
      }
    }
  }
  function renderRangeIndicator() {
    const dom = getDom(), selected = getSelected(), hoveredCell = getHoveredCell(), state = getState(), simulation = getSimulation(), tool = getCurrentTool();
    dom.rangeLayerEl.innerHTML = '';
    let source = null;
    if (!state.skills.pendingTargetSkill && selected) {
      const tile = state.grid[selected.y][selected.x];
      const tower = getSelectedTower();
      const cfg = getBuildingConfig(getConfig(), tile);
      if (cfg) source = { x: selected.x, y: selected.y, range: tower ? simulation.getTowerRange(tower, tile) : (cfg.range ?? cfg.auraRange ?? cfg.flameLength) };
    } else if (!state.pendingSkillChoice && !state.skills.pendingTargetSkill && hoveredCell) {
      const tileType = TOOL_PREVIEW_MAP[tool]?.tile;
      const cfg = tileType ? getBuildingConfig(getConfig(), tileType) : null;
      if (cfg) source = { x: hoveredCell.x, y: hoveredCell.y, range: Number(cfg.range ?? cfg.auraRange ?? cfg.flameLength ?? 0) };
    }
    if (!source || !source.range) return;
    const cell = cellSizePx(), center = cellCenterPx(source.x, source.y), diameter = Number(source.range) * 2 * cell;
    const rangeEl = document.createElement('div');
    rangeEl.className = 'range-indicator';
    rangeEl.style.left = center.x + 'px';
    rangeEl.style.top = center.y + 'px';
    rangeEl.style.width = diameter + 'px';
    rangeEl.style.height = diameter + 'px';
    dom.rangeLayerEl.appendChild(rangeEl);
  }
  function renderEntities() {
    const dom = getDom(), state = getState();
    const cell = cellSizePx(); let html = '';
    for (const effect of state.skills.activeEffects) {
      const center = cellCenterPx(effect.x, effect.y);
      if (effect.kind === 'toxic_gas') {
        const size = Number(effect.radius) * 2 * cell;
        html += `<div class="skill-cloud" style="left:${center.x}px;top:${center.y}px;width:${size}px;height:${size}px;opacity:${Math.max(0.35, Math.min(0.9, effect.ttl / 4))}"></div>`;
      } else if (effect.kind === 'glue_bomb') {
        html += `<div class="skill-tile skill-glue" style="left:${center.x}px;top:${center.y}px;width:${cell * 0.95}px;height:${cell * 0.95}px;opacity:${Math.max(0.35, Math.min(1, effect.ttl / 4))}"></div>`;
      } else if (effect.kind === 'phosphorus_bomb') {
        html += `<div class="skill-tile skill-fire" style="left:${center.x}px;top:${center.y}px;width:${cell * 0.95}px;height:${cell * 0.95}px;opacity:${Math.max(0.4, Math.min(1, effect.ttl / 4))}"></div>`;
      }
    }
    for (const projectile of state.projectiles) {
      if (projectile.missileTracking) {
        const center = cellCenterPx(projectile.x, projectile.y);
        html += `<div class="projectile" style="left:${center.x}px;top:${center.y}px;width:12px;height:5px;transform:translate(-50%,-50%);border-radius:999px;background:rgba(245,158,11,0.95);box-shadow:0 0 12px rgba(245,158,11,0.95)"></div>`;
        continue;
      }
      const from = cellCenterPx(projectile.fromX, projectile.fromY), to = cellCenterPx(projectile.toX, projectile.toY), dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy), angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const thickness = projectile.sniper ? 3 : (projectile.aa ? 2 : (projectile.thick ? 4 : 2));
      html += `<div class="projectile" style="left:${from.x}px;top:${from.y}px;width:${length}px;height:${thickness}px;transform:rotate(${angle}deg)"></div>`;
    }
    for (const beam of state.beams) {
      const from = cellCenterPx(beam.fromX, beam.fromY), to = cellCenterPx(beam.toX, beam.toY), dx = to.x - from.x, dy = to.y - from.y, length = Math.hypot(dx, dy), angle = Math.atan2(dy, dx) * 180 / Math.PI;
      if (beam.flame) html += `<div class="flame-stream" style="left:${from.x}px;top:${from.y}px;width:${length}px;height:30px;transform:translateY(-50%) rotate(${angle}deg)"><div class="flame-glow" style="width:${length}px;"></div><div class="flame-core-2" style="width:${length * 0.94}px;"></div><div class="flame-core" style="width:${length * 0.86}px;"></div></div>`;
      else html += `<div class="beam" style="left:${from.x}px;top:${from.y}px;width:${length}px;height:${beam.width}px;background:${beam.color};box-shadow:0 0 10px ${beam.color};transform:rotate(${angle}deg)"></div>`;
    }
    for (const explosion of state.explosions) {
      const center = cellCenterPx(explosion.x, explosion.y), progress = 1 - (explosion.ttl / 0.22), size = explosion.radius * 2 * cell * (0.7 + progress * 0.7), alpha = Math.max(0, explosion.ttl / 0.22);
      html += `<div class="explosion" style="left:${center.x}px;top:${center.y}px;width:${size}px;height:${size}px;opacity:${alpha}"></div>`;
    }
    for (const pulse of state.pulses) {
      const center = cellCenterPx(pulse.x, pulse.y), progress = 1 - (pulse.ttl / 0.22), size = pulse.radius * 2 * cell * (0.5 + progress * 1.0), alpha = Math.max(0, pulse.ttl / 0.22);
      html += `<div class="pulse" style="left:${center.x}px;top:${center.y}px;width:${size}px;height:${size}px;opacity:${alpha}"></div>`;
    }
    const nowSec = performance.now() / 1000;
    for (const enemy of state.enemies) {
      const center = cellCenterPx(enemy.x, enemy.y), hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
      const enemyClass = enemy.type === 'fast' ? 'fast' : (enemy.type === 'tank' ? 'tank' : (enemy.type === 'flyer' ? 'flyer' : (enemy.type === 'flyer_heavy' ? 'flyer_heavy' : (enemy.type === 'miniboss' ? 'miniboss' : (enemy.type === 'boss' ? 'boss' : '')))));
      const enemyWrapClass = enemy.type === 'miniboss' ? 'miniboss' : (enemy.type === 'boss' ? 'boss' : '');
      const style = `${enemy.slowFactor < 1 ? 'outline:2px solid rgba(96,165,250,0.8);' : ''}${(enemy.burnUntil || 0) > nowSec ? ' box-shadow:0 0 14px rgba(249,115,22,0.95), inset 0 0 10px rgba(239,68,68,0.45);' : ''}`;
      html += `<div class="enemy ${enemyWrapClass}" style="left:${center.x}px;top:${center.y}px;"><div class="enemy-body ${enemyClass}" style="${style}">${enemy.isFlying ? '<span class="enemy-wing"></span>' : ''}${enemy.level}</div><div class="enemy-hp"><div class="enemy-hp-fill" style="width:${hpPercent}%"></div></div></div>`;
    }
    dom.entitiesLayerEl.innerHTML = html;
  }
  function renderUnitPanel() {
    const dom = getDom(), selected = getSelected(), state = getState(), simulation = getSimulation();
    if (!selected) { dom.unitPanelContentEl.className = 'panel-empty'; dom.unitPanelContentEl.innerHTML = 'בחר יחידה על המפה כדי לראות את הפרטים שלה.'; return; }
    const tile = state.grid[selected.y][selected.x];
    if (tile === TILE.EMPTY) { dom.unitPanelContentEl.className = 'panel-empty'; dom.unitPanelContentEl.innerHTML = 'המשבצת ריקה.'; return; }
    const tower = getSelectedTower(), cfg = getBuildingConfig(getConfig(), tile);
    if (!tower) { dom.unitPanelContentEl.className = ''; dom.unitPanelContentEl.innerHTML = `<div class="panel-stats"><div class="panel-stat"><div class="panel-label">מבנה</div><div class="panel-value">${towerName(tile)}</div></div></div>`; return; }
    const upgrade = getUpgradeContext(tower), cost = upgrade.cost, maxLevel = Number(cfg.maxUpgradeLevel ?? 10), isMaxed = Number(tower.level || 0) >= maxLevel;
    let inner = '';
    if (tower.type === TILE.TOWER_BUFFER) {
      const level = Number(tower.level || 0), currentBonus = Number(cfg.damageBuffPct || 0) + Number(cfg.upgradeDamagePct || 0) * level, nextBonus = Number(cfg.damageBuffPct || 0) + Number(cfg.upgradeDamagePct || 0) * (level + 1);
      inner = `<div class="panel-stat"><div class="panel-label">מבנה</div><div class="panel-value">${towerName(tower.type, tower)}</div></div><div class="panel-stat"><div class="panel-label">רמה נוכחית</div><div class="panel-value">${tower.level || 0} / ${maxLevel}</div></div><div class="panel-stat"><div class="panel-label">הילה עכשיו</div><div class="panel-value">נזק +${currentBonus}% | קצב +${currentBonus}%</div></div><div class="panel-stat"><div class="panel-label">הילה אחרי שדרוג</div><div class="panel-value">נזק +${nextBonus}% | קצב +${nextBonus}%</div></div><div class="panel-stat"><div class="panel-label">טווח הילה</div><div class="panel-value">8 משבצות סביב</div></div><div class="panel-stat"><div class="panel-label">עלות שדרוג</div><div class="panel-value">${isMaxed ? 'MAX' : `${cost}$`}</div></div>`;
    } else {
      const buffs = simulation.getAdjacentBuffs(selected.x, selected.y);
      const nextBaseDamage = Math.round(Number(tower.baseDamage ?? tower.damage) * (1 + Number(cfg.upgradeDamagePct ?? 20) / 100));
      const slowNow = simulation.getTowerSlowPct(tower, tower.type), slowNext = Number(cfg.slowPct || 0) + ((Number(tower.level || 0) + 1) * Number(cfg.slowUpgradePct || 0));
      const nextDamageText = tower.premiumKey ? 'MAX' : (upgrade.mode === 'premium' ? `${Math.round(Number(upgrade.premiumConfig.damage || 0) * (1 + (buffs.damageBuffPct + simulation.getPassiveBonusPct('tower_damage')) / 100))}` : `${Math.round(nextBaseDamage * (1 + (buffs.damageBuffPct + simulation.getPassiveBonusPct('tower_damage')) / 100))}`);
      const upgradeLabel = tower.premiumKey ? 'סטטוס שדרוג' : (upgrade.mode === 'premium' ? 'עלות פרימיום' : 'עלות שדרוג');
      const upgradeCostText = tower.premiumKey ? 'לא ניתן' : (upgrade.disabled && upgrade.reason === 'limit' ? 'תפוס' : `${cost}$`);
      inner = `<div class="panel-stat"><div class="panel-label">מבנה</div><div class="panel-value">${towerName(tower.type, tower)}</div></div><div class="panel-stat"><div class="panel-label">רמה נוכחית</div><div class="panel-value">${tower.premiumKey ? 'פרימיום' : `${tower.level || 0} / ${maxLevel}`}</div></div><div class="panel-stat"><div class="panel-label">נזק עכשיו</div><div class="panel-value">${simulation.getTowerDamage(tower, tower.type, selected.x, selected.y)}</div></div><div class="panel-stat"><div class="panel-label">קצב אש</div><div class="panel-value">${simulation.getTowerFireRate(tower, tower.type, selected.x, selected.y).toFixed(1).replace(/\.0$/, '')} יריות לדקה</div></div><div class="panel-stat"><div class="panel-label">${upgrade.mode === 'premium' ? 'נזק בפרימיום' : 'נזק אחרי שדרוג'}</div><div class="panel-value">${nextDamageText}</div></div><div class="panel-stat"><div class="panel-label">טווח</div><div class="panel-value">${simulation.getTowerRange(tower, tower.type).toFixed(2).replace(/\.00$/, '')}</div></div>${cfg.slowPct ? `<div class="panel-stat"><div class="panel-label">האטה עכשיו</div><div class="panel-value">${slowNow}%</div></div><div class="panel-stat"><div class="panel-label">האטה אחרי שדרוג</div><div class="panel-value">${slowNext}%</div></div>` : ''}${cfg.burnDps ? `<div class="panel-stat"><div class="panel-label">שריפה</div><div class="panel-value">${Number(cfg.burnDps || 0)} DPS / ${Number(cfg.burnDuration || 0)} שנ'</div></div>` : ''}<div class="panel-stat"><div class="panel-label">${upgradeLabel}</div><div class="panel-value">${upgradeCostText}</div></div>`;
      if (tower.premiumKey) inner += `<div class="panel-stat premium-summary"><div class="panel-label">סוג</div><div class="panel-value">מגדל פרימיום פעיל</div></div>`;
      if (buffs.damageBuffPct || buffs.fireRateBuffPct || simulation.getPassiveBonusPct('tower_damage') || simulation.getPassiveBonusPct('tower_fire_rate') || simulation.getPassiveBonusPct('tower_range') || simulation.getPassiveBonusPct('tower_money')) inner += `<div class="panel-stat"><div class="panel-label">בונוסים פעילים</div><div class="panel-value">הילה: נזק +${buffs.damageBuffPct}% | קצב +${buffs.fireRateBuffPct}%<br />סקילים: נזק +${simulation.getPassiveBonusPct('tower_damage')}% | קצב +${simulation.getPassiveBonusPct('tower_fire_rate')}% | טווח +${simulation.getPassiveBonusPct('tower_range')}% | כסף +${simulation.getPassiveBonusPct('tower_money')}%</div></div>`;
    }
    dom.unitPanelContentEl.className = '';
    const buttonDisabled = upgrade.disabled ? 'disabled' : '';
    dom.unitPanelContentEl.innerHTML = `<div class="panel-stats">${inner}</div><div class="panel-button-wrap"><button class="btn-upgrade premium-button" id="sideUpgradeBtn" type="button" ${buttonDisabled}>${upgrade.buttonLabel}</button></div>`;
    if (!upgrade.disabled) document.getElementById('sideUpgradeBtn').addEventListener('click', (event) => { event.stopPropagation(); upgradeSelectedTower(); });
  }
  function renderSkillPanel() {
    const dom = getDom(), state = getState(), simulation = getSimulation();
    const passiveKeys = ['tower_damage', 'tower_fire_rate', 'tower_range', 'tower_money'];
    const passiveHtml = passiveKeys.map((key) => {
      const level = skillLevel(key);
      const bonus = simulation.getPassiveBonusPct(key).toFixed(1).replace(/\.0$/, '');
      return `<div class="skill-passive-card"><div class="skill-passive-title">${skillLabel(key)}${level > 0 ? ` Lv.${level}` : ''}</div><div class="skill-passive-meta">${level > 0 ? `בונוס נוכחי: +${bonus}%` : 'עדיין לא נבחר'}</div></div>`;
    }).join('');
    const unlocked = RENDER_ACTIVE_SKILL_KEYS.filter((key) => skillLevel(key) > 0);
    const activeHtml = unlocked.length === 0
      ? '<div class="panel-empty">עדיין לא נפתחו סקילים אקטיביים.</div>'
      : unlocked.map((key) => {
          const cooldown = Number(state.skills.cooldowns[key] || 0);
          const pending = state.skills.pendingTargetSkill === key;
          return `<button class="skill-activate ${pending ? 'armed' : ''}" data-skill-key="${key}" type="button" ${state.pendingSkillChoice ? 'disabled' : ''}><span class="skill-activate-name">${skillLabel(key)} Lv.${skillLevel(key)}</span><span class="skill-activate-meta">${cooldown > 0 ? `טעינה ${cooldown.toFixed(1)}שנ'` : (pending ? 'בחר משבצת' : 'מוכן')}</span></button>`;
        }).join('');
    dom.skillBarEl.innerHTML = `<div class="skill-section-title">סקילים פסיביים</div><div class="skill-passive-list">${passiveHtml}</div><div class="skill-section-title">סקילים אקטיביים</div><div class="skill-active-list">${activeHtml}</div>`;
  }
  function renderSkillSelection() {
    const dom = getDom(), state = getState();
    dom.skillOverlayEl.classList.toggle('open', Boolean(state.pendingSkillChoice));
    if (!state.pendingSkillChoice) return;
    dom.skillPromptEl.textContent = `הגעת לגל ${state.skills.selectionWave}. בחר סקיל אחד לשדרוג או לפתיחה.`;
    dom.skillChoicesEl.innerHTML = state.skills.choices.map((skillKey) => {
      const level = skillLevel(skillKey);
      return `<button class="skill-choice" type="button" data-skill-choice="${skillKey}"><span class="skill-choice-head"><span class="skill-choice-title">${skillLabel(skillKey)}</span><span class="skill-choice-level">${level > 0 ? `רמה נוכחית ${level}` : 'חדש'}</span></span><span class="skill-choice-body">${describeNextSkillLevel(skillKey)}</span><span class="skill-choice-body skill-choice-subtle">${level > 0 ? `עכשיו: ${describeSkill(skillKey)}` : 'הסקיל יתווסף למאגר שלך מיד אחרי הבחירה.'}</span></button>`;
    }).join('');
  }
  function renderCountdownOverlay() {
    const dom = getDom(), state = getState();
    if (!dom.countdownOverlayEl) return;
    const visible = state.hasStarted && Number(state.preWaveCountdown || 0) > 0 && !state.pendingSkillChoice;
    dom.countdownOverlayEl.classList.toggle('visible', visible);
    if (!visible) return;
    dom.countdownValueEl.textContent = String(Math.ceil(state.preWaveCountdown));
    dom.countdownLabelEl.textContent = state.wave === 1 ? 'המשחק מתחיל' : `גל ${state.wave} מתחיל`;
  }
  function renderStatic() { syncButtonLabels(); renderGrid(); renderSelectedInfo(); renderUnitPanel(); renderRangeIndicator(); renderHud(); renderSkillPanel(); renderSkillSelection(); renderCountdownOverlay(); }
  function renderDynamic() { renderEntities(); renderGrid(); renderHud(); renderSkillPanel(); renderSkillSelection(); renderCountdownOverlay(); }
  function initBoard() {
    const dom = getDom();
    dom.boardEl.innerHTML = '';
    dom.cellButtons.length = 0;
    for (let y = 0; y < GRID_SIZE; y += 1) {
      const row = [];
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const button = document.createElement('button'); button.type = 'button'; button.className = 'cell'; button.dataset.x = String(x); button.dataset.y = String(y); dom.boardEl.appendChild(button); row.push(button);
      }
      dom.cellButtons.push(row);
    }
  }
  return { cellCenterPx, cellSizePx, initBoard, renderCountdownOverlay, renderDynamic, renderEntities, renderGrid, renderHud, renderRangeIndicator, renderSelectedInfo, renderSkillPanel, renderSkillSelection, renderStatic, renderUnitPanel, syncButtonLabels };
}
