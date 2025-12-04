import { ArraySchema, Schema, type } from "@colyseus/schema";
import { RockState } from "./RockState";
import { AreaState } from "./AreaState";
import { CheckpointState } from "./CheckpointState";

export class GridState extends Schema {
  @type("string") seed: string;
  @type("number") col: number;
  @type("number") row: number;
  @type([RockState]) rocks = new ArraySchema<RockState>();
  @type([CheckpointState]) checkpoints = new ArraySchema<CheckpointState>();
  @type([AreaState]) areas = new ArraySchema<AreaState>();
}
