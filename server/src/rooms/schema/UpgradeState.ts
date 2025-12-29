import { Schema, type } from "@colyseus/schema";

export class UpgradeState extends Schema {
  @type("string") id: string;
  @type("string") dataId: string;
  @type("number") level: number;
  @type("number") currentCost: number;
  @type("number") currentValue: number;
  @type("number") nextCost: number;
  @type("number") nextValue: number;
}
