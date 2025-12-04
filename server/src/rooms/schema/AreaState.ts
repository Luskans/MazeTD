import { Schema, type } from "@colyseus/schema";

export class AreaState extends Schema {
  @type('number') x: number;
  @type('number') y: number;
  @type('number') radius: number;
  
  @type('number') damageMultiplier: number = 1.0;
  @type('number') attackSpeedMultiplier: number = 1.0;
  @type('number') rangeMultiplier: number = 1.0;
  @type('number') speedMultiplier: number = 1.0;
}