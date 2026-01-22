export type ScreenStore = 'home'|'lobby'|'game';
export type SceneStore = 'loadingScene' | 'gameScene';

export const screenStore = $state({
  current: 'home' as ScreenStore
});
export const sceneStore = $state({
  current: 'loadingScene' as SceneStore
});