import { writable } from "svelte/store";

export const screenStore = writable<'home'|'lobby'|'game'>('home');
export const sceneStore = writable<'loadingScene' | 'gameScene'>('loadingScene')