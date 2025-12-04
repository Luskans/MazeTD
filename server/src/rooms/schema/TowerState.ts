import { Schema, MapSchema, type } from "@colyseus/schema";

export class TowerState extends Schema {
  @type("string") id: string;
  @type("number") x: number;
  @type("number") y: number;

  @type("number") name: number;
  @type("number") level: number;

  @type("number") damage: number;
  @type("number") attackSpeed: number;
  @type("number") range: number;

  @type("number") cost: number;
  @type("number") upgradeCost: number;
  @type("number") totalCost: number;
}