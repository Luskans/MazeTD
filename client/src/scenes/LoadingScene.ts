import Phaser from "phaser";
import { GameState } from "../../../server/src/rooms/schema/GameState";
import { Room } from "colyseus.js";
import { sceneStore } from "../stores/screenStore.svelte";
import { getGameRoom } from "../colyseus/gameRoomService";

export class LoadingScene extends Phaser.Scene {
  private room!: Room<GameState>;

  constructor() {
    super("LoadingScene");
  }

  init() {
    this.room = getGameRoom();
    //@ts-ignore
    console.log("Dans loading scene, le state de la game : ", this.room.state.toJSON());
  }

  preload() {
    // Loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.rectangle(width / 2, height / 2, 0, 30, 0x44aa44);
    const progressBox = this.add.rectangle(width / 2, height / 2, 320, 40, 0x222222);

    this.add.text(width / 2, height / 2 - 50, "Chargement...", {
      font: "20px Arial",
      color: "#ffffff",
    }).setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressBar.width = 300 * value;
    });

    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
    });

    // Assets
    this.load.image("enemy", "assets/enemy.png");
    this.load.image("basic", "assets/basic.png");
    this.load.image("towerBroken", "assets/towerBroken.png");
    this.load.image('small_wall', 'assets/small_wall.png');
    this.load.image('grass', 'assets/grass.png');
  }

  async create() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("on est dans create de loading scene, la room : ", this.room)
    this.room.send("loaded"); 

    this.room.onMessage("begin", () => {
      sceneStore.current = 'game';
      this.scene.start("GameScene");
    });

    // CLEAN WHEN CHANGE SCENE
    this.events.once('shutdown', () => {
      this.room.removeAllListeners();
    });
  }
}