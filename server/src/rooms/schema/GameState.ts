import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";
import { CellState } from "./CellState";
import { RockState } from "./RockState";
import { AreaState } from "./AreaState";
import { CheckpointState } from "./CheckpointState";
import { WaveState } from "./WaveState";
import { GridState } from "./GridState";
import { PriceState } from "./PriceState";

export class GameState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type(GridState) grid = new GridState();
  @type(PriceState) price = new PriceState();

  // @type("string") seed: string;
  // @type("number") col: number;
  // @type("number") row: number;

  // @type({ map: CellState }) grid = new MapSchema<CellState>();
  // @type([RockState]) rocks = new ArraySchema<RockState>();
  // @type([AreaState]) areas = new ArraySchema<AreaState>();
  // @type([CheckpointState]) checkpoints = new ArraySchema<CheckpointState>();

  @type([WaveState]) waves = new ArraySchema<WaveState>();
  @type("number") currentWaveIndex: number = 1;
  @type("number") currentWaveCount: number = 1;
  @type("number") tick: number; // tick server
}