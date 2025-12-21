import type { Room } from 'colyseus.js';
import { writable } from 'svelte/store';
import type { LobbyState } from '../../../server/src/rooms/schema/LobbyState';

export const screen = writable<'home'|'lobby'|'game'>('home');
// export const currentRoom = writable<Room<LobbyState> | null>(null);
export const currentRoom = writable<any>(null);
export const playerData = writable<{roomId: string, uid: string, username: string, elo: number} | null>();
export const currentScene = writable<'LoadingScene'|'GameScene'>('LoadingScene');
