import { MapSchema, Schema, type } from "@colyseus/schema";
import { TowerState } from "./TowerState";
import { WallState } from "./WallState";
import { EnemyState } from "./EnemyState";

export class PlayerState extends Schema {
  @type("string") sessionId!: string;
  @type("string") uid: string;
  @type("string") username: string;
  @type("number") elo: number = 1200;
  @type("boolean") hasLoaded: boolean = false;
  @type("boolean") isDefeated: boolean = false;
  @type("boolean") isDisconnected: boolean = false;
  @type("number") rank: number;

  @type('number') hp: number = 100;
  @type('number') gold: number = 200;
  @type('number') income: number = 10;
  @type('number') population: number = 20;

  @type('number') incomeLevel: number = 1;
  @type('number') destroyLevel: number = 1;
  @type('number') populationLevel: number = 1;

  @type({ map: TowerState }) towers = new MapSchema<TowerState>();
  @type({ map: WallState }) walls = new MapSchema<WallState>();
  @type({ map: EnemyState }) enemiess = new MapSchema<EnemyState>();
}
