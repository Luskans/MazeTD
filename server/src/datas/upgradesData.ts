export const UPGRADES_DATA: Record<string, any> = {
  population: {
    id: "population",
    type: "upgrade",
    name: "Increase population",
    description: "Augmente le nombre maximum de bâtiments qui peuvent être construits de 5.",
    price: 20,
    baseValue: 0,
    upgradeValue: 5
  },
  income: {
    id: "income",
    type: "upgrade",
    name: "Increase income",
    description: "Augmente l'or reçu en fin de vague de 5%.",
    description2: "( 10 + wave level + bonus )",
    price: 40,
    baseValue: 0,
    upgradeValue: 5
  },
  destroy: {
    id: "destroy",
    type: "upgrade",
    name: "Destroy Rock",
    description: "Permet de détruire un rocher ciblé, le prix augmente à chaque utilisation.",
    price: 40,
    baseValue: null,
    upgradeValue: null
  }
};