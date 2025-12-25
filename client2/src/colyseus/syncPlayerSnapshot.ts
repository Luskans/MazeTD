// syncPlayerSnapshot.ts
import { playerSnapshot } from "./uiSnapshotStore";

export function syncPlayerSnapshot(raw: {
  gold: number;
  lives: number;
  income: number;
  population: number;
  maxPopulation: number;
}) {
  playerSnapshot.set({
    gold: Number(raw.gold),
    lives: Number(raw.lives),
    income: Number(raw.income),
    population: Number(raw.population),
    maxPopulation: Number(raw.maxPopulation)
  });
}
