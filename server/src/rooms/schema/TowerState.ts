import { Schema, type } from "@colyseus/schema";

export class TowerState extends Schema {
  @type("string") id: string;
  @type("string") dataId: string;
  @type("number") gridX: number;
  @type("number") gridY: number;
  @type("boolean") placingPending: boolean;
  @type("boolean") sellingPending: boolean;

  @type("number") level: number;
  @type("number") damage: number;
  @type("number") attackSpeed: number;
  @type("number") range: number;

  @type("number") direction: number = 0;
  @type("number") totalDamage: number = 0;
  @type("number") totalKills: number = 0;
  @type("number") totalCost: number;
}