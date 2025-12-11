import { Schema, type } from "@colyseus/schema";

export class AreaState extends Schema {
  @type("string") id: string;
  @type('number') gridX: number;
  @type('number') gridY: number;
  @type('number') radius: number;
  
  @type('number') damageMultiplier: number = 1.0;
  @type('number') attackSpeedMultiplier: number = 1.0;
  @type('number') rangeMultiplier: number = 1.0;
  @type('number') speedMultiplier: number = 1.0;
}