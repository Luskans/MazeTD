import { Schema, type } from "@colyseus/schema";

export class CellState extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") terrainType: number; // 0=normal, 1=blocked, 2=portal, ...
}
