export const ENEMIES_DATA: Record<string, any> = {
  slime: {
    id: "slime",
    name: "Slime",
    type: "normal",
    description: "Une simple gelée, facile à tuer.",
    environment: "ground",
    count: 15,
    lives: 1,
    stats: {
      hp: 50,
      hpInfo: 1,
      speed: 15,
      speedInfo: 2,
      proximity: 20,
      proximityInfo: 4
    },
    tough: {
      enabled: false,
      name: 'tough',
      flat: 1,
      percentage: 10,
      info: 1
    },
    regenerative: {
      enabled: false,
      name: 'regenerative',
      regeneration: 10,
      info: 1
    },
    armored: {
      enabled: false,
      name: 'armored',
      armor: 10,
      info: 1
    },
    agile: {
      enabled: false,
      name: 'agile',
      percentage: 10,
      info: 1
    },
    saboteur: {
      enabled: false,
      name: 'saboteur',
      radius: 10,
      info: 1
    },
    invisible: {
      enabled: false,
      name: 'invisible',
      radius: 10,
      info: 1
    },
    thief: {
      enabled: true,
      name: 'thief'
    },
    duplicative: {
      enabled: false,
      name: 'duplicative',
      count: 1,
      info: 1
    }
  },
  orc: {
    id: "orc",
    name: "Orc",
    type: "elite",
    description: "Un orc en armure qui réduit les dégats subit de 20%.",
    environment: "ground",
    count: 8,
    lives: 2,
    stats: {
      hp: 200,
      hpInfo: 1,
      speed: 15,
      speedInfo: 2,
      proximity: 20,
      proximityInfo: 4
    },
    tough: {
      enabled: false,
      name: 'tough',
      flat: 1,
      percentage: 10,
      info: 1
    },
    regenerative: {
      enabled: false,
      name: 'regenerative',
      regeneration: 10,
      info: 1
    },
    armored: {
      enabled: true,
      name: 'armored',
      armor: 20,
      info: 3
    },
    agile: {
      enabled: false,
      name: 'agile',
      percentage: 10,
      info: 1
    },
    saboteur: {
      enabled: false,
      name: 'saboteur',
      radius: 10,
      info: 1
    },
    invisible: {
      enabled: false,
      name: 'invisible',
      radius: 10,
      info: 1
    },
    thief: {
      enabled: false,
      name: 'thief'
    },
    duplicative: {
      enabled: false,
      name: 'duplicative',
      count: 1,
      info: 1
    }
  },
  golem: {
    id: "golem",
    name: "Golem",
    type: "boss",
    description: "Un énorme golem très résistant. Il ignore 10 dégats brut.",
    environment: "ground",
    count: 2,
    lives: 5,
    stats: {
      hp: 200,
      hpInfo: 1,
      speed: 15,
      speedInfo: 2,
      proximity: 20,
      proximityInfo: 4
    },
    tough: {
      enabled: true,
      name: 'tough',
      flat: 10,
      info: 5
    },
    regenerative: {
      enabled: false,
      name: 'regenerative',
      regeneration: 10,
      info: 1
    },
    armored: {
      enabled: false,
      name: 'armored',
      armor: 10,
      info: 1
    },
    agile: {
      enabled: false,
      name: 'agile',
      percentage: 10,
      info: 1
    },
    saboteur: {
      enabled: false,
      name: 'saboteur',
      radius: 10,
      info: 1
    },
    invisible: {
      enabled: false,
      name: 'invisible',
      radius: 10,
      info: 1
    },
    thief: {
      enabled: false,
      name: 'thief'
    },
    duplicative: {
      enabled: false,
      name: 'duplicative',
      count: 1,
      info: 1
    }
  }
};