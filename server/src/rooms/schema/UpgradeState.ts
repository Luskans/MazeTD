import { Schema, type } from "@colyseus/schema";

export class UpgradeState extends Schema {
  @type("string") id: string;
  @type("string") dataId: string;

  // @type("number") name: number;
  @type("number") level: number;
  
  @type("number") cost: number;
  @type("number") value: number;
  @type("number") nextCost: number;
  @type("number") nextValue: number;

  // @type("number") upgradeCost: number;
}
