// export type ProjectileType = 'bullet' | 'arrow' | 'beam' | 'fire' | 'lightning' | 'ice' | 'missile';
// export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'poison' | 'magic';
// export type TargetingMode = 'first' | 'last' | 'closest' | 'strongest' | 'weakest' | 'random';
// export type EnemyType = 'ground' | 'air';

// export interface TargetingConfig {
//   mode: TargetingMode;
//   canTargetGround: boolean;
//   canTargetAir: boolean;
//   priorityType?: EnemyType;  // Priorise un type si les deux sont possibles
// }

// export interface ConeConfig {
//   enabled: boolean;
//   angle: number;          // Angle du cone en degrés (ex: 90 pour un quart de cercle)
//   direction: number;      // Direction du cone en degrés (0 = droite, 90 = haut, etc.)
//   rotatable: boolean;     // La tour peut-elle pivoter ?
//   rotationSpeed?: number; // Vitesse de rotation (degrés/seconde) si rotatable
// }

// export interface ProjectileConfig {
//   type: ProjectileType;
//   count: number;        // Nombre de projectiles par tir
//   speed: number;        // Vitesse du projectile
//   spreadAngle?: number; // Angle de dispersion si multiple projectiles (en degrés)
// }

// export interface SplashConfig {
//   enabled: boolean;
//   radius: number;       // Rayon du splash
//   damagePercent: number; // % de dégâts pour le splash (100 = full damage)
// }

// export interface BounceConfig {
//   enabled: boolean;
//   count: number;        // Nombre de rebonds max
//   range: number;        // Distance max pour trouver la prochaine cible
//   damageReduction: number; // Réduction des dégâts par rebond (en %)
// }

// export interface PierceConfig {
//   enabled: boolean;
//   count: number;        // Nombre d'ennemis traversés
//   damageReduction: number; // Réduction des dégâts par ennemi traversé (en %)
// }

// export interface ChainConfig {
//   enabled: boolean;
//   count: number;        // Nombre de chaînes max
//   range: number;        // Distance max pour la chaîne
//   damageReduction: number; // Réduction par chaîne (en %)
// }

// export interface AreaConfig {
//   enabled: boolean;
//   radius: number;       // Rayon de la zone d'effet
//   tickRate: number;     // Fréquence des dégâts (ms)
// }

// export interface EffectConfig {
//   type: 'slow' | 'stun' | 'burn' | 'freeze' | 'poison';
//   duration: number;     // Durée de l'effet (ms)
//   value: number;        // Valeur (% slow, dégâts par tick, etc.)
//   stackable: boolean;   // L'effet peut-il stack ?
//   maxStacks?: number;   // Nombre max de stacks
// }

// export interface TowerStats {
//   damage: number;
//   attackSpeed: number;  // Attaques par seconde
//   range: number;        // Rayon de portée
//   critChance?: number;  // Chance de critique (%)
//   critMultiplier?: number; // Multiplicateur de critique
// }

// export interface TowerConfig {
//   // Identité
//   id: string;
//   type: 'tower';
//   name: string;
//   description: string;
//   rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  
//   // Visuel
//   size: number;         // Taille en grid cells
//   sprite: string;       // Chemin vers le sprite
//   icon?: string;        // Icône pour l'UI
  
//   // Stats de base
//   stats: TowerStats;
//   damageType: DamageType;
//   targeting: TargetingConfig;
  
//   // Mécaniques spéciales
//   cone?: ConeConfig;
//   projectile?: ProjectileConfig;
//   splash?: SplashConfig;
//   bounce?: BounceConfig;
//   pierce?: PierceConfig;
//   chain?: ChainConfig;
//   area?: AreaConfig;
//   effects?: EffectConfig[];
  
//   // Upgrades
//   upgradable: boolean;
//   maxLevel?: number;
  
//   // Économie
//   price: number;
//   sellValue?: number;   // Valeur de revente (% du prix total)
  
//   // Meta
//   unlockRequirement?: string; // Condition pour débloquer
//   tags?: string[];      // Pour filtrage/recherche
// }





export interface StatsType {
  damageMultiplier: number;
  damageInfo: number;       // 1, 2, 3, 4, 5 (very low to very high)
  attackSpeedMultiplier: number;  // Attaques par seconde
  attackSpeedInfo: number;
  range: number;        // Rayon de portée
  rangeInfo: number;
}
export interface TargetingType {
  mode: 'single' | 'multi' | 'area';
  maxTargets: number;
  canTargetGround: boolean;
  canTargetAir: boolean;
}
export interface AttackType {
  mode: 'circle' | 'line' | 'cone'; 
  dual: boolean;
  angle: number;
  direction: number;
}
export interface ProjectileType {
  mode: 'bullet' | 'arrow' | 'beam' | 'fire' | 'lightning' | 'ice' | 'missile';
  speed: number;
}
export interface SplashType {
  enabled: boolean;
  radius: number;
  info: number;
}
export interface ChainType {
  enabled: boolean;
  count: number;
  range: number;
  damageReduction: number;
  info: number;
}
export interface PierceType {
  enabled: boolean;
  count: number;
  range: number;
  damageReduction: number;
  info: number;
}
export interface TowerType {
  id: string;
  type: string;
  name: string;
  description: string;
  size: number;
  price: number;
  sellPercentage: number;
  stats: StatsType;
  targeting: TargetingType;
  attack: AttackType;
  projectile: ProjectileType;
  splash: SplashType;
  chain: ChainType;
  pierce: PierceType
}