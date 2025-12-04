import { Schema, type } from "@colyseus/schema";
import { TowerState } from "./TowerState";

export class PlayerState extends Schema {
  @type("string") sessionId!: string;
  @type("string") uid: string;
  @type("string") username: string;
  @type("number") elo: number = 1200;
  @type("boolean") hasLoaded: boolean = false;
  @type("boolean") isDefeated: boolean = false;
  @type("boolean") isDisconnected: boolean = false;
  @type(TowerState) tower = new TowerState();
}