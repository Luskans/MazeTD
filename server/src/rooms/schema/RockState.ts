import { Schema, type } from "@colyseus/schema";

export class RockState extends Schema {
  @type("number") x: number;
  @type("number") y: number;
}