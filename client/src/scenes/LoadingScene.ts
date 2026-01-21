import Phaser from "phaser";
import { GameState } from "../../../server/src/rooms/schema/GameState";
import { Room } from "colyseus.js";
import { sceneStore } from "../stores/screenStore.svelte";
import { getGameRoom } from "../colyseus/gameRoomService";
import { connectGame } from "../colyseus/GameBridge";

export class LoadingScene extends Phaser.Scene {
  private room!: Room<GameState>;

  constructor() {
    super("LoadingScene");
  }

  init() {
    this.room = getGameRoom();
    //@ts-ignore
    // console.log("Dans loading scene, le state de la game : ", this.room.state.toJSON());
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
    this.load.image('rock0', 'assets/grid/rock0.png');
    this.load.image('rock1', 'assets/grid/rock1.png');
    this.load.image('rock2', 'assets/grid/rock2.png');
    this.load.image('rock3', 'assets/grid/rock3.png');
    this.load.spritesheet('checkpoints', 'assets/grid/checkpoints.png', { frameWidth: 64, frameHeight: 64});
    this.load.spritesheet('areas', 'assets/grid/areas.png', { frameWidth: 32, frameHeight: 64});
    this.load.image('checkpoint', 'assets/grid/checkpoint4.png');

    this.load.image('tileset_ground', 'assets/grid/tileset_ground.png');
    this.load.image('tileset_object', 'assets/grid/tileset_object.png');

    this.load.image('tileset_all', 'assets/tilesets/tileset_all.webp');
    this.load.image('water', 'assets/tilesets/water.webp');
    this.load.image('overlay', 'assets/tilesets/overlay.webp');

    this.load.spritesheet('slime', 'assets/enemies/slime.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('orc', 'assets/enemies/orc.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('golem', 'assets/enemies/golem.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image("earth_shock_icon", "assets/buildings/earth_shock_icon.png");
    this.load.spritesheet('earth_shock', 'assets/buildings/earth_shock.png', { frameWidth: 64, frameHeight: 64 });
    this.load.image("basic", "assets/buildings/basic.webp");
    // this.load.image("earth_shock", "assets/buildings/earth_shock.png");
    this.load.image('small_wall3', 'assets/buildings/small_wall.webp');
    this.load.image('big_wall3', 'assets/buildings/big_wall.webp');
    this.load.image('small_wall', 'assets/buildings/small_wall2.webp');
    this.load.image('big_wall', 'assets/buildings/big_wall2.webp');

    this.load.image("spark", "assets/particles/spark.png");
    this.load.image("dot", "assets/particles/dot.png");
    this.load.image("ball", "assets/particles/ball.png");
    this.load.image("line", "assets/particles/line.png");
    this.load.image("path", "assets/particles/path.png");
  }

  async create() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.room.send("loaded"); 

    this.room.onMessage("begin", () => {
      // connectGame(this.room);
      sceneStore.current = 'game';
      this.scene.start("GameScene");
    });

    // CLEAN WHEN CHANGE SCENE
    this.events.once('shutdown', () => {
      // this.room.removeAllListeners();
    });
  }
}