// import { getStateCallbacks, type Room } from "colyseus.js";
// import type { GameState } from "../../../server/src/rooms/schema/GameState";
// import { playersPanelStore } from "../stores/playersPanelStore";
// import { playerHUDStore } from "../stores/playerHUDStore";
// import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
// import { gameRoom, playerHUD, playersPanel } from "../stores/gameStore";
// import { network } from "./Network";
// import { screenStore } from "../stores/screenStore";

// let unbind: (() => void) | null = null;

// export function bindGameRoom(room: Room<GameState>) {
//   unbind?.();

//   const playersMap = new Map<string, any>();

//   const updatePlayerHUD = (player: PlayerState, id: string) => {
//     playersMap.set(id, {
//       sessionId: id,
//       username: player.username,
//       elo: player.elo,
//       isDisconnected: player.isDisconnected,
//       isDefeated: player.isDefeated,
//       life: player.life,
//       kills: player.kills,
//       damages: player.damages,
//       mazeTime: player.mazeTime,
//       incomeBonus: player.incomeBonus
//     });

//     playersPanelStore.set([...playersMap.values()]);
//   };

//   room.state.players.onAdd = updatePlayerHUD;
//   room.state.players.onChange = updatePlayerHUD;
//   room.state.players.onRemove = (_: any, id: string) => {
//     playersMap.delete(id);
//     playersPanelStore.set([...playersMap.values()]);
//   };

//   room.state.players.onChange = (player: PlayerState, id: string) => {
//     if (id !== room.sessionId) return;

//     playerHUDStore.set({
//       gold: player.gold,
//       income: player.income,
//       population: player.population,
//       maxPopulation: player.maxPopulation
//     });
//   };

//   unbind = () => {
//     room.state.players.onAdd = undefined;
//     room.state.players.onChange = undefined;
//     room.state.players.onRemove = undefined;
//   };
// }

// export function unbindGameRoom() {
//   unbind?.();
//   unbind = null;
//   playersPanelStore.set([]);
//   playerHUDStore.set(null);
// }




import { getStateCallbacks, type Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import { gameRoom, playerHUD, playersPanel } from "../stores/gameStore";
import { network } from "./Network";
import { screenStore } from "../stores/screenStore.svelte";
import { syncPlayerSnapshot } from "./syncPlayerSnapshot";

let cleanupFns: (() => void)[] = [];
const playersMap = new Map<string, any>();

/**
 * Connecte le game ui aux stores Svelte
 */
export function connectGame(room: Room<GameState>) {
  disconnectGame();

  gameRoom.set(room);

  const $ = getStateCallbacks(room);

  // const updatePlayersPanel = (player: PlayerState) => {
  //   playersMap.set(player.sessionId, {
  //     sessionId: player.sessionId,
  //     username: player.username,
  //     elo: player.elo,
  //     isDisconnected: player.isDisconnected,
  //     isDefeated: player.isDefeated,
  //     lives: player.lives,
  //     kills: player.kills,
  //     damage: player.damage,
  //     mazeTime: player.mazeTime,
  //     incomeBonus: player.incomeBonus
  //   });

  //   playersPanel.set([...playersMap.values()]);
  // };
  const updatePlayersPanel = (raw: {
    sessionId: string;
    username: string;
    elo: number;
    isDisconnected: boolean;
    isDefeated: boolean;
    lives: number;
    kills: number;
    damage: number;
    mazeTime: number;
    incomeBonus: number;
  }) => {
    playersPanel.set({
      sessionId: String(raw.sessionId),
      username: String(raw.username),
      elo: Number(raw.elo),
      isDisconnected: Boolean(raw.isDisconnected),
      isDefeated: Boolean(raw.isDefeated),
      lives: Number(raw.lives),
      kills: Number(raw.kills),
      damage: Number(raw.damage),
      mazeTime: Number(raw.mazeTime),
      incomeBonus: Number(raw.incomeBonus)
    });
  };

  // const updatePlayerHUD = (player: PlayerState) => {
  //   playerHUD.set({
  //     lives: player.lives,
  //     gold: player.gold,
  //     income: player.income,
  //     population: player.population,
  //     maxPopulation: player.maxPopulation
  //   });
  // }
  const updatePlayerHUD = (raw: {
    gold: number;
    lives: number;
    income: number;
    population: number;
    maxPopulation: number;
  }) => {
    playerHUD.set({
      gold: Number(raw.gold),
      lives: Number(raw.lives),
      income: Number(raw.income),
      population: Number(raw.population),
      maxPopulation: Number(raw.maxPopulation)
    });
  };

  // const tg = () => {
  //   gamePlayers.set(
  //     Array.from(room.state.players.values())
  //   )
  // };
  // const tg = () => {
  //   gamePlayers.set(
  //     Array.from(room.state.players.values()).map(p => ({
  //       ...p
  //     }))
  //   );
  // };
  // $(room.state).listen("players", (customers) => {
  //   $(customers).onAdd((customer: PlayerState, id: string) => {
  //     tg();
  //     $(customer).listen("gold", tg);
  //   });
  //   tg();
  // })
  // $(room.state).listen("players", (players) => {
  //   $(players).onAdd((player: PlayerState, id: string) => {
  //     if (id === room.sessionId) {
  //       myGamePlayer.set({ ...player });

  //       $(player).onChange(() => {
  //         myGamePlayer.set({ ...player });
  //       });
  //     }
  //   });
  // });
  // $(room.state).listen("players", (players: any) => {

  //   // 1️⃣ joueurs déjà présents
  //   players.forEach((player: PlayerState, id: string) => {
  //     attachPlayer(player, id);
  //   });

  //   // 2️⃣ joueurs ajoutés plus tard
  //   $(players).onAdd((player: PlayerState, id: string) => {
  //     attachPlayer(player, id);
  //   });
  // });

  // function attachPlayer(player: PlayerState, id: string) {
  //   // updatePlayersPanel(player);

  //   if (id === room.sessionId) {
  //     // initial
  //     // myGamePlayer.set({ ...player });
  //     myGamePlayer.set({
  //       gold: player.gold,
  //       lives: player.lives,
  //       income: player.income,
  //       population: player.population,
  //       maxPopulation: player.maxPopulation,
  //     });

  //     // toutes les mutations futures
  //     $(player).onChange(() => {
  //       console.log("PLAYER CHANGE", player.gold);
  //       // myGamePlayer.set({ ...player });
  //       myGamePlayer.set({
  //         gold: player.gold,
  //         lives: player.lives,
  //         income: player.income,
  //         population: player.population,
  //         maxPopulation: player.maxPopulation,
  //       });
  //     });
  //   }

  //   // stats panel
  //   $(player).onChange(() => {
  //     updatePlayersPanel(player);
  //   });
  // }

  // let playersBound = false;

  // $(room.state).listen("players", (players) => {
  //   if (playersBound) return;
  //   playersBound = true;

  //   bindPlayers(players);
  // });
  // function bindPlayers(players: any) {
  //   // joueurs déjà là
  //   players.forEach((player, id) => attachPlayer(player, id));

  //   // joueurs futurs
  //   $(players).onAdd((player, id) => attachPlayer(player, id));
  // }
  $(room.state).listen("players", (players: any) => {

    // joueurs déjà présents
    players.forEach((player: PlayerState, id: string) => {
      if (id === room.sessionId) {
        bindLocalPlayer(player);
      }
    });
    const localPlayer = room.state.players.get(room.sessionId);

    $(localPlayer).listen("gold", () => {
        updatePlayerHUD(localPlayer);
    });

    // joueurs ajoutés plus tard
    $(players).onAdd((player, id) => {
      if (id === room.sessionId) {
        bindLocalPlayer(player);
      }
    });
  });

  let bound = false;
  function bindLocalPlayer(player: PlayerState) {
    if (bound) return;
    bound = true;

    console.log("LOCAL PLAYER BOUND");
    updatePlayerHUD(player);

    // $(player).onChange(() => {
    //   console.log("SERVER SNAPSHOT", player.gold);
    //   updatePlayerHUD(player);
    // });
    ["gold","lives","income","population","maxPopulation"].forEach(field => {
        $(player).listen(field, () => {
            console.log("SERVER CHANGE", field, player[field]);
            syncPlayerSnapshot(player);
        });
    });
  }

  // ──────────────────────────────
  // LISTENERS
  // ──────────────────────────────

  cleanupFns.push(
    // $(room.state).listen("players", (players) => {
    //   $(players).onAdd((player: PlayerState, id: string) => {
    //     updatePlayersPanel(player);
    //     console.log("les player stats se mettent à jour on add avec le player : ", player)
    //     $(player).listen("lives", () => {updatePlayerHUD(player)});
    //     $(player).listen("gold", () => {updatePlayerHUD(player), console.log("maj avec les gold", )});
    //     $(player).listen("income", () => {updatePlayerHUD(player)});
    //     $(player).listen("population", () => {updatePlayerHUD(player)});
    //     $(player).listen("maxPopulation", () => {updatePlayerHUD(player)});
        
    //     $(player).listen("isDisconnected", () => {updatePlayersPanel(player)});
    //     $(player).listen("isDefeated", () => {updatePlayersPanel(player)});
    //     $(player).listen("lives", () => {updatePlayersPanel(player)});
    //     $(player).listen("kills", () => {updatePlayersPanel(player)});
    //     $(player).listen("damage", () => {updatePlayersPanel(player)});
    //     $(player).listen("mazeTime", () => {updatePlayersPanel(player)});
    //     $(player).listen("incomeBonus", () => {updatePlayersPanel(player)});
    //   });
    // })
    // $(room.state).players.onAdd((player: PlayerState, id: string) => {
    //   updatePlayersPanel(player);

    //   if (id === room.sessionId) {
    //   //   console.log("Monitoring local player stats for:", player.username);
    //   //   updatePlayerHUD(player);

    //   //   $(player).listen("lives", () => {updatePlayerHUD(player)});
    //   //   $(player).listen("gold", () => {updatePlayerHUD(player); console.log("maj avec les gold", )});
    //   //   $(player).listen("income", () => {updatePlayerHUD(player)});
    //   //   $(player).listen("population", () => {updatePlayerHUD(player)});
    //   //   $(player).listen("maxPopulation", () => {updatePlayerHUD(player)});
        
    //   //   $(player).listen("isDisconnected", () => {updatePlayersPanel(player)});
    //   //   $(player).listen("isDefeated", () => {updatePlayersPanel(player)});
    //   //   $(player).listen("lives", () => {updatePlayersPanel(player)});
    //   //   $(player).listen("kills", () => {updatePlayersPanel(player)});
    //   //   $(player).listen("damage", () => {updatePlayersPanel(player)});
    //   //   $(player).listen("mazeTime", () => {updatePlayersPanel(player)});
    //   //   $(player).listen("incomeBonus", () => {updatePlayersPanel(player)});
    //     $(player).onChange(() => {
    //       console.log("Stats primitives modifiées (gold, income, etc.)");
    //       updatePlayerHUD(player);
    //     });
    //   }
    // })
    // $(room.state).players.onChange((player, sessionId) => {
    //   // Si c'est mon sessionId
    //   if (sessionId === room.sessionId) {
    //     console.log("CHANGEMENT DÉTECTÉ POUR MOI - OR:", player.gold);
    //     updatePlayerHUD(player);
    //   }
    // }),
    // room.state.players.onChange((player, sessionId) => {
    //   // Si c'est mon sessionId
    //   if (sessionId === room.sessionId) {
    //     console.log("CHANGEMENT DÉTECTÉ POUR MOI - OR:", player.gold);
    //     updatePlayerHUD(player);
    //   }
    // })
  //   $(room.state).listen("players", (players) => {
  //     $(players).onAdd((player: PlayerState, id: string) => {
  //       updatePlayersPanel(player);
  //       console.log("les player stats se mettent à jour on add avec le player : ", player)
  //       $(player).listen("lives", () => {updatePlayerHUD(player)});
  //       $(player).listen("gold", () => {updatePlayerHUD(player), console.log("maj avec les gold", )});
  //       $(player).listen("income", () => {updatePlayerHUD(player)});
  //       $(player).listen("population", () => {updatePlayerHUD(player)});
  //       $(player).listen("maxPopulation", () => {updatePlayerHUD(player)});
        
  //       $(player).listen("isDisconnected", () => {updatePlayersPanel(player)});
  //       $(player).listen("isDefeated", () => {updatePlayersPanel(player)});
  //       $(player).listen("lives", () => {updatePlayersPanel(player)});
  //       $(player).listen("kills", () => {updatePlayersPanel(player)});
  //       $(player).listen("damage", () => {updatePlayersPanel(player)});
  //       $(player).listen("mazeTime", () => {updatePlayersPanel(player)});
  //       $(player).listen("incomeBonus", () => {updatePlayersPanel(player)});
  //     });
  //   })
  );
};

/**
 * Nettoyage complet
 */
export function disconnectGame() {
  cleanupFns.forEach(fn => fn());
  cleanupFns = [];

  gameRoom.set(null);
  // playersPanel.set([]);
  // playerHUD.set(null);
}

/**
 * Quitte proprement le lobby
 */
function leaveLobby() {
  network.leaveRoom();
  disconnectGame();
  screenStore.set("home");
}
