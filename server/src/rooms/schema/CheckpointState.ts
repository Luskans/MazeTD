import { Schema, type } from "@colyseus/schema";

export class CheckpointState extends Schema {
  @type('number') x: number;
  @type('number') y: number;
  @type("number") order: number;
}