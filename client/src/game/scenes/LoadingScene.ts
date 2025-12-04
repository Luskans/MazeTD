import Phaser from "phaser";
import { network } from "../../services/network";
import { GameState } from "../../../../server/src/rooms/schema/GameState";
import { Room } from "colyseus.js";
import { toast } from "@zerodevx/svelte-toast";
import { screen } from "../../stores/ui";

export class LoadingScene extends Phaser.Scene {
  room: Room<GameState> | null = null;
  roomId: string = "";
  options: any = {};

  constructor() {
    super("LoadingScene");
  }

  init(data: { roomId: string, options: any }) {
    this.roomId = data.roomId;
    this.options = data.options;
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
    this.load.image("tower", "assets/tower.png");
    this.load.image("towerBroken", "assets/towerBroken.png");
    this.load.image('grass', 'assets/grass.png');
  }

  async create() {
    try {
        this.room = await network.joinGame(this.roomId, this.options);

        console.log("Rejoint GameRoom :", this.room.roomId);
        // simulation chargement long
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.room.send("loaded"); 

        this.room.onMessage("begin", () => {
            console.log("Tous les joueurs ont chargé! Démarrage de GameScene...");
            this.scene.start("GameScene", { room: this.room });
        });

    } catch (e) {
        console.error("Erreur lors de la jointure à la GameRoom:", e);
        network.leaveRoom();
        screen.set("home");
        toast.push("Error to join the game.", { classes: ['custom'] })
    }
  }
}