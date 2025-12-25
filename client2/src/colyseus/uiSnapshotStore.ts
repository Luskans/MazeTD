// uiSnapshotStore.ts
import { writable } from "svelte/store";

export type PlayerSnapshot = {
  gold: number;
  lives: number;
  income: number;
  population: number;
  maxPopulation: number;
};

export const playerSnapshot = writable<PlayerSnapshot>({
  gold: 0,
  lives: 0,
  income: 0,
  population: 0,
  maxPopulation: 0
});
