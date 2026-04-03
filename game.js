import {
  GOAL,
  GRID_SIZE,
  START,
  TILE,
  TOOL,
  deepClone,
  getBuildingConfig,
  getPremiumUpgradeConfig,
  getTowerRuntimeConfig,
  loadConfigFromDatabase,
  loadConfigFromStorage,
  saveConfig,
  saveConfigToDatabase,
} from './src/config.js';
import { createSimulation } from './src/simulation.js';
import { createRenderer } from './src/rendering.js';
import { createUiManager } from './src/ui.js';

function saveConfigToStorage(config) { saveConfig(config); }
let CONFIG = loadConfigFromStorage();
let state;
const simulation = createSimulation({
  getConfig: () => CONFIG,
  getState: () => state,
});

const boardEl = document.getElementById('board');
const rangeLayerEl = document.getElementById('rangeLayer');
const entitiesLayerEl = document.getElementById('entitiesLayer');
const hudStatsEl = document.getElementById('hudStats');
const selectedInfoEl = document.getElementById('selectedInfo');
const unitPanelContentEl = document.getElementById('unitPanelContent');
const skillBarEl = document.getElementById('skillBar');
const messageEl = document.getElementById('message');
const pauseBtn = document.getElementById('pauseBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const cheatsBtn = document.getElementById('cheatsBtn');
const resetBtn = document.getElementById('resetBtn');
const configBtn = document.getElementById('configBtn');
const buildWallBtn = document.getElementById('buildWallBtn');
const buildTowerBtn = document.getElementById('buildTowerBtn');
const buildCannonBtn = document.getElementById('buildCannonBtn');
const buildSniperBtn = document.getElementById('buildSniperBtn');
const buildEmpBtn = document.getElementById('buildEmpBtn');
const buildRailgunBtn = document.getElementById('buildRailgunBtn');
const buildFreezeBtn = document.getElementById('buildFreezeBtn');
const buildAABtn = document.getElementById('buildAABtn');
const buildMissileBtn = document.getElementById('buildMissileBtn');
const buildBufferBtn = document.getElementById('buildBufferBtn');
const buildFlamerBtn = document.getElementById('buildFlamerBtn');
const upgradeModeBtn = document.getElementById('upgradeModeBtn');
const destroyBtn = document.getElementById('destroyBtn');
const configOverlayEl = document.getElementById('configOverlay');
const configGridEl = document.getElementById('configGrid');
const closeConfigBtn = document.getElementById('closeConfigBtn');
const cancelConfigBtn = document.getElementById('cancelConfigBtn');
const saveConfigBtn = document.getElementById('saveConfigBtn');
const resetConfigBtn = document.getElementById('resetConfigBtn');
const exportConfigBtn = document.getElementById('exportConfigBtn');
const cheatsOverlayEl = document.getElementById('cheatsOverlay');
const closeCheatsBtn = document.getElementById('closeCheatsBtn');
const cheatMoneyInput = document.getElementById('cheatMoneyInput');
const addMoneyBtn = document.getElementById('addMoneyBtn');
const skipWaveBtn = document.getElementById('skipWaveBtn');
const clearEnemiesBtn = document.getElementById('clearEnemiesBtn');
const spawnAirBtn = document.getElementById('spawnAirBtn');
const freeBuildBtn = document.getElementById('freeBuildBtn');
const maxSelectedBtn = document.getElementById('maxSelectedBtn');
const togglePauseCheatBtn = document.getElementById('togglePauseCheatBtn');
const skillOverlayEl = document.getElementById('skillOverlay');
const skillPromptEl = document.getElementById('skillPrompt');
const skillChoicesEl = document.getElementById('skillChoices');
const countdownOverlayEl = document.getElementById('countdownOverlay');
const countdownLabelEl = document.getElementById('countdownLabel');
const countdownValueEl = document.getElementById('countdownValue');

const cellButtons = [];
const dom = { boardEl, rangeLayerEl, entitiesLayerEl, hudStatsEl, selectedInfoEl, unitPanelContentEl, skillBarEl, skillOverlayEl, skillPromptEl, skillChoicesEl, countdownOverlayEl, countdownLabelEl, countdownValueEl, pauseBtn, buildWallBtn, buildTowerBtn, buildCannonBtn, buildSniperBtn, buildEmpBtn, buildRailgunBtn, buildFreezeBtn, buildAABtn, buildMissileBtn, buildBufferBtn, buildFlamerBtn, upgradeModeBtn, cellButtons, configGridEl, configOverlayEl, cheatsOverlayEl };
let selected = null;
let hoveredCell = null;
let currentTool = TOOL.SELECT;
let messageTimer = null;
let lastFrameTime = performance.now();
let configDraft = deepClone(CONFIG);
let freeBuildUntil = 0;

function getTileBuildConfig(tile) { return getBuildingConfig(CONFIG, tile); }
function calculateTowerBaseDamage(tower) {
  const cfg = getTowerRuntimeConfig(CONFIG, tower, tower.type);
  if (!cfg || tower.type === TILE.TOWER_BUFFER) return Number(tower.baseDamage ?? tower.damage ?? 0);
  if (tower.premiumKey) return Number(cfg.damage ?? tower.baseDamage ?? tower.damage ?? 0);
  const level = Number(tower.level || 0);
  const dmgPct = Number(cfg.upgradeDamagePct ?? 20) / 100;
  let dmg = Number(cfg.damage ?? 0);
  for (let i = 0; i < level; i += 1) dmg = Math.round(dmg * (1 + dmgPct));
  return dmg;
}
function normalizeTowerStats() {
  for (const tower of Object.values(state.towers)) {
    if (!tower) continue;
    if (tower.type === TILE.TOWER_BUFFER) continue;
    tower.baseDamage = calculateTowerBaseDamage(tower);
    tower.damage = tower.baseDamage;
  }
}
function createInitialState() { return simulation.createInitialState(); }
state = createInitialState();
normalizeTowerStats();

const renderer = createRenderer({
  dom,
  simulation,
  getConfig: () => CONFIG,
  getCurrentTool: () => currentTool,
  getSelected: () => selected,
  getHoveredCell: () => hoveredCell,
  getSelectedTower: () => getSelectedTower(),
  getState: () => state,
  getUpgradeCost: (tower) => getUpgradeCost(tower),
  getUpgradeContext: (tower) => getUpgradeContext(tower),
  upgradeSelectedTower: () => upgradeSelectedTower(),
  chooseSkill: (skillKey) => chooseSkill(skillKey),
  activateSkill: (skillKey) => activateSkill(skillKey),
});
const ui = createUiManager({
  dom,
  getConfig: () => CONFIG,
  setConfig: (nextConfig) => { CONFIG = nextConfig; },
  getConfigDraft: () => configDraft,
  setConfigDraft: (nextDraft) => { configDraft = nextDraft; },
  onConfigApplied: () => { syncButtonLabels(); renderStatic(); },
  saveConfigToStorage: (config) => saveConfigToStorage(config),
  saveConfigToDatabase: (config) => saveConfigToDatabase(config),
  setMessage: (text) => setMessage(text),
});

function keyOf(x, y) { return simulation.keyOf(x, y); }
function inBounds(x, y) { return x >= 0 && y >= 0 && x < GRID_SIZE && y < GRID_SIZE; }
function syncButtonLabels() { renderer.syncButtonLabels(); }
function setMessage(text) {
  messageEl.textContent = text || '';
  if (messageTimer) clearTimeout(messageTimer);
  if (text) messageTimer = setTimeout(() => { messageEl.textContent = ''; messageTimer = null; }, 2200);
}

function clearSelection() { if (!selected) return; selected = null; renderStatic(); }
function selectCell(x, y) { selected = { x, y }; renderStatic(); }
function getClosestFromEventTarget(target, selector) {
  if (target instanceof Element) return target.closest(selector);
  if (target && target.parentElement instanceof Element) return target.parentElement.closest(selector);
  return null;
}
function getCellFromPointerEvent(event) {
  const pointed = document.elementFromPoint(event.clientX, event.clientY);
  return getClosestFromEventTarget(pointed, '.cell') || getClosestFromEventTarget(event.target, '.cell');
}
function supportsPlacementRangePreview(tool) {
  return [TOOL.TOWER, TOOL.CANNON, TOOL.SNIPER, TOOL.EMP, TOOL.RAILGUN, TOOL.FREEZE, TOOL.AA, TOOL.MISSILE, TOOL.BUFFER, TOOL.FLAMER].includes(tool);
}
function setHoveredCell(x, y) {
  const next = x == null || y == null ? null : { x, y };
  if ((hoveredCell?.x ?? null) === (next?.x ?? null) && (hoveredCell?.y ?? null) === (next?.y ?? null)) return;
  hoveredCell = next;
  renderStatic();
}
function clearHoveredCell() {
  if (!hoveredCell) return;
  hoveredCell = null;
  renderStatic();
}
function setCurrentTool(tool) {
  currentTool = tool;
  if (supportsPlacementRangePreview(tool)) selected = null;
  if (!supportsPlacementRangePreview(tool)) hoveredCell = null;
  buildWallBtn.classList.toggle('tool-inactive', tool !== TOOL.WALL);
  buildTowerBtn.classList.toggle('tool-inactive', tool !== TOOL.TOWER);
  buildCannonBtn.classList.toggle('tool-inactive', tool !== TOOL.CANNON);
  buildSniperBtn.classList.toggle('tool-inactive', tool !== TOOL.SNIPER);
  buildEmpBtn.classList.toggle('tool-inactive', tool !== TOOL.EMP);
  buildRailgunBtn.classList.toggle('tool-inactive', tool !== TOOL.RAILGUN);
  buildFreezeBtn.classList.toggle('tool-inactive', tool !== TOOL.FREEZE);
  buildAABtn.classList.toggle('tool-inactive', tool !== TOOL.AA);
  buildMissileBtn.classList.toggle('tool-inactive', tool !== TOOL.MISSILE);
  buildBufferBtn.classList.toggle('tool-inactive', tool !== TOOL.BUFFER);
  buildFlamerBtn.classList.toggle('tool-inactive', tool !== TOOL.FLAMER);
  upgradeModeBtn.classList.toggle('tool-inactive', tool !== TOOL.UPGRADE);
  destroyBtn.classList.toggle('tool-inactive', tool !== TOOL.DESTROY);
  renderStatic();
}

function buildAt(x, y, type) {
  if (!inBounds(x, y)) return;
  if ((x === START.x && y === START.y) || (x === GOAL.x && y === GOAL.y)) { setMessage('אי אפשר על התחלה או סיום'); return; }
  if (state.grid[y][x] !== TILE.EMPTY) { setMessage('המשבצת תפוסה'); return; }
  const config = getTileBuildConfig(type);
  if (!config) return;
  if (performance.now() / 1000 > freeBuildUntil && state.money < Number(config.cost)) { setMessage('אין מספיק כסף'); return; }
  if (state.enemies.some((enemy) => Math.round(enemy.x) === x && Math.round(enemy.y) === y)) { setMessage('יש אויב במשבצת'); return; }
  const nextGrid = simulation.cloneGrid(state.grid); nextGrid[y][x] = type;
  const path = simulation.findPath(nextGrid, START, GOAL); if (!path) { setMessage('אי אפשר לחסום לגמרי'); return; }
  state.grid = nextGrid;
  if (performance.now() / 1000 > freeBuildUntil) state.money -= Number(config.cost);
  if (type !== TILE.WALL) {
    const baseDamage = Number(config.damage ?? 0);
    state.towers[keyOf(x, y)] = { type, cooldown: 0, recoil: 0, level: 0, baseDamage, damage: baseDamage };
  }
  selected = null;
  simulation.rebuildAllEnemyPaths();
  renderStatic();
}
function destroyAt(x, y) {
  const tile = state.grid[y][x];
  if (tile === TILE.EMPTY) return;
  state.grid[y][x] = TILE.EMPTY;
  delete state.towers[keyOf(x, y)];
  const cfg = getTileBuildConfig(tile);
  state.money += cfg ? Number(cfg.refund) : 0;
  simulation.rebuildAllEnemyPaths();
  renderStatic();
}
function getSelectedTower() { if (!selected) return null; return state.towers[keyOf(selected.x, selected.y)] || null; }
function getPremiumUpgradeKey(tower) {
  if (!tower || tower.type !== TILE.TOWER_BASIC) return null;
  return 'gatling_gun';
}
function getPremiumUpgradeData(tower) {
  const premiumKey = getPremiumUpgradeKey(tower);
  if (!premiumKey) return null;
  const premiumConfig = getPremiumUpgradeConfig(CONFIG, tower.type, premiumKey);
  if (!premiumConfig || !Number(premiumConfig.enabled ?? 1)) return null;
  return { premiumKey, premiumConfig };
}
function countPremiumTowers(towerType, premiumKey) {
  return Object.values(state.towers).filter((tower) => tower?.type === towerType && tower?.premiumKey === premiumKey).length;
}
function getPremiumUpgradeCost(tower) {
  const premiumData = getPremiumUpgradeData(tower);
  if (!premiumData) return 0;
  const baseConfig = getTileBuildConfig(tower.type);
  return Math.round(Number(baseConfig.cost || 0) * Number(premiumData.premiumConfig.costMultiplier || 10));
}
function getUpgradeContext(tower) {
  if (!tower) return { mode: 'none', cost: 0, disabled: true, buttonLabel: 'שדרג' };
  const cfg = getTileBuildConfig(tower.type);
  const maxLevel = Number(cfg.maxUpgradeLevel ?? 10);
  const level = Number(tower.level || 0);
  if (tower.premiumKey) return { mode: 'none', cost: 0, disabled: true, buttonLabel: 'פרימיום', reason: 'premium' };
  if (level < maxLevel) return { mode: 'standard', cost: getUpgradeCost(tower), disabled: false, buttonLabel: 'שדרג' };
  const premiumData = getPremiumUpgradeData(tower);
  if (!premiumData) return { mode: 'none', cost: 0, disabled: true, buttonLabel: 'מקסימום', reason: 'maxed' };
  const maxCount = Math.max(1, Number(premiumData.premiumConfig.maxCount || 1));
  if (countPremiumTowers(tower.type, premiumData.premiumKey) >= maxCount) return { mode: 'premium', cost: getPremiumUpgradeCost(tower), disabled: true, buttonLabel: 'פרימיום תפוס', reason: 'limit' };
  return { mode: 'premium', cost: getPremiumUpgradeCost(tower), disabled: false, buttonLabel: 'שדרוג פרימיום', premiumKey: premiumData.premiumKey, premiumConfig: premiumData.premiumConfig };
}
function getUpgradeCost(tower) {
  const cfg = getTileBuildConfig(tower.type), baseCost = Number(cfg.cost), startPct = Number(cfg.upgradeBaseCostPct ?? 40), stepPct = Number(cfg.upgradeStepCostPct ?? 40), level = Number(tower.level || 0), percent = startPct + (level * stepPct);
  return Math.round(baseCost * percent / 100);
}
function upgradeTower(tower) {
  if (!tower) return false;
  const cfg = getTileBuildConfig(tower.type);
  const upgrade = getUpgradeContext(tower);
  if (upgrade.disabled) {
    if (upgrade.reason === 'limit') setMessage('כבר קיים מגדל פרימיום מהסוג הזה');
    else if (upgrade.reason === 'premium') setMessage('מגדל פרימיום לא ניתן לשדרוג נוסף');
    else setMessage('הגעת לרמה המקסימלית');
    return false;
  }
  if (state.money < upgrade.cost) { setMessage(upgrade.mode === 'premium' ? 'אין מספיק כסף לשדרוג פרימיום' : 'אין מספיק כסף לשדרוג'); return false; }
  if (upgrade.mode === 'premium') {
    tower.premiumKey = upgrade.premiumKey;
    tower.baseDamage = Number(upgrade.premiumConfig.damage ?? tower.baseDamage ?? tower.damage ?? 0);
    tower.damage = tower.baseDamage;
    tower.cooldown = 0;
    tower.recoil = 0;
    state.money -= upgrade.cost;
    normalizeTowerStats();
    renderStatic();
    setMessage(`שודרג ל-${upgrade.premiumConfig.label || 'Premium'}`);
    return true;
  }
  if (tower.type !== TILE.TOWER_BUFFER) {
    const dmgPct = Number(cfg.upgradeDamagePct ?? 20);
    tower.baseDamage = Math.round(Number(tower.baseDamage ?? tower.damage) * (1 + dmgPct / 100));
    tower.damage = tower.baseDamage;
  }
  tower.level = Number(tower.level || 0) + 1;
  state.money -= upgrade.cost;
  normalizeTowerStats();
  renderStatic();
  setMessage('שודרג');
  return true;
}
function upgradeSelectedTower() { return upgradeTower(getSelectedTower()); }
function upgradeAt(x, y) {
  const tower = state.towers[keyOf(x, y)];
  if (!tower) { setMessage('אין מגדל במשבצת'); return false; }
  selected = { x, y };
  return upgradeTower(tower);
}
function chooseSkill(skillKey) {
  if (!simulation.chooseSkill(skillKey)) return;
  const level = simulation.getSkillLevel(skillKey);
  setMessage(level > 1 ? `${CONFIG.skills[skillKey].label} עלה לרמה ${level}` : `נבחר סקיל חדש: ${CONFIG.skills[skillKey].label}`);
  renderStatic();
}
function activateSkill(skillKey) {
  const cooldown = Number(state.skills.cooldowns?.[skillKey] || 0);
  if (cooldown > 0) { setMessage(`הסקיל בטעינה לעוד ${cooldown.toFixed(1)} שנ'`); return; }
  if (!simulation.setPendingTargetSkill(skillKey)) { setMessage('הסקיל עדיין לא פתוח'); return; }
  setCurrentTool(TOOL.SELECT);
  setMessage(`בחר משבצת עבור ${CONFIG.skills[skillKey].label}`);
  renderStatic();
}

function openConfig() { ui.openConfig(); }
function closeConfig() { ui.closeConfig(); }
function openCheats() { ui.openCheats(); }
function closeCheats() { ui.closeCheats(); }
function applyConfig() { ui.applyConfig(); normalizeTowerStats(); renderStatic(); }
function resetConfig() { ui.resetConfig(); }
function exportConfig() { ui.exportConfig(); }

async function syncConfigFromDatabase() {
  const remoteConfig = await loadConfigFromDatabase();
  if (!remoteConfig) return false;
  CONFIG = remoteConfig;
  configDraft = deepClone(CONFIG);
  saveConfigToStorage(CONFIG);
  return true;
}

function resetGame() { state = createInitialState(); normalizeTowerStats(); selected = null; hoveredCell = null; setCurrentTool(TOOL.SELECT); setMessage(''); renderStatic(); renderDynamic(); }
function toggleFullscreen() {
  const root = document.documentElement;
  if (!document.fullscreenElement) { root.requestFullscreen?.(); root.style.setProperty('--cell', 'min(46px, calc((100vw - 380px) / 20), calc((100vh - 190px) / 20))'); }
  else { document.exitFullscreen?.(); root.style.setProperty('--cell', 'min(38px, calc((100vw - 380px) / 20), calc((100vh - 190px) / 20))'); }
  requestAnimationFrame(() => { renderStatic(); renderDynamic(); });
}
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) document.documentElement.style.setProperty('--cell', 'min(38px, calc((100vw - 380px) / 20), calc((100vh - 190px) / 20))'); requestAnimationFrame(() => { renderStatic(); renderDynamic(); }); });
window.addEventListener('resize', () => { requestAnimationFrame(() => { renderStatic(); renderDynamic(); }); });

function update(dt) { simulation.update(dt); }
function renderHud() { renderer.renderHud(); }
function renderSelectedInfo() { renderer.renderSelectedInfo(); }
function renderGrid() { renderer.renderGrid(); }
function renderRangeIndicator() { renderer.renderRangeIndicator(); }
function renderEntities() { renderer.renderEntities(); }
function renderStatic() { renderer.renderStatic(); }
function renderDynamic() { renderer.renderDynamic(); }
function initBoard() { renderer.initBoard(); }

boardEl.addEventListener('pointermove', (event) => {
  if (!supportsPlacementRangePreview(currentTool) || state.pendingSkillChoice || state.skills.pendingTargetSkill) {
    clearHoveredCell();
    return;
  }
  const target = getCellFromPointerEvent(event);
  if (!target) {
    clearHoveredCell();
    return;
  }
  setHoveredCell(Number(target.dataset.x), Number(target.dataset.y));
});
boardEl.addEventListener('pointerleave', () => {
  clearHoveredCell();
});

boardEl.addEventListener('pointerdown', (event) => {
  const target = getCellFromPointerEvent(event); if (!target) return;
  event.preventDefault();
  event.stopPropagation();
  const x = Number(target.dataset.x), y = Number(target.dataset.y);
  if (state.pendingSkillChoice) return;
  if (state.skills.pendingTargetSkill) {
    const skillKey = state.skills.pendingTargetSkill;
    if (simulation.castPendingSkillAt(x, y)) {
      setMessage(`${CONFIG.skills[skillKey].label} הופעל`);
      renderStatic();
    }
    return;
  }
  const clickedTower = state.towers[keyOf(x, y)] || null;
  if (clickedTower && currentTool !== TOOL.DESTROY && currentTool !== TOOL.UPGRADE) {
    setCurrentTool(TOOL.SELECT);
    selectCell(x, y);
    return;
  }
  if (currentTool === TOOL.WALL) { buildAt(x, y, TILE.WALL); return; }
  if (currentTool === TOOL.TOWER) { buildAt(x, y, TILE.TOWER_BASIC); return; }
  if (currentTool === TOOL.CANNON) { buildAt(x, y, TILE.TOWER_CANNON); return; }
  if (currentTool === TOOL.SNIPER) { buildAt(x, y, TILE.TOWER_SNIPER); return; }
  if (currentTool === TOOL.EMP) { buildAt(x, y, TILE.TOWER_EMP); return; }
  if (currentTool === TOOL.RAILGUN) { buildAt(x, y, TILE.TOWER_RAILGUN); return; }
  if (currentTool === TOOL.FREEZE) { buildAt(x, y, TILE.TOWER_FREEZE); return; }
  if (currentTool === TOOL.AA) { buildAt(x, y, TILE.TOWER_AA); return; }
  if (currentTool === TOOL.MISSILE) { buildAt(x, y, TILE.TOWER_MISSILE); return; }
  if (currentTool === TOOL.BUFFER) { buildAt(x, y, TILE.TOWER_BUFFER); return; }
  if (currentTool === TOOL.FLAMER) { buildAt(x, y, TILE.TOWER_FLAMER); return; }
  if (currentTool === TOOL.UPGRADE) { upgradeAt(x, y); return; }
  if (currentTool === TOOL.DESTROY) { destroyAt(x, y); return; }
  if (state.grid[y][x] !== TILE.EMPTY) setCurrentTool(TOOL.SELECT);
  selectCell(x, y);
});

document.addEventListener('pointerdown', (event) => {
  const insideBoard = getClosestFromEventTarget(event.target, '#boardShell'), insideBuildBar = getClosestFromEventTarget(event.target, '#buildBar'), insideConfig = getClosestFromEventTarget(event.target, '.config-modal'), insideSidePanel = getClosestFromEventTarget(event.target, '.side-panel'), insideSkill = getClosestFromEventTarget(event.target, '.skill-modal');
  if (!insideBoard && !insideBuildBar && !insideConfig && !insideSidePanel && !insideSkill) clearSelection();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (state.skills.pendingTargetSkill) { simulation.clearPendingTargetSkill(); renderStatic(); }
    else if (configOverlayEl.classList.contains('open')) closeConfig();
    else if (cheatsOverlayEl.classList.contains('open')) closeCheats();
    else clearSelection();
  }
});

pauseBtn.addEventListener('click', () => {
  if (state.pendingSkillChoice) return;
  if (!state.hasStarted) {
    state.hasStarted = true;
    state.running = true;
  } else state.running = !state.running;
  renderHud();
});
fullscreenBtn.addEventListener('click', toggleFullscreen);
cheatsBtn.addEventListener('click', openCheats);
resetBtn.addEventListener('click', resetGame);
configBtn.addEventListener('click', openConfig);
closeConfigBtn.addEventListener('click', closeConfig);
cancelConfigBtn.addEventListener('click', closeConfig);
saveConfigBtn.addEventListener('click', applyConfig);
resetConfigBtn.addEventListener('click', resetConfig);
exportConfigBtn.addEventListener('click', exportConfig);
closeCheatsBtn.addEventListener('click', closeCheats);
skillChoicesEl.addEventListener('pointerdown', (event) => {
  const button = getClosestFromEventTarget(event.target, '[data-skill-choice]');
  if (!button) return;
  event.stopPropagation();
  chooseSkill(button.dataset.skillChoice);
});
skillBarEl.addEventListener('pointerdown', (event) => {
  const button = getClosestFromEventTarget(event.target, '[data-skill-key]');
  if (!button) return;
  event.stopPropagation();
  activateSkill(button.dataset.skillKey);
});
configOverlayEl.addEventListener('click', (event) => { if (event.target === configOverlayEl) closeConfig(); });
cheatsOverlayEl.addEventListener('click', (event) => { if (event.target === cheatsOverlayEl) closeCheats(); });
addMoneyBtn.addEventListener('click', () => { state.money += Number(cheatMoneyInput.value || 10000); renderHud(); setMessage('נוסף כסף'); });
skipWaveBtn.addEventListener('click', () => { state.spawnQueue = 0; state.specialSpawnQueue = []; state.enemies = []; renderDynamic(); setMessage('הגל הסתיים'); });
clearEnemiesBtn.addEventListener('click', () => { state.enemies = []; renderDynamic(); setMessage('האויבים נוקו'); });
spawnAirBtn.addEventListener('click', () => { state.enemies.push(simulation.spawnEnemy(state.enemyId++, state.wave, state.grid, 'flyer')); state.enemies.push(simulation.spawnEnemy(state.enemyId++, state.wave, state.grid, 'flyer_heavy')); renderDynamic(); setMessage('זומנו אויבים אוויריים'); });
freeBuildBtn.addEventListener('click', () => { freeBuildUntil = (performance.now() / 1000) + 30; setMessage('בנייה חינם ל-30 שניות'); });
maxSelectedBtn.addEventListener('click', () => {
  const tower = getSelectedTower(); if (!tower) { setMessage('אין מגדל מסומן'); return; }
  const cfg = getTileBuildConfig(tower.type), maxLevel = Number(cfg.maxUpgradeLevel ?? 10); tower.level = maxLevel;
  if (tower.type !== TILE.TOWER_BUFFER) {
    tower.baseDamage = calculateTowerBaseDamage({ ...tower, level: maxLevel });
    tower.damage = tower.baseDamage;
  }
  renderStatic(); setMessage('המגדל הועלה למקסימום');
});
togglePauseCheatBtn.addEventListener('click', () => {
  if (state.pendingSkillChoice) return;
  if (!state.hasStarted) state.hasStarted = true;
  state.running = !state.running;
  renderHud();
});

buildWallBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.WALL ? TOOL.SELECT : TOOL.WALL));
buildTowerBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.TOWER ? TOOL.SELECT : TOOL.TOWER));
buildCannonBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.CANNON ? TOOL.SELECT : TOOL.CANNON));
buildSniperBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.SNIPER ? TOOL.SELECT : TOOL.SNIPER));
buildEmpBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.EMP ? TOOL.SELECT : TOOL.EMP));
buildRailgunBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.RAILGUN ? TOOL.SELECT : TOOL.RAILGUN));
buildFreezeBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.FREEZE ? TOOL.SELECT : TOOL.FREEZE));
buildAABtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.AA ? TOOL.SELECT : TOOL.AA));
buildMissileBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.MISSILE ? TOOL.SELECT : TOOL.MISSILE));
buildBufferBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.BUFFER ? TOOL.SELECT : TOOL.BUFFER));
buildFlamerBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.FLAMER ? TOOL.SELECT : TOOL.FLAMER));
upgradeModeBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.UPGRADE ? TOOL.SELECT : TOOL.UPGRADE));
destroyBtn.addEventListener('click', () => setCurrentTool(currentTool === TOOL.DESTROY ? TOOL.SELECT : TOOL.DESTROY));

function frame(now) { const dt = Math.min(0.05, (now - lastFrameTime) / 1000 || 0); lastFrameTime = now; update(dt); renderDynamic(); requestAnimationFrame(frame); }

async function bootstrap() {
  const loaded = await syncConfigFromDatabase();
  state = createInitialState();
  normalizeTowerStats();
  initBoard();
  syncButtonLabels();
  setCurrentTool(TOOL.SELECT);
  renderStatic();
  renderDynamic();
  if (loaded) setMessage('הקונפיג נטען מהדאטאבייס');
  requestAnimationFrame(frame);
}

bootstrap();
