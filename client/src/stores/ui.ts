import { writable } from 'svelte/store';

export const screen = writable<'home'|'lobby'|'game'>('home');
export const currentRoom = writable<any>(null);