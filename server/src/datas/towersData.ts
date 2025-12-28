export const TOWERS_DATA: Record<string, any> = {
  basic: {
    id: "basic",
    type: "tower",
    name: "Basic Tower",
    description: "Tour polyvalente qui peut se revendre à 95% des dépenses totales.",
    size: 2,    
    stats: {
      damageMultiplier: 1,
      damageInfo: "medium",
      attackSpeedMultiplier: 1,
      attackSpeedInfo: "medium",
      range: 100,
      rangeInfo: "medium"
    },
    targeting: {
      mode: "circle", // line ou cone
      canTargetGround: true,
      canTargetAir: true,
      dual: false,
      angle: 360,
      direction: 0
    },
    attack: {
      mode: "single", // multi ou area
      maxTargets: 1,
    },
    projectile: {
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: "very low"
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: "high"
    },
    pierce: {
      enabled: false,
      count: 1,
      damageReduction: 10,
      info: "very high"
    },
    price: 20,
    sellPercentage: 0.7
  },

  earth_shock: {
    id: "earth_shock",
    type: "tower",
    name: "Eath Shock Tower",
    description: "Pulse une onde de choc autour de lui, infligeant des dégats à tous les ennemis.",
    size: 2,    
    stats: {
      damageMultiplier: 0.65,
      damageInfo: "low",
      attackSpeedMultiplier: 0.9,
      attackSpeedInfo: "medium",
      range: 80,
      rangeInfo: "low"
    },
    targeting: {
      mode: "circle", // line ou cone
      canTargetGround: true,
      canTargetAir: false,
      dual: false,
      angle: 360,
      direction: 0
    },
    attack: {
      mode: "area", // multi ou area
      maxTargets: 1,
    },
    projectile: {
      enabled: false,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: "very low"
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: "high"
    },
    pierce: {
      enabled: false,
      count: 1,
      damageReduction: 10,
      info: "very high"
    },
    price: 20,
    sellPercentage: 0.7
  },

  water_wave: {
    id: "water_wave",
    type: "tower",
    name: "Water Wave Tower",
    description: "Projette une vague en cône, infligeant des dégats à tous les ennemis.",
    size: 2,    
    stats: {
      damageMultiplier: 0.8,
      damageInfo: "medium",
      attackSpeedMultiplier: 1.2,
      attackSpeedInfo: "high",
      range: 100,
      rangeInfo: "medium"
    },
    targeting: {
      mode: "cone", // line ou cone
      canTargetGround: true,
      canTargetAir: true,
      dual: false,
      angle: 90,
      direction: 0
    },
    attack: {
      mode: "area", // multi ou area
      maxTargets: 1,
    },
    projectile: {
      enabled: false,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: "very low"
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: "high"
    },
    pierce: {
      enabled: false,
      count: 1,
      damageReduction: 10,
      info: "very high"
    },
    price: 20,
    sellPercentage: 0.7
  },

  fire_ball: {
    id: "fire_ball",
    type: "tower",
    name: "Fire Ball Tower",
    description: "Projette une boule de feu qui inflige des dégats aux ennemis dans une grande zone.",
    size: 2,    
    stats: {
      damageMultiplier: 0.8,
      damageInfo: "medium",
      attackSpeedMultiplier: 1,
      attackSpeedInfo: "medium",
      range: 150,
      rangeInfo: "high"
    },
    targeting: {
      mode: "circle", // circle, line ou cone
      canTargetGround: true,
      canTargetAir: true,
      dual: false,
      angle: 360,
      direction: 0
    },
    attack: {
      mode: "single", // single, multi ou area
      maxTargets: 1,
    },
    projectile: {
      enabled: true,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: true,
      radius: 50,
      info: "very high"
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: "high"
    },
    pierce: {
      enabled: false,
      count: 1,
      damageReduction: 10,
      info: "very high"
    },
    price: 20,
    sellPercentage: 0.7
  },

  ice_spike: {
    id: "ice_spike",
    type: "tower",
    name: "Ice Spike Tower",
    description: "Projette un pique de glace qui traverse tous les ennemis en ligne dans une direction.",
    size: 2,    
    stats: {
      damageMultiplier: 1.2,
      damageInfo: "high",
      attackSpeedMultiplier: 1,
      attackSpeedInfo: "medium",
      range: 200,
      rangeInfo: "very high"
    },
    targeting: {
      mode: "line", // circle, line ou cone
      canTargetGround: true,
      canTargetAir: true,
      dual: false,
      angle: 360,
      direction: 0
    },
    attack: {
      mode: "single", // single, multi ou area
      maxTargets: 1,
    },
    projectile: {
      enabled: true,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: "very high"
    },
    chain: {
      enabled: false,
      count: 1,
      range: 10,
      damageReduction: 10,
      info: "high"
    },
    pierce: {
      enabled: true,
      count: 10,
      damageReduction: 10,
      info: "very high"
    },
    price: 20,
    sellPercentage: 0.7
  },

  chain_lightning: {
    id: "chain_lightning",
    type: "tower",
    name: "Chain Lightning Tower",
    description: "Crée un arc électrique qui rebondit sur 5 ennemis aériens.",
    size: 2,    
    stats: {
      damageMultiplier: 1.6,
      damageInfo: "very high",
      attackSpeedMultiplier: 0.9,
      attackSpeedInfo: "medium",
      range: 200,
      rangeInfo: "very high"
    },
    targeting: {
      mode: "circle", // circle, line ou cone
      canTargetGround: false,
      canTargetAir: true,
      dual: false,
      angle: 360,
      direction: 0
    },
    attack: {
      mode: "single", // single, multi ou area
      maxTargets: 1,
    },
    projectile: {
      enabled: false,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: "very high"
    },
    chain: {
      enabled: true,
      count: 5,
      range: 10,
      damageReduction: 10,
      info: "high"
    },
    pierce: {
      enabled: false,
      count: 10,
      damageReduction: 10,
      info: "very high"
    },
    price: 20,
    sellPercentage: 0.7
  },

  multi_vine: {
    id: "multi_vine",
    type: "tower",
    name: "Multi Vine Tower",
    description: "Crée des lianes qui inflige des dégâts à 3 ennemis à portée.",
    size: 2,    
    stats: {
      damageMultiplier: 0.8,
      damageInfo: "low",
      attackSpeedMultiplier: 1.4,
      attackSpeedInfo: "very high",
      range: 120,
      rangeInfo: "medium"
    },
    targeting: {
      mode: "circle", // circle, line ou cone
      canTargetGround: true,
      canTargetAir: true,
      dual: false,
      angle: 360,
      direction: 0
    },
    attack: {
      mode: "multi", // single, multi ou area
      maxTargets: 3,
    },
    projectile: {
      enabled: false,
      type: "bullet",
      speed: 500
    },
    splash: {
      enabled: false,
      radius: 50,
      info: "very high"
    },
    chain: {
      enabled: false,
      count: 5,
      range: 10,
      damageReduction: 10,
      info: "high"
    },
    pierce: {
      enabled: false,
      count: 10,
      damageReduction: 10,
      info: "very high"
    },
    price: 20,
    sellPercentage: 0.7
  }
};
  