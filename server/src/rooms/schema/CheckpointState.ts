import { Schema, type } from "@colyseus/schema";

export class CheckpointState extends Schema {
  @type('number') gridX: number;
  @type('number') gridY: number;
  @type("number") order: number;
}