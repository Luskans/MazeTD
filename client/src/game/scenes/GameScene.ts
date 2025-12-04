// import Phaser from "phaser";
// import { Room } from "colyseus.js";
// import { GameState } from "../../../server/src/rooms/schema/GameState";

// export class GameScene extends Phaser.Scene {

//   room!: Room<GameState>;

//   constructor() {
//     super("GameScene");
//   }

//   init(data: any) {
//     this.room = data.room;
//   }

//   preload() {
//     this.load.image("enemy", "assets/enemy.png");
//     this.load.image("tower", "assets/tower.png");
//   }

//   create() {
//     console.log("partie crée normalement")
//     // this.room.state.towers.onAdd((tower, id) => {
//     //   console.log("Tower created", id);
//     //   this.add.sprite(400, 300, "tower");
//     // });

//     // this.room.state.enemies.onAdd((enemy, id) => {
//     //   const sprite = this.add.sprite(enemy.x, enemy.y, "enemy");
//     //   enemy.onChange(() => {
//     //     sprite.setPosition(enemy.x, enemy.y);
//     //   });
//     // });
//   }

//   update(time: number, delta: number): void {
//     // game loop
//   }
// }






// import Phaser from 'phaser';

// export class GameScene extends Phaser.Scene {
//   constructor() {
//     super('GameScene');
//   }

//   preload() {
//     this.load.image("enemy", "assets/enemy.png");
//     this.load.image("tower", "assets/tower.png");
//     this.load.image('grass', 'assets/grass.jpg');
//   }

//   create() {
//     const players = [
//       { id: 'me', zone: 0, color: 0x2ecc71 },
//       { id: 'p2', zone: 1, color: 0xe74c3c }
//     ];

//     const zoneWidth = 2000;
//     const worldHeight = 1500;

//     // World bounds (important for camera)
//     this.physics.world.setBounds(0, 0, players.length * zoneWidth, worldHeight);
//     this.cameras.main.setBounds(0, 0, players.length * zoneWidth, worldHeight);

//     // Background (a simple grass texture for now)
//     this.add.tileSprite(0, 0, players.length * zoneWidth, worldHeight, 'grass').setOrigin(0);

//     players.forEach((player, i) => {
//       const x = i * zoneWidth + zoneWidth / 2;
//       const y = worldHeight / 2;

//       // Zone rectangle
//       const zone = this.add.rectangle(
//         i * zoneWidth, 0, zoneWidth, worldHeight,
//         player.color, 0.15
//       ).setOrigin(0);

//       // Tower (placeholder)
//       const tower = this.add.rectangle(x, y, 80, 120, player.color);

//       // Label
//       this.add.text(x, y - 100, `Player ${i + 1}`, { fontSize: '32px', color: '#fff' })
//         .setOrigin(0.5);
//     });

//     // Center camera on "me"
//     this.cameras.main.startFollow(players[0]); // plus tard: suivre la tour, pas le player object
//   }
// }



import { Tower } from "../entities/Tower";
import { ZoneService } from "../services/ZoneService";
import { GameState } from "../../../../server/src/rooms/schema/GameState";
import { getStateCallbacks, Room } from "colyseus.js";
import type { PlayerState } from "../../../../server/src/rooms/schema/PlayerState";
import { SetupService } from "../services/SetupService";
import { CameraService } from '../services/CameraService'; // Import du nouveau service


export class GameScene extends Phaser.Scene {
  room!: Room<GameState>;
  private setupService!: SetupService;
  private cameraService!: CameraService;

  constructor() {
    super("GameScene");
  }

  init(data: any) {
    this.room = data.room;
  }

  create() {
    console.log("Dans la GameScene, la room : ", this.room.state.players);
    this.setupService = new SetupService(this);
    this.cameraService = new CameraService(this);
    const $ = getStateCallbacks(this.room);

    // this.createPlayersTowers();
    this.setupService.createPlayersZone(this.room.state.players);

    const player = this.room.state.players.get(this.room.sessionId)
    console.log("le player co : ", player)
    console.log("l'id du player co : ", player.id)
    console.log("position x de la tower du player co : ", player.tower.position.x)
    this.cameras.main.centerOn(player.tower.position.x, player.tower.position.y);

    $(this.room.state).players.onRemove((p: PlayerState, id: string) => {
      // updatePlayersUI(); // modifier affichage liste des joueurs
      // waveService(); // enlever la vague sur ce joueur

    });
  }

  update(time: number, delta: number) {
    if (this.cameraService) {
      this.cameraService.update(time, delta);
    }
  }

  // createPlayersTowers() {
  //   const players = this.room.state.players;
  //   let index = 0;

  //   players.forEach((player: any, id: string) => {
  //     const pos = ZoneService.getPositionForIndex(index, players.size);
  //     index++;

  //     const tower = new Tower(this, pos.x, pos.y, player.username, id);
  //     this.towers.set(id, tower);

  //     if (id === this.room.sessionId) {
  //       this.cameras.main.startFollow(tower);
  //     }
  //   });
  // }
}
