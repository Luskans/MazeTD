import { Schema, type } from "@colyseus/schema";

export class CustomerState extends Schema {
  @type("string") sessionId!: string;
  @type("string") uid: string;
  @type("string") username: string;
  @type("number") elo: number = 1200;
  @type("boolean") isReady: boolean = false;
}