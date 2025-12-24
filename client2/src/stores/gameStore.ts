import { writable } from "svelte/store";
import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";

export type PlayerHUD = {
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
export const playersPanel = writable<PlayersPanel[]>([]);
export const playerHUD = writable<PlayerHUD | null>(null);
