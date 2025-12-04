import { Schema, MapSchema, type } from "@colyseus/schema";

// export class TowerState extends Schema {
//   @type("number") hp: number = 100;
//   @type("number") force: number = 10;
//   @type("number") dex: number = 10;
//   @type("number") int: number = 10;
//   @type("number") agi: number = 10;
//   @type("number") luck: number = 10;

//   // attaques
//   @type("number") dmg: number = 5;
//   @type("number") range: number = 90;
//   @type("number") attackSpeed: number = 1.2;
// }

export class Vector2 extends Schema {
  @type("number") x: number;
  @type("number") y: number;
}

export class TowerState extends Schema {
  @type(Vector2) position = new Vector2();
}