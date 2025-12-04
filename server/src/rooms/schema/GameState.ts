import { Schema, MapSchema, type } from "@colyseus/schema";
import { PlayerState } from "./PlayerState";
import { MapConfigState } from "./MapConfig";

export class GameState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type(MapConfigState) mapConfig = new MapConfigState();
  @type('number') currentWave = 1;
}