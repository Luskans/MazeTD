import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { TowerState } from "./TowerState";
import { WallState } from "./WallState";
import { EnemyState } from "./EnemyState";
import { RockState } from "./RockState";
import { CheckpointState } from "./CheckpointState";
import { AreaState } from "./AreaState";
import { UpgradeState } from "./UpgradeState";

export class PlayerState extends Schema {
  @type("string") sessionId!: string;
  @type("string") uid: string;
  @type("string") username: string;
  @type("number") elo: number = 1200;
  @type("boolean") hasLoaded: boolean = false;
  @type("boolean") isDefeated: boolean = false;
  @type("boolean") isDisconnected: boolean = false;

  @type("number") rank: number | null;
  @type('number') hp: number;
  @type('number') gold: number;
  @type('number') income: number;
  @type('number') population: number;

  // @type('number') incomeLevel: number = 1;
  // @type('number') destroyLevel: number = 1;
  // @type('number') populationLevel: number = 1;
  // @type({ map: "number" }) upgradesLevel = new MapSchema<number>();
  @type({ map: UpgradeState }) upgrades = new MapSchema<UpgradeState>();

  @type({ map: TowerState }) towers = new MapSchema<TowerState>();
  @type({ map: WallState }) walls = new MapSchema<WallState>();
  @type({ map: EnemyState }) enemies = new MapSchema<EnemyState>();

  // @type('number') cornerX: number; // position locale pour les calcules
  // @type('number') cornerY: number; // poisition globale côté client pour l'affichage
  @type([RockState]) rocks = new ArraySchema<RockState>();
  @type([CheckpointState]) checkpoints = new ArraySchema<CheckpointState>();
  @type([AreaState]) areas = new ArraySchema<AreaState>();
}
