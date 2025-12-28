export const UPGRADES_DATA: Record<string, any> = {
  population: {
    id: "population",
    type: "upgrade",
    name: "Increase population",
    description: "Augmente le nombre maximum de bâtiments que vous pouvez construire.",
    price: 20,
    value: 5
  },
  income: {
    id: "income",
    type: "upgrade",
    name: "Increase income",
    description: "Augmente les gold reçus à la fin d'une vague.",
    price: 40,
    value: 5
  },
  destroy: {
    id: "destroy",
    type: "upgrade",
    name: "Destroy Rock",
    description: "Permet de détruire un rocher ciblé.",
    price: 40,
    value: null
  }
};