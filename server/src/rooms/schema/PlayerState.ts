import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { TowerState } from "./TowerState";
import { WallState } from "./WallState";
import { EnemyState } from "./EnemyState";
import { RockState } from "./RockState";
import { CheckpointState } from "./CheckpointState";
import { AreaState } from "./AreaState";
import { UpgradeState } from "./UpgradeState";
import { PathNodeState } from "./PathNodeState";

export class PlayerState extends Schema {
  @type("string") sessionId!: string;
  @type("string") uid: string;
  @type("string") username: string;
  @type("number") elo: number = 1200;
  @type("boolean") hasLoaded: boolean = false;
  @type("boolean") isDefeated: boolean = false;
  @type("boolean") isDisconnected: boolean = false;
  @type("number") rank: number | null = null;

  @type("number") position: number | null = null;
  @type('number') hp: number;
  @type('number') gold: number;
  @type('number') income: number;
  @type('number') incomeBonus: number = 0;
  @type('number') population: number = 0;
  @type('number') maxPopulation: number;

  @type({ map: UpgradeState }) upgrades = new MapSchema<UpgradeState>();
  @type({ map: TowerState }) towers = new MapSchema<TowerState>();
  @type({ map: WallState }) walls = new MapSchema<WallState>();
  @type({ map: RockState }) rocks = new MapSchema<RockState>();
  @type({ map: CheckpointState }) checkpoints = new MapSchema<CheckpointState>();
  @type({ map: AreaState }) areas = new MapSchema<AreaState>();
  
  @type([PathNodeState]) currentPath = new ArraySchema<PathNodeState>();
  @type('number') pathVersion: number = 0; // Evite l'écoute sur chaque changements de currentPath
  @type({ map: EnemyState }) enemies = new MapSchema<EnemyState>();
}
