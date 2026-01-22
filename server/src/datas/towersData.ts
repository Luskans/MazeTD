const DIR = { RIGHT: 0, DOWN: 1, LEFT: 2, UP: 3 };

export const TOWERS_DATA: Record<string, any> = {
  basic: {
    id: "basic",
    type: "tower",
    name: "Basic Rune",
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
      quad: false,
      angle: 360,
      direction: DIR.RIGHT
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

  earth: {
    id: "earth",
    type: "tower",
    name: "Earth Shock Rune",
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
      quad: false,
      angle: 360,
      direction: DIR.RIGHT
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

  water: {
    id: "water",
    type: "tower",
    name: "Water Wave Rune",
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
      quad: false,
      angle: 90,
      direction: DIR.RIGHT
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

  fire: {
    id: "fire",
    type: "tower",
    name: "Fire Nova Rune",
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
      quad: false,
      angle: 360,
      direction: DIR.RIGHT
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

  ice: {
    id: "ice",
    type: "tower",
    name: "Ice Spike Rune",
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
      quad: true,
      angle: 360,
      direction: DIR.RIGHT
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

  electric: {
    id: "electric",
    type: "tower",
    name: "Chain Lightning Rune",
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
      quad: false,
      angle: 360,
      direction: DIR.RIGHT
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

  nature: {
    id: "nature",
    type: "tower",
    name: "Multi Vines Rune",
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
      mode: "cone",
      dual: true,
      quad: false,
      angle: 60,
      direction: DIR.RIGHT
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
  