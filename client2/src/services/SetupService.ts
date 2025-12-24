import type { Scene } from "phaser";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import { MAP_DATA } from "../../../server/src/constants/mapData";
import type { Room } from "colyseus.js";

// const ZONE_SIZE = 2048;
// const SPACING = 256;
// const TILE_SIZE = 256;
// const GRID_COLUMNS = 4;
// const HALF_ZONE = ZONE_SIZE / 2;
// const TILES_PER_SIDE = ZONE_SIZE / TILE_SIZE;

export class SetupService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
      this.scene = scene;
      this.room = room;
  }

  // createPlayersZone(players: Map<string, any> | any[]) {
  //   const playerArray = Array.from(players.values());
  //   const playerCount = playerArray.length;

  //   const numCols = Math.min(playerCount, GRID_COLUMNS);
  //   const numRows = Math.ceil(playerCount / GRID_COLUMNS);
    
  //   const totalWidth = numCols * ZONE_SIZE + (numCols + 1) * SPACING;
  //   const totalHeight = numRows * ZONE_SIZE + (numRows + 1) * SPACING;

  //   this.scene.physics.world.setBounds(0, 0, totalWidth, totalHeight);
  //   this.scene.cameras.main.setBounds(0, 0, totalWidth, totalHeight);
    
  //   playerArray.forEach((player, index) => {
  //     let col = index % GRID_COLUMNS;
  //     let row = Math.floor(index / GRID_COLUMNS);

  //     let csgX = SPACING + col * (ZONE_SIZE + SPACING);
  //     let csgY = SPACING + row * (ZONE_SIZE + SPACING);

  //     let centerX = csgX + HALF_ZONE;
  //     let centerY = csgY + HALF_ZONE;
      
  //     // Buggé pour l'instant
  //     // let grassTile = this.scene.add.tileSprite(
  //     //   csgX, 
  //     //   csgY, 
  //     //   ZONE_SIZE, 
  //     //   ZONE_SIZE, 
  //     //   'grass'
  //     // );
  //     // grassTile.setOrigin(0, 0); 
  //     // grassTile.setDepth(-10);

  //     const graphics = this.scene.add.graphics();
  //     graphics.fillStyle(0x4CAF50, 1);
  //     graphics.fillRect(csgX, csgY, ZONE_SIZE, ZONE_SIZE);
  //     graphics.setDepth(-10);

  //     const towerSprite = this.scene.add.sprite(centerX, centerY, 'tower');
  //     towerSprite.setOrigin(0.5, 0.5); 
  //     towerSprite.setDepth(1);

  //     if (player.tower && player.tower.position) {
  //       player.tower.position.x = centerX;
  //       player.tower.position.y = centerY;
  //     }

  //     this.scene.add.text(centerX, centerY + 200, `Zone ${index}`, { fontSize: '40px', color: '#ff00ff' }).setOrigin(0.5);
  //   });

  //   // CORRECTION CAMÉRA : Centrer UNE SEULE FOIS après que toutes les zones sont créées.
  //   // Centre la caméra sur le centre du monde total.
  //   // this.scene.cameras.main.centerOn(totalWidth / 2, totalHeight / 2);
  //   // this.scene.cameras.main.setZoom(0.7);
  // }


  private getGridPixelSize() {
    const w = this.room.state.grid.col  * MAP_DATA.cellSize;
    const h = this.room.state.grid.row * MAP_DATA.cellSize;

    return {
      width:  w + MAP_DATA.outsideSize * 2,
      height: h + MAP_DATA.outsideSize * 2
    };
  }

  private computeGridPosition2x4(index: number, gridW: number, gridH: number) {
    const COLS = 4;
    const ROWS = 2;

    const col = index % COLS;
    const row = Math.floor(index / COLS);

    const x = MAP_DATA.spaceSize + col * (gridW + MAP_DATA.spaceSize);
    const y = MAP_DATA.spaceSize + row * (gridH + MAP_DATA.spaceSize);

    return { x, y };
  }

  public getPlayerOffsets(index: number) {
    const { width: gridW, height: gridH } = this.getGridPixelSize();
    const pos = this.computeGridPosition2x4(index, gridW, gridH);
    const x = pos.x + MAP_DATA.outsideSize;
    const y = pos.y + MAP_DATA.outsideSize;
    return { x, y };
  }

  public createPlayersGrid(room: Room<GameState>) {
    const { width: gridW, height: gridH } = this.getGridPixelSize();
    const players = Array.from(room.state.players.values());

    players.forEach((player, index) => {
      // Position 2x4
      const pos = this.computeGridPosition2x4(index, gridW, gridH);

      // --- DESSIN FOND ---
      const g = this.scene.add.graphics();
      g.lineStyle(2, 0xffffff, 1);
      g.strokeRect(pos.x, pos.y, gridW, gridH);
      g.setDepth(1);

      const startX = pos.x + MAP_DATA.outsideSize;
      const startY = pos.y + MAP_DATA.outsideSize;

      // --- CELLS ---
      for (let cx = 0; cx < room.state.grid.col; cx++) {
        for (let cy = 0; cy < room.state.grid.row; cy++) {
          const x = startX + cx * MAP_DATA.cellSize;
          const y = startY + cy * MAP_DATA.cellSize;

          const cell = this.scene.add.rectangle(
            x + MAP_DATA.cellSize / 2,
            y + MAP_DATA.cellSize / 2,
            MAP_DATA.cellSize,
            MAP_DATA.cellSize,
            0x000000,
            0.1
          );
          cell.setStrokeStyle(1, 0xffffff);
          cell.setDepth(2);
        }
      }

      // --- ROCKS ---
      for (const r of room.state.grid.rocks) {
        const x = startX + r.gridX * MAP_DATA.cellSize;
        const y = startY + r.gridY * MAP_DATA.cellSize;

        this.scene.add.rectangle(
          x + 32,
          y + 32,
          64,
          64,
          0x777777
        ).setDepth(3);
      }

      // --- AREAS ---
      for (const z of room.state.grid.areas) {
        const x = startX + z.gridX * MAP_DATA.cellSize;
        const y = startY + z.gridY * MAP_DATA.cellSize;

        this.scene.add.circle(
          x,
          y,
          z.radius,
          0x00ff00,
          0.15
        )
        .setStrokeStyle(2, 0x00aa00)
        .setDepth(3);
      }

      // --- CHEKCPOINTS ---
      for (const c of room.state.grid.checkpoints) {
        const x = startX + c.gridX * MAP_DATA.cellSize;
        const y = startY + c.gridY * MAP_DATA.cellSize;

        this.scene.add.circle(
          x + 32,
          y + 32,
          MAP_DATA.cellSize,
          0x0000ff,
          0.8
        ).setDepth(4);

        this.scene.add.text(
          x + 28,
          y + 26,
          c.order.toString(),
          { fontSize: "16px", color: "#fff" }
        ).setDepth(5);
      }

      // --- LABEL DU JOUEUR ---
      this.scene.add.text(
        pos.x,
        pos.y - 20,
        `Player ${index + 1}`,
        { fontSize: "16px", color: "#fff" }
      );
    });
  }
}
