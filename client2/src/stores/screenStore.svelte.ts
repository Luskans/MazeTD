// import { writable } from "svelte/store";

// export const screenStore = writable<'home'|'lobby'|'game'>('home');
// export const sceneStore = writable<'loadingScene' | 'gameScene'>('loadingScene')
// export const screenStore: ScreenStore = $state('home');
// export const sceneStore: SceneStore = $state('loadingScene');


export type ScreenStore = 'home'|'lobby'|'game';
export type SceneStore = 'loadingScene' | 'gameScene';

export const screenStore = $state({
  current: 'home' as ScreenStore
});
export const sceneStore = $state({
  current: 'home' as ScreenStore
});