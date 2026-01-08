import { Schema, type } from "@colyseus/schema";

export class RockState extends Schema {
  @type("string") id: string;
  @type("number") gridX: number;
  @type("number") gridY: number;
  @type("boolean") destroyPending: boolean = false;
}