import type { Scene } from "phaser";
import type { PlayerState } from "../../../../server/src/rooms/schema/PlayerState";

const ZONE_SIZE = 2048;
const SPACING = 256;
const TILE_SIZE = 256;
const GRID_COLUMNS = 4;
const HALF_ZONE = ZONE_SIZE / 2;
// const TILES_PER_SIDE = ZONE_SIZE / TILE_SIZE;

export class SetupService {

  constructor(private scene: Scene) {}

  createPlayersZone(players: Map<string, any> | any[]) {
    const playerArray = Array.from(players.values());
    const playerCount = playerArray.length;

    const numCols = Math.min(playerCount, GRID_COLUMNS);
    const numRows = Math.ceil(playerCount / GRID_COLUMNS);
    
    const totalWidth = numCols * ZONE_SIZE + (numCols + 1) * SPACING;
    const totalHeight = numRows * ZONE_SIZE + (numRows + 1) * SPACING;

    this.scene.physics.world.setBounds(0, 0, totalWidth, totalHeight);
    this.scene.cameras.main.setBounds(0, 0, totalWidth, totalHeight);
    
    playerArray.forEach((player, index) => {
      let col = index % GRID_COLUMNS;
      let row = Math.floor(index / GRID_COLUMNS);

      let csgX = SPACING + col * (ZONE_SIZE + SPACING);
      let csgY = SPACING + row * (ZONE_SIZE + SPACING);

      let centerX = csgX + HALF_ZONE;
      let centerY = csgY + HALF_ZONE;
      
      // Buggé pour l'instant
      // let grassTile = this.scene.add.tileSprite(
      //   csgX, 
      //   csgY, 
      //   ZONE_SIZE, 
      //   ZONE_SIZE, 
      //   'grass'
      // );
      // grassTile.setOrigin(0, 0); 
      // grassTile.setDepth(-10);

      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0x4CAF50, 1);
      graphics.fillRect(csgX, csgY, ZONE_SIZE, ZONE_SIZE);
      graphics.setDepth(-10);

      const towerSprite = this.scene.add.sprite(centerX, centerY, 'tower');
      towerSprite.setOrigin(0.5, 0.5); 
      towerSprite.setDepth(1);

      if (player.tower && player.tower.position) {
        player.tower.position.x = centerX;
        player.tower.position.y = centerY;
      }

      this.scene.add.text(centerX, centerY + 200, `Zone ${index}`, { fontSize: '40px', color: '#ff00ff' }).setOrigin(0.5);
    });

    // CORRECTION CAMÉRA : Centrer UNE SEULE FOIS après que toutes les zones sont créées.
    // Centre la caméra sur le centre du monde total.
    // this.scene.cameras.main.centerOn(totalWidth / 2, totalHeight / 2);
    // this.scene.cameras.main.setZoom(0.7);
  }
}
