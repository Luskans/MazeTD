import { Schema, type } from "@colyseus/schema";

export class RockState extends Schema {
  @type("number") gridX: number;
  @type("number") gridY: number;
}