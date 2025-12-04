import { Schema, MapSchema, type, ArraySchema } from "@colyseus/schema";
import { CustomerState } from "./CustomerState";

export class LobbyState extends Schema {
  @type({ map: CustomerState }) customers = new MapSchema<CustomerState>();
  @type("boolean") isPrivate: boolean = false;
  @type("string") hostId: string;
  @type({ map: "string" }) kicks = new MapSchema<string>();
  @type({ map: "boolean" }) bannedUids = new MapSchema<boolean>();
}