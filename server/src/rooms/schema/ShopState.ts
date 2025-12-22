import { MapSchema, Schema, type } from "@colyseus/schema";
import { TowerConfig } from "./TowerConfig";
import { UpgradeConfig } from "./UpgradeConfig";
import { WallConfig } from "./WallConfig";

export class ShopState extends Schema {
  // @type({ map: TowerState }) towers = new MapSchema<TowerState>();
  // @type({ map: WallState }) walls = new MapSchema<WallState>();
  // @type({ map: UpgradeState }) upgrades = new MapSchema<UpgradeState>();

  // Clé: ID du type de tour (ex: "basic_tower", "laser_turret")
  // Valeur: La configuration actuelle avec le prix aléatoire
  @type({ map: TowerConfig }) towersConfig = new MapSchema<TowerConfig>();
  @type({ map: UpgradeConfig }) upgradesConfig = new MapSchema<UpgradeConfig>();
  @type({ map: WallConfig }) wallsConfig = new MapSchema<WallConfig>();
}