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

    this.load.image('tileset', 'assets/grid/tileset.webp');
    this.load.image('ocean', 'assets/grid/ocean.webp');
    this.load.image('overlay', 'assets/grid/overlay.webp');
    this.load.image('rock0', 'assets/grid/rock0.png');
    this.load.image('rock1', 'assets/grid/rock1.png');
    this.load.image('rock2', 'assets/grid/rock2.png');
    this.load.image('rock3', 'assets/grid/rock3.png');
    this.load.spritesheet('checkpoints', 'assets/grid/checkpoints.png', { frameWidth: 64, frameHeight: 64});
    this.load.spritesheet('areas', 'assets/grid/areas.png', { frameWidth: 32, frameHeight: 64});

    this.load.spritesheet('slime', 'assets/enemies/slime.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('orc', 'assets/enemies/orc.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('golem', 'assets/enemies/golem.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('small_wall_icon', 'assets/buildings/icons/small_wall_icon.png');
    this.load.image('big_wall_icon', 'assets/buildings/icons/big_wall_icon.png');
    this.load.image("basic_icon", "assets/buildings/icons/basic_icon.png");
    this.load.spritesheet('basic', 'assets/buildings/spritesheets/basic.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("fire_icon", "assets/buildings/icons/fire_icon.png");
    this.load.spritesheet('fire', 'assets/buildings/spritesheets/fire.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("ice_icon", "assets/buildings/icons/ice_icon.png");
    this.load.spritesheet('ice', 'assets/buildings/spritesheets/ice.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("earth_icon", "assets/buildings/icons/earth_icon.png");
    this.load.spritesheet('earth', 'assets/buildings/spritesheets/earth.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("nature_icon", "assets/buildings/icons/nature_icon.png");
    this.load.spritesheet('nature', 'assets/buildings/spritesheets/nature.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("water_icon", "assets/buildings/icons/water_icon.png");
    this.load.spritesheet('water', 'assets/buildings/spritesheets/water.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("air_icon", "assets/buildings/icons/air_icon.png");
    this.load.spritesheet('air', 'assets/buildings/spritesheets/air.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("light_icon", "assets/buildings/icons/light_icon.png");
    this.load.spritesheet('light', 'assets/buildings/spritesheets/light.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("dark_icon", "assets/buildings/icons/dark_icon.png");
    this.load.spritesheet('dark', 'assets/buildings/spritesheets/dark.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("electric_icon", "assets/buildings/icons/electric_icon.png");
    this.load.spritesheet('electric', 'assets/buildings/spritesheets/electric.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("ghost_icon", "assets/buildings/icons/ghost_icon.png");
    this.load.spritesheet('ghost', 'assets/buildings/spritesheets/ghost.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("poison_icon", "assets/buildings/icons/poison_icon.png");
    this.load.spritesheet('poison', 'assets/buildings/spritesheets/poison.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("blood_icon", "assets/buildings/icons/blood_icon.png");
    this.load.spritesheet('blood', 'assets/buildings/spritesheets/blood.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("metal_icon", "assets/buildings/icons/metal_icon.png");
    this.load.spritesheet('metal', 'assets/buildings/spritesheets/metal.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("fairy_icon", "assets/buildings/icons/fairy_icon.png");
    this.load.spritesheet('fairy', 'assets/buildings/spritesheets/fairy.png', { frameWidth: 128, frameHeight: 128 });
    this.load.image("arcane_icon", "assets/buildings/icons/arcane_icon.png");
    this.load.spritesheet('arcane', 'assets/buildings/spritesheets/arcane.png', { frameWidth: 128, frameHeight: 128 });

    this.load.image("dot", "assets/particles/dot.png");
    this.load.image("ball", "assets/particles/ball.png");
    this.load.image("line", "assets/particles/line.png");
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