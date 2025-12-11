import { Schema, type } from "@colyseus/schema";

export class EnemyState extends Schema {
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  // @type("number") checkpointIndex: number;
  @type("number") pathIndex: number;

  @type("string") name: string;
  @type("number") maxHp: number;
  @type("number") currentHp: number;
  @type("number") speed: number;
  @type("number") armor: number;

  @type("number") count: number;
}