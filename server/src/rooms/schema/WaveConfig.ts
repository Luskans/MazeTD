import { Schema, MapSchema, type } from "@colyseus/schema";
import { EnemyState } from "./EnemyState";

export class WaveConfig extends Schema {
  @type("number") index: number; // ordre dans la boucle
  // @type(EnemyState) enemy = new EnemyState();
  @type("string") enemyId: string; // Ex: "goblin"
}