export const GRID_SIZE = 20;
export const START = { x: 0, y: Math.floor(GRID_SIZE / 2) };
export const GOAL = { x: GRID_SIZE - 1, y: Math.floor(GRID_SIZE / 2) };
export const STORAGE_KEY = 'td-config-v13';
export const CONFIG_API_PATH = '/.netlify/functions/config';

export const TILE = {
  EMPTY: 'empty',
  WALL: 'wall',
  TOWER_BASIC: 'tower_basic',
  TOWER_CANNON: 'tower_cannon',
  TOWER_SNIPER: 'tower_sniper',
  TOWER_EMP: 'tower_emp',
  TOWER_RAILGUN: 'tower_railgun',
  TOWER_FREEZE: 'tower_freeze',
  TOWER_AA: 'tower_aa',
  TOWER_MISSILE: 'tower_missile',
  TOWER_BUFFER: 'tower_buffer',
  TOWER_FLAMER: 'tower_flamer',
};

export const TOOL = {
  SELECT: 'select',
  WALL: 'wall',
  TOWER: 'tower',
  CANNON: 'cannon',
  SNIPER: 'sniper',
  EMP: 'emp',
  RAILGUN: 'railgun',
  FREEZE: 'freeze',
  AA: 'aa',
  MISSILE: 'missile',
  BUFFER: 'buffer',
  FLAMER: 'flamer',
  UPGRADE: 'upgrade',
  DESTROY: 'destroy',
};

export const DEFAULT_CONFIG = {
  enemies: {
    grunt: {
      baseHp: 42,
      speed: 1.35,
      baseReward: 3,
      hpPerWavePct: 32,
      rewardPerLevelPct: 5,
      hpPerLevelPct: 0,
      spawnWeight: 1
    },
    fast: {
      baseHp: 24,
      speed: 3,
      baseReward: 2,
      hpPerWavePct: 32,
      rewardPerLevelPct: 5,
      hpPerLevelPct: 0,
      spawnWeight: 0.55
    },
    tank: {
      baseHp: 95,
      speed: 0.72,
      baseReward: 4,
      hpPerWavePct: 32,
      rewardPerLevelPct: 5,
      hpPerLevelPct: 0,
      spawnWeight: 0.35
    },
    flyer: {
      baseHp: 22,
      speed: 3.2,
      baseReward: 3,
      hpPerWavePct: 32,
      rewardPerLevelPct: 5,
      hpPerLevelPct: 0,
      spawnWeight: 0.28
    },
    flyer_heavy: {
      baseHp: 58,
      speed: 1.7,
      baseReward: 4,
      hpPerWavePct: 32,
      rewardPerLevelPct: 5,
      hpPerLevelPct: 0,
      spawnWeight: 0.18
    },
    miniboss: {
      baseHp: 150,
      speed: 0.95,
      baseReward: 20,
      hpPerWavePct: 32,
      rewardPerLevelPct: 8,
      hpPerLevelPct: 0,
      spawnWeight: 0
    },
    boss: {
      baseHp: 300,
      speed: 0.8,
      baseReward: 45,
      hpPerWavePct: 32,
      rewardPerLevelPct: 10,
      hpPerLevelPct: 0,
      spawnWeight: 0
    },
    global: {
      levelEveryWaves: 3,
      spawnDelayBase: 0.85,
      spawnDelayWaveDelta: 0.025,
      spawnDelayMin: 0.24,
      intermissionBase: 1.8,
      intermissionWaveDelta: 0.03,
      intermissionMin: 0.75,
      waveEnemyBase: 4,
      waveEnemyGrowth: 1,
      speedPerWave: 0.025,
      speedPerWaveCap: 0.8,
      countdownSeconds: 3
    }
  },
  buildings: {
    wall: {
      cost: 10,
      refund: 5
    },
    tower_basic: {
      cost: 30,
      refund: 15,
      range: 3,
      damage: 12,
      fireRate: 109.1,
      canHitAir: 1,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10,
      premium: {
        gatling_gun: {
          enabled: 1,
          label: 'Gatling Gun',
          costMultiplier: 10,
          range: 4,
          damage: 50,
          fireRate: 500,
          canHitAir: 1,
          airOnly: 0,
          maxCount: 1
        }
      }
    },
    tower_cannon: {
      cost: 50,
      refund: 25,
      range: 2.6,
      damage: 26,
      fireRate: 33.3,
      splashRadius: 1.35,
      canHitAir: 0,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10
    },
    tower_sniper: {
      cost: 65,
      refund: 32,
      range: 7.5,
      damage: 80,
      fireRate: 20,
      canHitAir: 0,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10
    },
    tower_emp: {
      cost: 45,
      refund: 22,
      range: 2.2,
      damage: 4,
      fireRate: 50,
      slowPct: 25,
      slowDuration: 1.2,
      slowUpgradePct: 2,
      canHitAir: 1,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10
    },
    tower_railgun: {
      cost: 100,
      refund: 50,
      range: 6.2,
      damage: 30,
      fireRate: 30,
      pierceCount: 4,
      lineWidth: 0.55,
      canHitAir: 0,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10
    },
    tower_freeze: {
      cost: 55,
      refund: 27,
      range: 3.5,
      damage: 2,
      fireRate: 120,
      slowPct: 55,
      slowDuration: 1.3,
      slowUpgradePct: 3,
      canHitAir: 0,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10
    },
    tower_aa: {
      cost: 40,
      refund: 20,
      range: 5.2,
      damage: 7,
      fireRate: 333.3,
      canHitAir: 1,
      airOnly: 1,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10
    },
    tower_missile: {
      cost: 120,
      refund: 60,
      range: 8.5,
      damage: 34,
      fireRate: 25,
      splashRadius: 1.8,
      canHitAir: 1,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10
    },
    tower_buffer: {
      cost: 60,
      refund: 30,
      damageBuffPct: 10,
      fireRateBuffPct: 10,
      auraRange: 1,
      canHitAir: 0,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 3,
      maxUpgradeLevel: 10
    },
    tower_flamer: {
      cost: 80,
      refund: 40,
      range: 2.8,
      flameLength: 2.8,
      damage: 1,
      fireRate: 1200,
      coneWidth: 0.85,
      burnDps: 8,
      burnDuration: 1.8,
      canHitAir: 0,
      upgradeBaseCostPct: 40,
      upgradeStepCostPct: 40,
      upgradeDamagePct: 20,
      maxUpgradeLevel: 10
    }
  },
  skills: {
    progression: {
      wavesPerChoice: 3,
      choicesPerOffer: 3
    },
    tower_damage: {
      label: "נזק",
      type: "passive",
      valuePerLevelPct: 2
    },
    tower_fire_rate: {
      label: "קצב אש",
      type: "passive",
      valuePerLevelPct: 2
    },
    tower_range: {
      label: "טווח",
      type: "passive",
      valuePerLevelPct: 2
    },
    tower_money: {
      label: "כסף",
      type: "passive",
      valuePerLevelPct: 5
    },
    toxic_gas: {
      label: "גז רעיל",
      type: "active",
      radius: 1.35,
      duration: 7,
      durationPerLevel: 1,
      dps: 90,
      dpsPerLevel: 6,
      waveDamageMultiplierPct: 2,
      cooldown: 26,
      cooldownReductionPerLevel: 2
    },
    glue_bomb: {
      label: "פצצת דבק",
      type: "active",
      slowPct: 60,
      slowPctPerLevel: 6,
      duration: 7,
      durationPerLevel: 1,
      waveDamageMultiplierPct: 0,
      cooldown: 22,
      cooldownReductionPerLevel: 1.5
    },
    phosphorus_bomb: {
      label: "פצצת זרחן",
      type: "active",
      burnDps: 75,
      burnDpsPerLevel: 5,
      waveDamageMultiplierPct: 2.5,
      burnDuration: 3,
      burnDurationPerLevel: 0.6,
      tileDuration: 8,
      tileDurationPerLevel: 1,
      cooldown: 28,
      cooldownReductionPerLevel: 2
    }
  }
};

export const CONFIG_SCHEMA = {
  enemies: { sections: {
    grunt: { title: 'אויב רגיל', fields: { baseHp: { label: 'חיים בסיסיים', step: 1 }, speed: { label: 'מהירות', step: 0.01 }, baseReward: { label: 'כסף בסיסי', step: 1 }, hpPerWavePct: { label: 'אחוז חיים לכל גל', step: 1 }, rewardPerLevelPct: { label: 'אחוז כסף לכל רמה', step: 1 }, hpPerLevelPct: { label: 'אחוז חיים לכל רמה', step: 1 }, spawnWeight: { label: 'משקל הופעה', step: 0.05 } } },
    fast: { title: 'אויב מהיר', fields: { baseHp: { label: 'חיים בסיסיים', step: 1 }, speed: { label: 'מהירות', step: 0.01 }, baseReward: { label: 'כסף בסיסי', step: 1 }, hpPerWavePct: { label: 'אחוז חיים לכל גל', step: 1 }, rewardPerLevelPct: { label: 'אחוז כסף לכל רמה', step: 1 }, hpPerLevelPct: { label: 'אחוז חיים לכל רמה', step: 1 }, spawnWeight: { label: 'משקל הופעה', step: 0.05 } } },
    tank: { title: 'אויב טנק', fields: { baseHp: { label: 'חיים בסיסיים', step: 1 }, speed: { label: 'מהירות', step: 0.01 }, baseReward: { label: 'כסף בסיסי', step: 1 }, hpPerWavePct: { label: 'אחוז חיים לכל גל', step: 1 }, rewardPerLevelPct: { label: 'אחוז כסף לכל רמה', step: 1 }, hpPerLevelPct: { label: 'אחוז חיים לכל רמה', step: 1 }, spawnWeight: { label: 'משקל הופעה', step: 0.05 } } },
    flyer: { title: 'אויב אווירי מהיר', fields: { baseHp: { label: 'חיים בסיסיים', step: 1 }, speed: { label: 'מהירות', step: 0.01 }, baseReward: { label: 'כסף בסיסי', step: 1 }, hpPerWavePct: { label: 'אחוז חיים לכל גל', step: 1 }, rewardPerLevelPct: { label: 'אחוז כסף לכל רמה', step: 1 }, hpPerLevelPct: { label: 'אחוז חיים לכל רמה', step: 1 }, spawnWeight: { label: 'משקל הופעה', step: 0.05 } } },
    flyer_heavy: { title: 'אויב אווירי כבד', fields: { baseHp: { label: 'חיים בסיסיים', step: 1 }, speed: { label: 'מהירות', step: 0.01 }, baseReward: { label: 'כסף בסיסי', step: 1 }, hpPerWavePct: { label: 'אחוז חיים לכל גל', step: 1 }, rewardPerLevelPct: { label: 'אחוז כסף לכל רמה', step: 1 }, hpPerLevelPct: { label: 'אחוז חיים לכל רמה', step: 1 }, spawnWeight: { label: 'משקל הופעה', step: 0.05 } } },
    miniboss: { title: 'מיני בוס', fields: { baseHp: { label: 'חיים בסיסיים', step: 1 }, speed: { label: 'מהירות', step: 0.01 }, baseReward: { label: 'כסף בסיסי', step: 1 }, hpPerWavePct: { label: 'אחוז חיים לכל גל', step: 1 }, rewardPerLevelPct: { label: 'אחוז כסף לכל רמה', step: 1 }, hpPerLevelPct: { label: 'אחוז חיים לכל רמה', step: 1 }, spawnWeight: { label: 'משקל הופעה', step: 0.05 } } },
    boss: { title: 'בוס', fields: { baseHp: { label: 'חיים בסיסיים', step: 1 }, speed: { label: 'מהירות', step: 0.01 }, baseReward: { label: 'כסף בסיסי', step: 1 }, hpPerWavePct: { label: 'אחוז חיים לכל גל', step: 1 }, rewardPerLevelPct: { label: 'אחוז כסף לכל רמה', step: 1 }, hpPerLevelPct: { label: 'אחוז חיים לכל רמה', step: 1 }, spawnWeight: { label: 'משקל הופעה', step: 0.05 } } },
    global: { title: 'כללי', fields: { levelEveryWaves: { label: 'כל כמה גלים רמה עולה', step: 1 }, spawnDelayBase: { label: 'זמן ספאון בסיסי', step: 0.01 }, spawnDelayWaveDelta: { label: 'הפחתת ספאון לגל', step: 0.001 }, spawnDelayMin: { label: 'מינימום ספאון', step: 0.01 }, intermissionBase: { label: 'הפסקה בין גלים', step: 0.01 }, intermissionWaveDelta: { label: 'הפחתת הפסקה לגל', step: 0.001 }, intermissionMin: { label: 'מינימום הפסקה', step: 0.01 }, waveEnemyBase: { label: 'אויבים בסיסיים בגל', step: 1 }, waveEnemyGrowth: { label: 'גידול אויבים לגל', step: 0.1 }, speedPerWave: { label: 'מהירות נוספת לגל', step: 0.001 }, speedPerWaveCap: { label: 'תקרת מהירות נוספת', step: 0.01 }, countdownSeconds: { label: 'ספירה לפני גל', step: 0.1 } } },
  }},
  buildings: { sections: {
    wall: { title: 'חומה', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 } } },
    tower_basic: { title: 'מגדל שמירה', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח', step: 0.1 }, damage: { label: 'נזק', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_basic_premium: { title: 'מגדל שמירה - פרימיום', fields: { premiumCostMultiplier: { label: 'מכפיל עלות פרימיום', step: 0.1, path: 'buildings.tower_basic.premium.gatling_gun.costMultiplier' }, premiumRange: { label: 'טווח פרימיום', step: 0.1, path: 'buildings.tower_basic.premium.gatling_gun.range' }, premiumDamage: { label: 'נזק פרימיום', step: 1, path: 'buildings.tower_basic.premium.gatling_gun.damage' }, premiumFireRate: { label: 'קצב אש פרימיום (RPM)', step: 1, path: 'buildings.tower_basic.premium.gatling_gun.fireRate' }, premiumCanHitAir: { label: 'פרימיום תוקף אוויר 1/0', step: 1, path: 'buildings.tower_basic.premium.gatling_gun.canHitAir' }, premiumAirOnly: { label: 'פרימיום רק אוויר 1/0', step: 1, path: 'buildings.tower_basic.premium.gatling_gun.airOnly' }, premiumMaxCount: { label: 'מקסימום עותקים פרימיום', step: 1, path: 'buildings.tower_basic.premium.gatling_gun.maxCount' } } },
    tower_cannon: { title: 'תותח', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח', step: 0.1 }, damage: { label: 'נזק', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, splashRadius: { label: 'רדיוס פיצוץ', step: 0.05 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_sniper: { title: 'צלף', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח', step: 0.1 }, damage: { label: 'נזק', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_emp: { title: 'EMP', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח', step: 0.1 }, damage: { label: 'נזק', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, slowPct: { label: 'האטה %', step: 1 }, slowDuration: { label: 'משך האטה', step: 0.1 }, slowUpgradePct: { label: 'תוספת האטה לשדרוג %', step: 1 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_railgun: { title: 'Railgun', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח', step: 0.1 }, damage: { label: 'נזק', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, pierceCount: { label: 'כמות חדירה', step: 1 }, lineWidth: { label: 'רוחב קו', step: 0.05 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_freeze: { title: 'קרן קירור', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח', step: 0.1 }, damage: { label: 'נזק', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, slowPct: { label: 'האטה %', step: 1 }, slowDuration: { label: 'משך האטה', step: 0.1 }, slowUpgradePct: { label: 'תוספת האטה לשדרוג %', step: 1 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_aa: { title: 'הגנה אווירית', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח', step: 0.1 }, damage: { label: 'נזק', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, airOnly: { label: 'רק אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_missile: { title: 'משגר טילים', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח', step: 0.1 }, damage: { label: 'נזק', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, splashRadius: { label: 'רדיוס פיצוץ', step: 0.05 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_buffer: { title: 'מגדל באף', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, damageBuffPct: { label: 'בונוס נזק %', step: 1 }, fireRateBuffPct: { label: 'בונוס קצב אש %', step: 1 }, auraRange: { label: 'טווח הילה', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת לבונוס %', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
    tower_flamer: { title: 'להביור', fields: { cost: { label: 'מחיר', step: 1 }, refund: { label: 'החזר בהריסה', step: 1 }, range: { label: 'טווח זיהוי', step: 0.1 }, flameLength: { label: 'אורך להבה', step: 0.1 }, damage: { label: 'נזק מיידי', step: 1 }, fireRate: { label: 'קצב אש (RPM)', step: 1 }, coneWidth: { label: 'רוחב חרוט', step: 0.05 }, burnDps: { label: 'נזק שריפה לשנייה', step: 1 }, burnDuration: { label: 'משך שריפה', step: 0.1 }, canHitAir: { label: 'תוקף אוויר 1/0', step: 1 }, upgradeBaseCostPct: { label: 'עלות שדרוג ראשונה %', step: 1 }, upgradeStepCostPct: { label: 'תוספת % לכל שדרוג', step: 1 }, upgradeDamagePct: { label: 'תוספת נזק % לשדרוג', step: 1 }, maxUpgradeLevel: { label: 'רמת מקסימום', step: 1 } } },
  }},
  skills: { sections: {
    progression: { title: 'סקילים - מחזור בחירה', fields: { wavesPerChoice: { label: 'כל כמה גלים בחירת סקיל', step: 1 }, choicesPerOffer: { label: 'כמה אפשרויות בכל בחירה', step: 1 } } },
    passive: { title: 'סקילים פאסיביים', fields: {
      tower_damage: { label: 'נזק % לכל רמה', step: 0.1, path: 'skills.tower_damage.valuePerLevelPct' },
      tower_fire_rate: { label: 'קצב אש % לכל רמה', step: 0.1, path: 'skills.tower_fire_rate.valuePerLevelPct' },
      tower_range: { label: 'טווח % לכל רמה', step: 0.1, path: 'skills.tower_range.valuePerLevelPct' },
      tower_money: { label: 'כסף % לכל רמה', step: 0.1, path: 'skills.tower_money.valuePerLevelPct' }
    } },
    toxic_gas: { title: 'גז רעיל', fields: { radius: { label: 'רדיוס ענן', step: 0.05 }, duration: { label: 'משך בסיסי', step: 0.1 }, durationPerLevel: { label: 'תוספת משך לכל רמה', step: 0.1 }, dps: { label: 'נזק לשנייה', step: 1 }, dpsPerLevel: { label: 'תוספת נזק לכל רמה', step: 1 }, waveDamageMultiplierPct: { label: 'מכפיל נזק לכל גל %', step: 0.1 }, cooldown: { label: 'זמן טעינה', step: 0.1 }, cooldownReductionPerLevel: { label: 'הפחתת טעינה לכל רמה', step: 0.1 } } },
    glue_bomb: { title: 'פצצת דבק', fields: { slowPct: { label: 'האטה %', step: 1 }, slowPctPerLevel: { label: 'תוספת האטה לכל רמה', step: 1 }, duration: { label: 'משך משבצת דביקה', step: 0.1 }, durationPerLevel: { label: 'תוספת משך לכל רמה', step: 0.1 }, waveDamageMultiplierPct: { label: 'מכפיל נזק לכל גל %', step: 0.1 }, cooldown: { label: 'זמן טעינה', step: 0.1 }, cooldownReductionPerLevel: { label: 'הפחתת טעינה לכל רמה', step: 0.1 } } },
    phosphorus_bomb: { title: 'פצצת זרחן', fields: { burnDps: { label: 'שריפה DPS', step: 1 }, burnDpsPerLevel: { label: 'תוספת DPS לכל רמה', step: 1 }, waveDamageMultiplierPct: { label: 'מכפיל נזק לכל גל %', step: 0.1 }, burnDuration: { label: 'משך שריפה על אויב', step: 0.1 }, burnDurationPerLevel: { label: 'תוספת משך שריפה לכל רמה', step: 0.1 }, tileDuration: { label: 'משך משבצת בוערת', step: 0.1 }, tileDurationPerLevel: { label: 'תוספת משך משבצת לכל רמה', step: 0.1 }, cooldown: { label: 'זמן טעינה', step: 0.1 }, cooldownReductionPerLevel: { label: 'הפחתת טעינה לכל רמה', step: 0.1 } } },
  }},
};

export function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }
export function deepMerge(base, extra) {
  const output = deepClone(base);
  for (const key of Object.keys(extra || {})) {
    if (extra[key] && typeof extra[key] === 'object' && !Array.isArray(extra[key])) output[key] = deepMerge(output[key] || {}, extra[key]);
    else output[key] = extra[key];
  }
  return output;
}
export function loadConfigFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return deepClone(DEFAULT_CONFIG);
    return deepMerge(DEFAULT_CONFIG, JSON.parse(raw));
  } catch {
    return deepClone(DEFAULT_CONFIG);
  }
}
export function saveConfig(config) { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); }
export async function loadConfigFromDatabase() {
  try {
    const response = await fetch(CONFIG_API_PATH, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload?.config) return null;
    return deepMerge(DEFAULT_CONFIG, payload.config);
  } catch {
    return null;
  }
}
export async function saveConfigToDatabase(config) {
  const response = await fetch(CONFIG_API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ config }),
  });
  if (!response.ok) {
    let message = 'שמירת הקונפיג בדאטאבייס נכשלה';
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch {}
    throw new Error(message);
  }
  const payload = await response.json();
  return payload;
}
export function getPremiumUpgradeConfig(config, tile, premiumKey) {
  const baseConfig = getBuildingConfig(config, tile);
  if (!baseConfig?.premium) return null;
  return baseConfig.premium[premiumKey] || null;
}
export function getTowerRuntimeConfig(config, tower, tile) {
  const baseConfig = getBuildingConfig(config, tile);
  if (!baseConfig) return null;
  if (!tower?.premiumKey) return baseConfig;
  const premiumConfig = getPremiumUpgradeConfig(config, tile, tower.premiumKey);
  if (!premiumConfig || !Number(premiumConfig.enabled ?? 1)) return baseConfig;
  return { ...baseConfig, ...premiumConfig };
}
export function getTowerDisplayName(config, tile, tower = null) {
  if (tile === TILE.TOWER_BASIC && tower?.premiumKey === 'gatling_gun') return config?.buildings?.tower_basic?.premium?.gatling_gun?.label || 'Gatling Gun';
  const labels = { [TILE.EMPTY]: 'ריק', [TILE.WALL]: 'חומה', [TILE.TOWER_BASIC]: 'מגדל שמירה', [TILE.TOWER_CANNON]: 'תותח', [TILE.TOWER_SNIPER]: 'צלף', [TILE.TOWER_EMP]: 'EMP', [TILE.TOWER_RAILGUN]: 'Railgun', [TILE.TOWER_FREEZE]: 'קרן קירור', [TILE.TOWER_AA]: 'נ"מ', [TILE.TOWER_MISSILE]: 'טילים', [TILE.TOWER_BUFFER]: 'מגדל באף', [TILE.TOWER_FLAMER]: 'להביור' };
  return labels[tile] || tile;
}
export function getBuildingConfig(config, tile) {
  const map = {
    [TILE.WALL]: config.buildings.wall,
    [TILE.TOWER_BASIC]: config.buildings.tower_basic,
    [TILE.TOWER_CANNON]: config.buildings.tower_cannon,
    [TILE.TOWER_SNIPER]: config.buildings.tower_sniper,
    [TILE.TOWER_EMP]: config.buildings.tower_emp,
    [TILE.TOWER_RAILGUN]: config.buildings.tower_railgun,
    [TILE.TOWER_FREEZE]: config.buildings.tower_freeze,
    [TILE.TOWER_AA]: config.buildings.tower_aa,
    [TILE.TOWER_MISSILE]: config.buildings.tower_missile,
    [TILE.TOWER_BUFFER]: config.buildings.tower_buffer,
    [TILE.TOWER_FLAMER]: config.buildings.tower_flamer,
  };
  return map[tile] || null;
}
export function tileLabel(tile) {
  return getTowerDisplayName(DEFAULT_CONFIG, tile, null);
}

