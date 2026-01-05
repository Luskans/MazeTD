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
    this.load.image('rockk', 'assets/tilesets/rocks/rock.webp');
    this.load.image('rock', 'assets/tilesets/rocks/rockk.webp');
    this.load.image('rock1', 'assets/tilesets/rocks/rock1.webp');
    this.load.image('rock2', 'assets/tilesets/rocks/rock2.webp');
    this.load.image('rock3', 'assets/tilesets/rocks/rock3.webp');
    this.load.image('rock4', 'assets/tilesets/rocks/rock4.webp');

    this.load.image('tileset_all', 'assets/tilesets/tileset_all.webp');
    this.load.image('tileset_grass', 'assets/tilesets/tileset_grass.png');
    this.load.image('tileset_tree', 'assets/tilesets/tileset_tree.png');
    this.load.image('tileset_wall', 'assets/tilesets/tileset_wall.png');
    this.load.image('tileset_object', 'assets/tilesets/tileset_object.png');

    this.load.image('water', 'assets/tilesets/water.webp');
    this.load.image('grass', 'assets/grass.png');

    this.load.image('overlay', 'assets/tilesets/overlay.webp');
    this.load.image("slime", "assets/enemies/slime.png");
    this.load.image("orc", "assets/enemies/orc.png");
    this.load.image("golem", "assets/enemies/golem.png");

    this.load.image("basic", "assets/buildings/basic.webp");
    // this.load.image("basic", "assets/buildings/basic.png");
    this.load.image("earth_shock", "assets/buildings/earth_shock.png");
    // this.load.image('small_wall', 'assets/buildings/small_wall.png');
    // this.load.image('big_wall', 'assets/buildings/big_wall.png');
    this.load.image('small_wall3', 'assets/buildings/small_wall.webp');
    this.load.image('big_wall3', 'assets/buildings/big_wall.webp');
    this.load.image('small_wall', 'assets/buildings/small_wall2.webp');
    this.load.image('big_wall', 'assets/buildings/big_wall2.webp');

    this.load.image("towerBroken", "assets/towerBroken.png");
    this.load.image('grass', 'assets/grass.png');
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