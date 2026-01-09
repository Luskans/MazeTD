import { Schema, type } from "@colyseus/schema";

export class UpgradeModifierState extends Schema {
  @type('number') damageMultiplier: number = 100;
  @type('number') attackSpeedMultiplier: number = 100;
  @type('number') rangeMultiplier: number = 100;

  @type('number') targetBonus: number = 0;
  @type('number') angleBonus: number = 0;
  @type('number') splashRadiusBonus: number = 0;
  @type('number') chainBonus: number = 0;
  @type('number') chainReductionBonus: number = 0;
  @type('number') pierceBonus: number = 0;
  @type('number') pierceReductionBonus: number = 0;

  @type('number') speedMultiplier: number = 100;
  @type('number') armorMultiplier: number = 100;
}