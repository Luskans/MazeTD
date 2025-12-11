import { Schema, type } from "@colyseus/schema";

export class PathNodeState extends Schema {
  @type("number") gridX: number;
  @type("number") gridY: number;
}