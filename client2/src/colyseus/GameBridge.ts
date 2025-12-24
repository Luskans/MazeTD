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
import { screenStore } from "../stores/screenStore";

let cleanupFns: (() => void)[] = [];
const playersMap = new Map<string, any>();

/**
 * Connecte le game ui aux stores Svelte
 */
export function connectGame(room: Room<GameState>) {
  disconnectGame();

  gameRoom.set(room);

  const $ = getStateCallbacks(room);

  const updatePlayersPanel = (player: PlayerState) => {
    playersMap.set(player.sessionId, {
      sessionId: player.sessionId,
      username: player.username,
      elo: player.elo,
      isDisconnected: player.isDisconnected,
      isDefeated: player.isDefeated,
      life: player.life,
      kills: player.kills,
      damages: player.damages,
      mazeTime: player.mazeTime,
      incomeBonus: player.incomeBonus
    });

    playersPanel.set([...playersMap.values()]);
  };

  const updatePlayerHUD = (player: PlayerState) => {
    playerHUD.set({
      gold: player.gold,
      income: player.income,
      population: player.population,
      maxPopulation: player.maxPopulation
    });
  }

  // ──────────────────────────────
  // LISTENERS
  // ──────────────────────────────

  cleanupFns.push(
    $(room.state).listen("players", (players) => {

      $(players).onAdd((player: PlayerState, id: string) => {
        updatePlayersPanel(player);
        $(player).listen("gold", () => {updatePlayerHUD(player)});
        $(player).listen("income", () => {updatePlayerHUD(player)});
        $(player).listen("population", () => {updatePlayerHUD(player)});
        $(player).listen("maxPopulation", () => {updatePlayerHUD(player)});
        
        $(player).listen("isDisconnected", () => {updatePlayersPanel(player)});
        $(player).listen("isDefeated", () => {updatePlayersPanel(player)});
        $(player).listen("lives", () => {updatePlayersPanel(player)});
        $(player).listen("kills", () => {updatePlayersPanel(player)});
        $(player).listen("damage", () => {updatePlayersPanel(player)});
        $(player).listen("mazeTime", () => {updatePlayersPanel(player)});
        $(player).listen("incomeBonus", () => {updatePlayersPanel(player)});
      });
    })
  );
};

/**
 * Nettoyage complet
 */
export function disconnectGame() {
  cleanupFns.forEach(fn => fn());
  cleanupFns = [];

  gameRoom.set(null);
  playersPanel.set([]);
  playerHUD.set(null);
}

/**
 * Quitte proprement le lobby
 */
function leaveLobby() {
  network.leaveRoom();
  disconnectGame();
  screenStore.set("home");
}
