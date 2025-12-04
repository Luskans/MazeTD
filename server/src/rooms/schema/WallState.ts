import { Schema, type } from "@colyseus/schema";

export class WallState extends Schema {
  @type("string") id: string;
  @type("number") x: number;
  @type("number") y: number;
  @type("number") size: number; // 1=32x32, 2=64x64
  @type("number") cost: number;
}