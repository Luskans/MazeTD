import { Schema, type } from "@colyseus/schema";
import { AreaModifierState } from "./AreaModifierState";
import { UpgradeModifierState } from "./UpgradeModifierState";

export class TowerState extends Schema {
  @type("string") id: string;
  @type("string") dataId: string;
  @type("number") gridX: number;
  @type("number") gridY: number;
  @type("boolean") placingPending: boolean;
  @type("boolean") sellingPending: boolean;

  @type("number") level: number = 1;
  @type("number") damage: number = 0;
  @type("number") attackSpeed: number = 0;
  @type("number") range: number = 0;

  @type("number") direction: number = 0;
  @type("number") totalDamage: number = 0;
  @type("number") totalKills: number = 0;
  @type("number") totalCost: number;

  @type(AreaModifierState) areaModifiers = new AreaModifierState();
  @type(UpgradeModifierState) upgradeModifiers = new UpgradeModifierState();
}