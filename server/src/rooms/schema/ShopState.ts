import { MapSchema, Schema, type } from "@colyseus/schema";
import { TowerState } from "./TowerState";
import { WallState } from "./WallState";
import { UpgradeState } from "./UpgradeState";

export class ShopState extends Schema {
  @type({ map: TowerState }) towers = new MapSchema<TowerState>();
  @type({ map: WallState }) walls = new MapSchema<WallState>();
  @type({ map: UpgradeState }) upgrades = new MapSchema<UpgradeState>();
}