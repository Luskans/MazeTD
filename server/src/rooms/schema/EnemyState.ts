import { Schema, type } from "@colyseus/schema";

export class EnemyState extends Schema {
  @type("string") id: string;
  @type("string") dataId: string;
  @type("number") gridX: number;
  @type("number") gridY: number;
  // @type("number") checkpointIndex: number;
  @type("number") pathIndex: number;
  @type("number") progress: number = 0; // 0 → 1 vers la prochaine case
  @type("boolean") reachedEnd: boolean = false;
  // @type("number") count: number;

  // @type("string") name: string;
  @type("number") hp: number;
  @type("number") maxHp: number;
  @type("number") speed: number;
  @type("number") proximity: number;
}