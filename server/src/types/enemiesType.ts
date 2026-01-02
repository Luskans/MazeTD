export interface StatsType {
  hp: number,
  hpInfo: number,
  speed: number,      // cells per second
  speedInfo: number,
  proximity: number,      // interval in ms
  proximityInfo: number
}
export interface ToughType {
  enabled: boolean,
  flat: number,
  info: number
}
export interface RegenerativeType {
  enabled: boolean,
  flat: number,
  info: number
}
export interface ArmoredType {
  enabled: boolean,
  percentage: number,
  info: number
}
export interface AgileType {
  enabled: boolean,
  percentage: number,
  info: number
}
export interface SaboteurType {
  enabled: boolean,
  radius: number,
  info: number
}
export interface InvisibleType {
  enabled: boolean,
  radius: number,
  info: number
}
export interface ThiefType {
  enabled: boolean,
}
export interface DuplicativeType {
  enabled: boolean,
  count: number,
  info: number
}
export interface EnemyType {
  id: string;
  name: string;
  type: string;
  description: string;
  environment: string;
  count: number;
  lives: number;
  stats: StatsType;
  tough: ToughType;
  regenerative: RegenerativeType;
  armored: ArmoredType;
  agile: AgileType;
  saboteur: SaboteurType;
  invisible: InvisibleType;
  thief: ThiefType;
  duplicative: DuplicativeType;
}