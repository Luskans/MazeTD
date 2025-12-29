export const TOWERS_DATA: Record<string, any> = {
  basic: {
    id: "basic",
    type: "tower",
    name: "Basic Totem",
    description: "Totem polyvalent qui peut se revendre à 95% des dépenses totales.",
    size: 2,    
    stats: {
      damageMultiplier: 100,
      damageInfo: 3,
      attackSpeedMultiplier: 100,
      attackSpeedInfo: 3,
      range: 100,
      rangeInfo: 3
    },
    targeting: {
      mode: "single",
      maxTargets: 1,
      canTargetGround: true,
      canTargetAir: true,
    },
    attack: {
      mode: "circle",
      dual: false,
      angle: 360,
      direction: 0
    },
    projectile: {
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: 1
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: 4
    },
    pierce: {
      enabled: false,
      count: 1,
      damageReduction: 10,
      info: 5
    },
    price: 20,
    sellPercentage: 70
  },

  earth_shock: {
    id: "earth_shock",
    type: "tower",
    name: "Earth Shock Totem",
    description: "Pulse une onde de choc autour de lui, infligeant des dégats à tous les ennemis.",
    size: 2,    
    stats: {
      damageMultiplier: 65,
      damageInfo: 2,
      attackSpeedMultiplier: 90,
      attackSpeedInfo: 3,
      range: 80,
      rangeInfo: 2
    },
    targeting: {
      mode: "area",
      maxTargets: 1,
      canTargetGround: true,
      canTargetAir: false,
    },
    attack: {
      mode: "circle",
      dual: false,
      angle: 360,
      direction: 0
    },
    projectile: {
      enabled: false,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: 1
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: 4
    },
    pierce: {
      enabled: false,
      count: 1,
      damageReduction: 10,
      info: 5
    },
    price: 20,
    sellPercentage: 70
  },

  water_wave: {
    id: "water_wave",
    type: "tower",
    name: "Water Wave Totem",
    description: "Projette une vague en cône, infligeant des dégats à tous les ennemis.",
    size: 2,    
    stats: {
      damageMultiplier: 80,
      damageInfo: 3,
      attackSpeedMultiplier: 120,
      attackSpeedInfo: 4,
      range: 100,
      rangeInfo: 3
    },
    targeting: {
      mode: "area",
      maxTargets: 1,
      canTargetGround: true,
      canTargetAir: true,
    },
    attack: {
      mode: "cone",
      dual: false,
      angle: 90,
      direction: 0
    },
    projectile: {
      enabled: false,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: 1
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: 4
    },
    pierce: {
      enabled: false,
      count: 1,
      damageReduction: 10,
      info: 5
    },
    price: 20,
    sellPercentage: 70
  },

  fire_ball: {
    id: "fire_ball",
    type: "tower",
    name: "Fire Ball Totem",
    description: "Projette une boule de feu qui inflige des dégats aux ennemis dans une grande zone.",
    size: 2,    
    stats: {
      damageMultiplier: 80,
      damageInfo: 3,
      attackSpeedMultiplier: 100,
      attackSpeedInfo: 1,
      range: 150,
      rangeInfo: 4
    },
    targeting: {
      mode: "single",
      maxTargets: 1,
      canTargetGround: true,
      canTargetAir: true,
    },
    attack: {
      mode: "circle",
      dual: false,
      angle: 360,
      direction: 0
    },
    projectile: {
      enabled: true,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: true,
      radius: 50,
      info: 5
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: 4
    },
    pierce: {
      enabled: false,
      count: 1,
      damageReduction: 10,
      info: 5
    },
    price: 20,
    sellPercentage: 70
  },

  ice_spike: {
    id: "ice_spike",
    type: "tower",
    name: "Ice Spike Totem",
    description: "Projette un pique de glace qui traverse tous les ennemis en ligne dans une direction.",
    size: 2,    
    stats: {
      damageMultiplier: 120,
      damageInfo: 5,
      attackSpeedMultiplier: 60,
      attackSpeedInfo: 1,
      range: 200,
      rangeInfo: 5
    },
    targeting: {
      mode: "single",
      maxTargets: 1,
      canTargetGround: true,
      canTargetAir: true,
    },
    attack: {
      mode: "line",
      dual: false,
      angle: 360,
      direction: 0
    },
    projectile: {
      enabled: true,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: 5
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: 4
    },
    pierce: {
      enabled: true,
      count: 10,
      damageReduction: 10,
      info: 5
    },
    price: 20,
    sellPercentage: 70
  },

  chain_lightning: {
    id: "chain_lightning",
    type: "tower",
    name: "Chain Lightning Towtem",
    description: "Crée un arc électrique qui rebondit sur 5 ennemis aériens.",
    size: 2,    
    stats: {
      damageMultiplier: 160,
      damageInfo: 5,
      attackSpeedMultiplier: 90,
      attackSpeedInfo: 3,
      range: 80,
      rangeInfo: 2
    },
    targeting: {
      mode: "single",
      maxTargets: 1,
      canTargetGround: false,
      canTargetAir: true, 
    },
    attack: {
      mode: "circle",
      dual: false,
      angle: 360,
      direction: 0
    },
    projectile: {
      enabled: false,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: 5
    },
    chain: {
      enabled: true,
      count: 5,
      range: 10,
      damageReduction: 10,
      info: 4
    },
    pierce: {
      enabled: false,
      count: 10,
      damageReduction: 10,
      info: 5
    },
    price: 20,
    sellPercentage: 70
  },

  multi_vine: {
    id: "multi_vine",
    type: "tower",
    name: "Multi Vine Totem",
    description: "Crée des lianes qui inflige des dégâts à 3 ennemis à portée.",
    size: 2,    
    stats: {
      damageMultiplier: 80,
      damageInfo: 2,
      attackSpeedMultiplier: 140,
      attackSpeedInfo: 5,
      range: 120,
      rangeInfo: 3
    },
    targeting: {
      mode: "multi",
      maxTargets: 3,
      canTargetGround: true,
      canTargetAir: true,
    },
    attack: {
      mode: "circle",
      dual: false,
      angle: 360,
      direction: 0
    },
    projectile: {
      enabled: false,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: 5
    },
    chain: {
      enabled: false,
      count: 5,
      range: 10,
      damageReduction: 10,
      info: 4
    },
    pierce: {
      enabled: false,
      count: 10,
      damageReduction: 10,
      info: 5
    },
    price: 20,
    sellPercentage: 70
  }
};
  