import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";
import { LoadingScene } from "./scenes/LoadingScene";

let game: Phaser.Game | null = null;

export async function createGame() {
  if (game) return game;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: ".game-screen",
    backgroundColor: "#d7899eff",
    physics: { default: "arcade" },
    pixelArt: false,
    scale: {
      // mode: Phaser.Scale.FIT,
      mode: Phaser.Scale.RESIZE,
      // autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [LoadingScene, GameScene],
  };

  game = new Phaser.Game(config);
  return game;
}

export function getGame() {
  return game;
}
