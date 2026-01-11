import { Schema, type } from "@colyseus/schema";

export class AreaModifierState extends Schema {
  @type('number') damageMultiplier: number = 0;
  @type('number') attackSpeedMultiplier: number = 0;
  @type('number') rangeMultiplier: number = 0;
  
  @type('number') targetBonus: number = 0;
  @type('number') angleBonus: number = 0;
  @type('number') splashRadiusBonus: number = 0;
  @type('number') chainBonus: number = 0;
  @type('number') chainReductionBonus: number = 0;
  @type('number') pierceBonus: number = 0;
  @type('number') pierceReductionBonus: number = 0;
  
  @type('number') speedMultiplier: number = 0;
  @type('number') armorMultiplier: number = 0;
}