import Phaser from "phaser";
import { network } from "../colyseus/Network";
import { GameState } from "../../../server/src/rooms/schema/GameState";
import { Room } from "colyseus.js";
import { toast } from "@zerodevx/svelte-toast";
import { sceneStore, screenStore } from "../stores/screenStore.svelte";
import { gameRoom } from "../stores/gameStore";
import { connectGame } from "../colyseus/GameBridge";
import { get } from "svelte/store";

export class LoadingScene extends Phaser.Scene {
  private room!: Room<GameState>;
  // roomId: string = "";
  // options: any = {};

  constructor() {
    super("LoadingScene");
  }

  // init(data: { roomId: string, options: any }) {
  //   // this.roomId = data.roomId;
  //   this.options = data.options;
  //   sceneStore.set('loadingScene');
  //   // console.log("dans loading scene" + this.roomId + this.options)
  // }

  // init() {
  //   this.room = get(gameRoom);
  //   //@ts-ignore
  //   console.log("Dans loading scene, le state de la game : ", this.room.state.toJSON())
  // }

  init() {
    this.room = get(gameRoom) as Room<GameState>;
    //@ts-ignore
    console.log("Dans loading scene, le state de la game : ", this.room?.state.toJSON());
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

  // async create() {
  //   try {
  //     // On récupère la room depuis le store. 
  //     // Si network.joinGame n'est pas fini, il faut l'attendre.
  //     // this.room = get(gameRoom); 

  //     // if (!this.room) {
  //     //     // Optionnel : attendre un peu ou rediriger vers l'accueil
  //     //     throw new Error("No game room found");
  //     // }

  //     // console.log("Rejoint GameRoom :", this.room.roomId);
      
  //     // On prévient le serveur que CE client est prêt (assets chargés)
  //     await new Promise(resolve => setTimeout(resolve, 5000));
  //     this.room?.send("loaded"); 

  //     // On attend le signal de départ global (tous les joueurs sont 'loaded')
  //     this.room?.onMessage("begin", () => {
  //       this.scene.start("GameScene", { room: this.room });
  //     });

  //   } catch (e) {
  //     console.error(e);
  //     network.leaveRoom();
  //     screenStore.set("home");
  //     toast.push("Error to join the game.", { classes: ['custom'] })
  //   }

  //   // CLEAN WHEN CHANGE SCENE
  //   this.events.once('shutdown', () => this.destroy());
  // }

  async create() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    this.room?.send("loaded"); 

    this.room?.onMessage("begin", () => {
      this.scene.start("GameScene");
      sceneStore.set('gameScene');
    });

    // CLEAN WHEN CHANGE SCENE
    this.events.once('shutdown', () => this.destroy());
  }

  // async create() {
  //   try {
  //     // const room = await network.joinGame(this.roomId, this.options);
  //     this.room = $gameRoom;
  //     // gameRoom.set(room);
  //     // connectGame(room);

  //     console.log("Rejoint GameRoom :", this.room.roomId);
  //     // simulation chargement long
  //     await new Promise(resolve => setTimeout(resolve, 3000));
  //     this.room.send("loaded"); 

  //     this.room.onMessage("begin", () => {
  //       console.log("Tous les joueurs ont chargé! Démarrage de GameScene...");
  //       this.scene.start("GameScene", { room: this.room });
  //     });

  //   } catch (e) {
  //     console.error("Erreur lors de la jointure à la GameRoom:", e);
  //     network.leaveRoom();
  //     screenStore.set("home");
  //     toast.push("Error to join the game.", { classes: ['custom'] })
  //   }
  // }

  private destroy() {
    this.room?.removeAllListeners()
  }
}