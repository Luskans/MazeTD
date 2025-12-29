import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";
import { CellState } from "./CellState";
import { RockState } from "./RockState";
import { AreaState } from "./AreaState";
import { CheckpointState } from "./CheckpointState";
import { WaveConfig } from "./WaveConfig";
import { GridState } from "./GridState";
import { ShopState } from "./ShopState";

export class GameState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type(GridState) grid = new GridState();
  @type(ShopState) shop = new ShopState();
  @type([WaveConfig]) waves = new ArraySchema<WaveConfig>();
  @type("number") currentWaveIndex: number = 1;
  @type("number") waveCount: number = 1;
}