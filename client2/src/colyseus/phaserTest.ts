// phaserTest.ts
import { syncPlayerSnapshot } from "./syncPlayerSnapshot";

window.addEventListener("keydown", e => {
  if (e.key === "g") {
    syncPlayerSnapshot({
      gold: Math.floor(Math.random() * 999),
      lives: 20,
      income: 5,
      population: 2,
      maxPopulation: 10
    });
  }
});
