import { derived, writable } from "svelte/store";
import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";

export type PlayerHUD = {
  lives: number;
  gold: number;
  income: number;
  population: number;
  maxPopulation: number;
};
export type PlayersPanel = {
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
};

export const gameRoom = writable<Room<GameState> | null>(null);
export const playerHUD = writable<PlayerHUD>({
  gold: 0,
  lives: 0,
  income: 0,
  population: 0,
  maxPopulation: 0
});
export const playersPanel = writable<PlayersPanel>({
  sessionId: '',
  username: '',
  elo: 0,
  isDisconnected: false,
  isDefeated: false,
  lives: 0,
  kills: 0,
  damage: 0,
  mazeTime: 0,
  incomeBonus: 0
});


// export const gameRoom = writable<Room<GameState> | null>(null);
// export const playersPanel = writable<PlayersPanel[]>([]);
// export const playerHUD = writable<PlayerHUD | null>(null);
// export const playerHUD = derived(
//   [gameRoom],
//   ([$room, $customers]) =>
//     $customers.find(c => c.sessionId === $room?.sessionId) ?? null
// );


// export const gameRoom = writable<Room<GameState> | null>(null);
// export const gamePlayers = writable<PlayerState[]>([]); // On stocke la Map entière
// export const myGamePlayer = writable<PlayerHUD | null>(null);

// export const myGamePlayer = derived(
//     [gameRoom, gamePlayers],
//     ([$room, $players]) => 
//       $players.find(c => c.sessionId === $room?.sessionId) ?? null
// );













// export type CustomerStore = {
//   sessionId: string,
//   uid: string,
//   username: string,
//   elo: number,
//   isReady: boolean
// }

// export const customerStore = $state({
//   sessionId: '',
//   uid: '',
//   username: '',
//   elo: 0,
//   isReady: false
// });