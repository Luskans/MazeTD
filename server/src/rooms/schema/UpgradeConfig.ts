import { MapSchema, Schema, type } from "@colyseus/schema";

export class UpgradeConfig extends Schema {
  @type("string") id: string; // Ex: "upgrade_income"

  // Le prix de base (aléatoire) pour le niveau 1
  @type("number") price: number;
  // Le multiplicateur de base (aléatoire) pour calculer le prix des upgrades
  @type("number") upgradeMultiplier: number; 

  // Les prix pour les niveaux d'amélioration de CE type de tour
  // Clé: Le niveau que vous achetez (ex: 2, 3, 4)
  // Valeur: Le prix d'achat
  // @type({ map: "number" }) upgradePrices = new MapSchema<number>(); 
}