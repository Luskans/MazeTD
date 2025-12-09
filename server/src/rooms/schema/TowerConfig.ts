import { MapSchema, Schema, type } from "@colyseus/schema";

export class TowerConfig extends Schema {
  @type("string") id: string; // Ex: "basic_tower"

  // Le prix de base (aléatoire) pour le niveau 1
  @type("number") price: number; 
}