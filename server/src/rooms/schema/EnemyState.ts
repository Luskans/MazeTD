import { Schema, type } from "@colyseus/schema";

export class EnemyState extends Schema {
  @type("number") hp: number = 35;
  @type("number") speed: number = 38;
  @type("number") dmg: number = 5;
  @type("number") atkSpeed: number = 1.5;
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}