import { Schema, MapSchema, type } from "@colyseus/schema";

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

  @type("number") direction: number;
  @type("number") totalCost: number;
}