import type { GameState } from "../../../server/src/rooms/schema/GameState";
import { MAP_DATA } from "../../../server/src/datas/mapData";
import type { Room } from "colyseus.js";
import { getRandom } from "../../../server/src/services/utils";
import { WaterPostPipeline } from "../shaders/WaterPostPipeline";
import type { RockState } from "../../../server/src/rooms/schema/RockState";
import { getColorByAreaType } from "./utils";

const TILE = {
  TOP_LEFT: 64, TOP_START: 65, TOP_END: 68, TOP_RIGHT: 69,
  LEFT_START: 70, LEFT_END: 73, RIGHT_START: 74, RIGHT_END: 77,
  BOT_LEFT: 80, BOT_START: 81, BOT_END: 85, BOT_RIGHT: 86,
  GRASS_START: 0, GRASS_END: 15, GRASS_TOP_LEFT: 62 , GRASS_TOP_RIGHT: 63,
  FLOWER_START: 16, FLOWER_END: 31,
  SLAB_START: 32, SLAB_END: 61,
  WEED_START: 96, WEED_END: 107,
  STONE_START: 108, STONE_END: 111,
  WATER: 78,
  ROCK_TOP_LEFT: 87, ROCK_TOP: 88, ROCK_TOP_RIGHT: 89,
  ROCK_LEFT: 90, ROCK_RIGHT: 91,
  ROCK_BOT_LEFT: 92, ROCK_BOT: 93, ROCK_BOT_RIGHT: 94,
  TOP_C_BOT_LEFT: 112, TOP_C_BOT_RIGHT: 113, LEFT_C_TOP_RIGHT: 114, LEFT_C_BOT_RIGHT: 115,
  RIGHT_C_TOP_LEFT: 116, RIGHT_C_BOT_LEFT: 117, BOT_C_TOP_LEFT: 118, BOT_C_TOP_RIGHT: 119,
  C_TOP_LEFT: 120, C_TOP_RIGHT: 121, C_BOT_LEFT: 122, C_BOT_RIGHT: 123
};

export class GridService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private rockSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private mask!: Phaser.Display.Masks.GeometryMask;

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
      this.scene = scene;
      this.room = room;
      this.createWorldOcean();
  }

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

  public getPlayerOffset(index: number) {
    const { width: gridW, height: gridH } = this.getGridPixelSize();
    const pos = this.computeGridPosition2x4(index, gridW, gridH);
    const x = pos.x + MAP_DATA.outsideSize;
    const y = pos.y + MAP_DATA.outsideSize;
    return { x, y };
  }

  public createWorldOcean() {
    const COLS = 4;
    const ROWS = 2;
    const activeCols = Math.min(this.room.state.players.size, COLS);
    const activeRows = Math.ceil(this.room.state.players.size / COLS);
    const gridPixelWidth = this.room.state.grid.col * 32;
    const gridPixelHeight = this.room.state.grid.row * 32;
    const islandWidth = gridPixelWidth + (2 * 32) + 2 * MAP_DATA.outsideSize;
    const islandHeight = gridPixelHeight + (3 * 32) + 2 * MAP_DATA.outsideSize;
    const worldWidth = activeCols * (islandWidth + MAP_DATA.spaceSize) + MAP_DATA.spaceSize;
    const worldHeight = activeRows * (islandHeight + MAP_DATA.spaceSize) + MAP_DATA.spaceSize;
    this.scene.add.tileSprite(0, 0, worldWidth, worldHeight, 'water').setOrigin(0, 0).setDepth(0);
  }

  // public createPlayersGrid(room: Room<GameState>) {
  //   const { width: gridW, height: gridH } = this.getGridPixelSize();
  //   const players = Array.from(room.state.players.values());

  //   players.forEach((player, index) => {
  //     // Position 2x4
  //     const pos = this.computeGridPosition2x4(index, gridW, gridH);

  //     // --- DESSIN FOND ---
  //     const g = this.scene.add.graphics();
  //     g.lineStyle(2, 0xffffff, 1);
  //     g.strokeRect(pos.x, pos.y, gridW, gridH);
  //     g.setDepth(1);

  //     const startX = pos.x + MAP_DATA.outsideSize;
  //     const startY = pos.y + MAP_DATA.outsideSize;

  //     // --- CELLS ---
  //     for (let cx = 0; cx < room.state.grid.col; cx++) {
  //       for (let cy = 0; cy < room.state.grid.row; cy++) {
  //         const x = startX + cx * MAP_DATA.cellSize;
  //         const y = startY + cy * MAP_DATA.cellSize;

  //         const cell = this.scene.add.rectangle(
  //           x + MAP_DATA.cellSize / 2,
  //           y + MAP_DATA.cellSize / 2,
  //           MAP_DATA.cellSize,
  //           MAP_DATA.cellSize,
  //           0x000000,
  //           0.1
  //         );
  //         cell.setStrokeStyle(1, 0xffffff);
  //         cell.setDepth(2);
  //       }
  //     }

  //     // --- ROCKS ---
  //     for (const r of room.state.grid.rocks) {
  //       const x = startX + r.gridX * MAP_DATA.cellSize;
  //       const y = startY + r.gridY * MAP_DATA.cellSize;

  //       this.scene.add.rectangle(
  //         x + 32,
  //         y + 32,
  //         64,
  //         64,
  //         0x777777
  //       ).setDepth(3);
  //     }

  //     // --- AREAS ---
  //     for (const z of room.state.grid.areas) {
  //       const x = startX + z.gridX * MAP_DATA.cellSize;
  //       const y = startY + z.gridY * MAP_DATA.cellSize;

  //       this.scene.add.circle(
  //         x,
  //         y,
  //         z.radius,
  //         0x00ff00,
  //         0.15
  //       )
  //       .setStrokeStyle(2, 0x00aa00)
  //       .setDepth(3);
  //     }

  //     // --- CHEKCPOINTS ---
  //     for (const c of room.state.grid.checkpoints) {
  //       const x = startX + c.gridX * MAP_DATA.cellSize;
  //       const y = startY + c.gridY * MAP_DATA.cellSize;

  //       this.scene.add.circle(
  //         x + 32,
  //         y + 32,
  //         MAP_DATA.cellSize,
  //         0x0000ff,
  //         0.8
  //       ).setDepth(4);

  //       this.scene.add.text(
  //         x + 28,
  //         y + 26,
  //         c.order.toString(),
  //         { fontSize: "16px", color: "#fff" }
  //       ).setDepth(5);
  //     }

  //     // --- LABEL DU JOUEUR ---
  //     this.scene.add.text(
  //       pos.x,
  //       pos.y - 20,
  //       `Player ${index + 1}`,
  //       { fontSize: "16px", color: "#fff" }
  //     );
  //   });
  // }

  // public createPlayersGrid(room: Room<GameState>) {
  //   const { width: gridW, height: gridH } = this.getGridPixelSize();
  //   const players = Array.from(room.state.players.values());

  //   players.forEach((player, index) => {
  //     const pos = this.computeGridPosition2x4(index, gridW, gridH);

  //     // On définit la taille de notre "île" (Grille + 2 cases de marge pour herbe/falaise)
  //     const islandMargin = 1;
  //     const islandCols = room.state.grid.col + (islandMargin * 2);
  //     const islandRows = room.state.grid.row + (islandMargin * 2);

  //     // 1. Créer la Tilemap dynamique
  //     const map = this.scene.make.tilemap({
  //       tileWidth: 32,
  //       tileHeight: 32,
  //       width: islandCols,
  //       height: islandRows,
  //     });

  //     const tileset = map.addTilesetImage('tileset_all', 'tileset_all');
      
  //     // On positionne la tilemap pour que la grille logique tombe au bon endroit
  //     const startX = pos.x + MAP_DATA.outsideSize;
  //     const startY = pos.y + MAP_DATA.outsideSize;
  //     const islandStartX = pos.x + MAP_DATA.outsideSize - (islandMargin * 32);
  //     const islandStartY = pos.y + MAP_DATA.outsideSize - (islandMargin * 32);
  //     const layer = map.createBlankLayer(`player_grid_${index}`, tileset!, islandStartX, islandStartY);

  //     // 2. Remplissage intelligent
  //     for (let x = 0; x < islandCols; x++) {
  //       for (let y = 0; y < islandRows; y++) {
            
  //         // --- Bordure Extérieure (Falaise) ---
  //         if (x === 0 || x === islandCols - 1 || y === 0 || y === islandRows - 1) {
  //           layer?.putTileAt(32, x, y); // Index de la falaise
  //         } 
  //         // --- Bordure Intérieure (Herbe de transition) ---
  //         else if (x === 1 || x === islandCols - 2 || y === 1 || y === islandRows - 2) {
  //           layer?.putTileAt(0, x, y); // Herbe simple
  //         }
  //         // --- Zone de Jeu (Variations aléatoires) ---
  //         else {
  //           const rand = Math.random();
  //           if (rand > 0.95) {
  //               layer?.putTileAt(2, x, y); // 5% de fleurs
  //           } else if (rand > 0.85) {
  //               layer?.putTileAt(1, x, y); // 10% de touffes d'herbe
  //           } else {
  //               layer?.putTileAt(0, x, y); // Reste en herbe simple
  //           }
  //         }
  //       }
  //     }

  //     layer?.setDepth(1);

  //     // GRID OVERLAY
  //     const gridOverlay = this.scene.add.tileSprite(
  //       startX + (room.state.grid.col * 16),
  //       startY + (room.state.grid.row * 16),
  //       room.state.grid.col * 32,
  //       room.state.grid.row * 32,
  //       'overlay'
  //     );
  //     gridOverlay.setDepth(2).setAlpha(0.8);

  //     // ROCKS
  //     for (const r of room.state.grid.rocks) {
  //       const x = startX + r.gridX * MAP_DATA.cellSize;
  //       const y = startY + r.gridY * MAP_DATA.cellSize;
  //       this.scene.add.sprite(x + 32, y + 32, "rock").setDepth(2);
  //     }

  //   });
  // }

  // public createPlayersGrid(room: Room<GameState>) {
  //   const { width: gridW, height: gridH } = this.getGridPixelSize();
  //   const players = Array.from(room.state.players.values());

  //   // 0. Créer l'océan
  //   this.scene.add.tileSprite(
  //       0, 0, 
  //       8000, 
  //       8000, 
  //       'water'
  //   ).setDepth(0);

  //   players.forEach((player, index) => {
  //     const pos = this.computeGridPosition2x4(index, gridW, gridH);

  //     // On définit la taille de notre "île" (Grille + 2 cases de marge pour herbe/falaise)
  //     const landMargin = 1;
  //     const islandCols = room.state.grid.col + (landMargin * 2);
  //     const islandRows = room.state.grid.row + (landMargin * 2);

  //     // 1. Créer la Tilemap dynamique
  //     const map = this.scene.make.tilemap({
  //       tileWidth: 32,
  //       tileHeight: 32,
  //       width: islandCols,
  //       height: islandRows,
  //     });

  //     const tileset = map.addTilesetImage('tileset_all', 'tileset_all');
      
  //     // On positionne la tilemap pour que la grille logique tombe au bon endroit
  //     const startX = pos.x + MAP_DATA.outsideSize;
  //     const startY = pos.y + MAP_DATA.outsideSize;
  //     const islandStartX = pos.x + MAP_DATA.outsideSize - (landMargin * 32);
  //     const islandStartY = pos.y + MAP_DATA.outsideSize - (landMargin * 32);
  //     const layer0 = map.createBlankLayer(`player_layer0_${index}`, tileset!, islandStartX, islandStartY);
  //     const layer1 = map.createBlankLayer(`player_layer1_${index}`, tileset!, islandStartX, islandStartY);
  //     if (!layer0 || !layer1) return;

  //     // 2. On rempli le layer 0 avec les rocks
  //     // for (const r of room.state.grid.rocks) {
  //     //   layer0.putTileAt(TILE.WATER, r.gridX + landMargin, r.gridY + landMargin);
  //     //   layer0.putTileAt(TILE.WATER, r.gridX + 1 + landMargin, r.gridY + landMargin);
  //     //   layer0.putTileAt(TILE.WATER, r.gridX + landMargin, r.gridY + 1 + landMargin);
  //     //   layer0.putTileAt(TILE.WATER, r.gridX + 1 + landMargin, r.gridY + 1 + landMargin);
  //     // }

  //     for (let x = 0; x < islandCols; x++) {
  //       for (let y = 0; y < islandRows; y++) {
          
  //         // 2. Remplissage du layer 0
  //         const isLeft = x === 0;
  //         const isRight = x === islandCols - 1;
  //         const isTop = y === 0;
  //         const isBottom = y === islandRows - 1;

  //         const isRock = layer0.getTileAt(x, y)?.index === TILE.WATER
  //         const left = layer0.getTileAt(x - 1, y)?.index !== TILE.WATER;
  //         const right = layer0.getTileAt(x + 1, y)?.index !== TILE.WATER;
  //         const top = layer0.getTileAt(x, y - 1)?.index !== TILE.WATER;
  //         const bot = layer0.getTileAt(x, y + 1)?.index !== TILE.WATER;
  //         const topLeft = layer0.getTileAt(x - 1, y - 1)?.index !== TILE.WATER;
  //         const topRight = layer0.getTileAt(x + 1, y - 1)?.index !== TILE.WATER;
  //         const botLeft = layer0.getTileAt(x - 1, y + 1)?.index !== TILE.WATER;
  //         const botRight = layer0.getTileAt(x + 1, y + 1)?.index !== TILE.WATER;

  //         const leftIsFlower = layer0.getTileAt(x - 1, y)?.index >= TILE.FLOWER_START && layer0.getTileAt(x - 1, y)?.index <= TILE.FLOWER_END;
  //         const topIsFlower = layer0.getTileAt(x, y - 1)?.index >= TILE.FLOWER_START && layer0.getTileAt(x, y - 1)?.index >= TILE.FLOWER_START;
  //         const flowerChance = leftIsFlower || topIsFlower ? 0.5 : 0.04;

  //         const leftIsSlab = layer0.getTileAt(x - 1, y)?.index >= TILE.SLAB_START && layer0.getTileAt(x - 1, y)?.index <= TILE.SLAB_END;
  //         const topIsSlab = layer0.getTileAt(x, y - 1)?.index >= TILE.SLAB_START && layer0.getTileAt(x, y - 1)?.index >= TILE.SLAB_START;
  //         const slabChance = leftIsSlab || topIsSlab ? 0.2 : 0.01;

  //         if (isRock) {
  //           // if (left && top) layer1.putTileAt(TILE.ROCK_TOP_LEFT, x, y);
  //           // else if (right && top) layer1.putTileAt(TILE.ROCK_TOP_RIGHT, x, y);
  //           // else if (left && bot) layer1.putTileAt(TILE.ROCK_BOT_LEFT, x, y);
  //           // else if (right && bot) layer1.putTileAt(TILE.ROCK_BOT_RIGHT, x, y);

  //           // else if (top && botLeft) layer1.putTileAt(TILE.TOP_C_BOT_LEFT, x, y);
  //           // else if (top && botRight) layer1.putTileAt(TILE.TOP_C_BOT_RIGHT, x, y);

  //           // else if (left && topRight) layer1.putTileAt(TILE.LEFT_C_TOP_RIGHT, x, y);
  //           // else if (left && botRight) layer1.putTileAt(TILE.LEFT_C_BOT_RIGHT, x, y);

  //           // else if (right && topLeft) layer1.putTileAt(TILE.RIGHT_C_TOP_LEFT, x, y);
  //           // else if (right && botLeft) layer1.putTileAt(TILE.RIGHT_C_BOT_LEFT, x, y);

  //           // else if (bot && topLeft) layer1.putTileAt(TILE.BOT_C_TOP_LEFT, x, y);
  //           // else if (bot && topRight) layer1.putTileAt(TILE.BOT_C_TOP_RIGHT, x, y);

  //           // else if (topLeft && !top && !bot && !left && !right) layer1.putTileAt(TILE.C_TOP_LEFT, x, y);
  //           // else if (topRight && !top && !bot && !left && !right) layer1.putTileAt(TILE.C_TOP_RIGHT, x, y);
  //           // else if (botLeft && !top && !bot && !left && !right) layer1.putTileAt(TILE.C_BOT_LEFT, x, y);
  //           // else if (botRight && !top && !bot && !left && !right) layer1.putTileAt(TILE.C_BOT_RIGHT, x, y);

  //           // else if (top) layer1.putTileAt(TILE.ROCK_TOP, x, y);
  //           // else if (bot) layer1.putTileAt(TILE.ROCK_BOT, x, y);
  //           // else if (left) layer1.putTileAt(TILE.ROCK_LEFT, x, y);
  //           // else if (right) layer1.putTileAt(TILE.ROCK_RIGHT, x, y);
  //           // else continue;

  //           const values = [32, 33, 40, 41, 48, 49];
  //           const randomValue = values[Math.floor(Math.random() * values.length)];
  //           layer0.putTileAt(randomValue, x, y);

  //         } else {
  //           if (isLeft && isTop) {
  //             layer0.putTileAt(TILE.GRASS_TOP_LEFT, x, y);
  //             layer1.putTileAt(TILE.TOP_LEFT, x, y);
  //           } else if (isRight && isTop) {
  //             layer0.putTileAt(TILE.GRASS_TOP_RIGHT, x, y);
  //             layer1.putTileAt(TILE.TOP_RIGHT, x, y);
  //           } else if (isLeft && isBottom) {
  //             layer1.putTileAt(TILE.BOT_LEFT, x, y);
  //           } else if (isRight && isBottom) {
  //             layer1.putTileAt(TILE.BOT_RIGHT, x, y);
  //           } else if (isTop) {
  //             layer0.putTileAt(getRandom(TILE.GRASS_START, TILE.GRASS_END), x, y);
  //             layer1.putTileAt(getRandom(TILE.TOP_START, TILE.TOP_END), x, y);
  //           } else if (isBottom) {
  //             layer0.putTileAt(getRandom(TILE.GRASS_START, TILE.GRASS_END), x, y);
  //             layer1.putTileAt(getRandom(TILE.BOT_START, TILE.BOT_END), x, y);
  //           } else if (isLeft) {
  //             layer0.putTileAt(getRandom(TILE.GRASS_START, TILE.GRASS_END), x, y);
  //             layer1.putTileAt(getRandom(TILE.LEFT_START, TILE.LEFT_END), x, y);
  //           } else if (isRight) {
  //             layer0.putTileAt(getRandom(TILE.GRASS_START, TILE.GRASS_END), x, y);
  //             layer1.putTileAt(getRandom(TILE.RIGHT_START, TILE.RIGHT_END), x, y);
  //           } else {
  //             const rand = Math.random();
  //             // if (rand < slabChance) layer0.putTileAt(getRandom(TILE.SLAB_START, TILE.SLAB_END), x, y);
  //              if (rand < flowerChance) layer0.putTileAt(getRandom(TILE.FLOWER_START, TILE.FLOWER_END), x, y);
  //             else layer0.putTileAt(getRandom(TILE.GRASS_START, TILE.GRASS_END), x, y);
  //             if (rand > 0.98) layer1.putTileAt(getRandom(TILE.STONE_START, TILE.STONE_END), x, y);
  //             else if (rand > 0.85) layer1.putTileAt(getRandom(TILE.WEED_START, TILE.WEED_END), x, y);
  //           }
  //         }
  //       }
  //     }
  //     layer0.setDepth(1);
  //     layer1.setDepth(2);

  //     // // GRID OVERLAY
  //     // const gridOverlay = this.scene.add.tileSprite(
  //     //   startX + (room.state.grid.col * 16),
  //     //   startY + (room.state.grid.row * 16),
  //     //   room.state.grid.col * 32,
  //     //   room.state.grid.row * 32,
  //     //   'overlay'
  //     // );
  //     // gridOverlay.setDepth(2).setAlpha(0.8);
  //   });
  // }

  public createPlayersGrid(room: Room<GameState>, ySortGroup: Phaser.GameObjects.Group) {
    const { width: gridW, height: gridH } = this.getGridPixelSize();
    const players = Array.from(room.state.players.values());

    // Créer l'océan
    // this.scene.add.tileSprite(0, 0, worldSize.worldWidth, worldSize.worldHeight, 'water').setDepth(0);

    players.forEach((player, index) => {
      const pos = this.computeGridPosition2x4(index, gridW, gridH);

      // On définit la taille de notre "île" (Grille + 2 cases de marge pour herbe/falaise)
      const landMargin = 1;
      const islandCols = room.state.grid.col + (landMargin * 2);
      const islandRows = room.state.grid.row + (landMargin * 3);

      // 0. On crée le mask aux dimensions des zones
      const mask = this.scene.add.graphics();
      mask.fillStyle(0xffffff);
      mask.fillRect(pos.x + MAP_DATA.outsideSize, pos.y + MAP_DATA.outsideSize, room.state.grid.col * 32, room.state.grid.row * 32);
      this.mask = mask.createGeometryMask();

      // 1. Créer la Tilemap dynamique
      const map = this.scene.make.tilemap({
        tileWidth: 32,
        tileHeight: 32,
        width: islandCols,
        height: islandRows,
      });

      const tileset = map.addTilesetImage('tileset_all', 'tileset_all');
      
      // On positionne la tilemap pour que la grille logique tombe au bon endroit
      const startX = pos.x + MAP_DATA.outsideSize;
      const startY = pos.y + MAP_DATA.outsideSize;
      const islandStartX = pos.x + MAP_DATA.outsideSize - (landMargin * 32);
      const islandStartY = pos.y + MAP_DATA.outsideSize - (landMargin * 32);
      const layer0 = map.createBlankLayer(`player_layer0_${index}`, tileset!, islandStartX, islandStartY);
      const layer1 = map.createBlankLayer(`player_layer1_${index}`, tileset!, islandStartX, islandStartY);
      if (!layer0 || !layer1) return;

      for (let x = 0; x < islandCols; x++) {
        for (let y = 0; y < islandRows; y++) {
          
          const isLeft = x === 0;
          const isRight = x === islandCols - 1;
          const isTop = y === 0;
          const isBottom = y === islandRows - 1;
          
          const leftIsFlower = layer0.getTileAt(x - 1, y)?.index >= TILE.FLOWER_START && layer0.getTileAt(x - 1, y)?.index <= TILE.FLOWER_END;
          const topIsFlower = layer0.getTileAt(x, y - 1)?.index >= TILE.FLOWER_START && layer0.getTileAt(x, y - 1)?.index >= TILE.FLOWER_START;
          const flowerChance = leftIsFlower || topIsFlower ? 0.5 : 0.04;
          
          const leftIsSlab = layer0.getTileAt(x - 1, y)?.index >= TILE.SLAB_START && layer0.getTileAt(x - 1, y)?.index <= TILE.SLAB_END;
          const topIsSlab = layer0.getTileAt(x, y - 1)?.index >= TILE.SLAB_START && layer0.getTileAt(x, y - 1)?.index >= TILE.SLAB_START;
          const slabChance = leftIsSlab || topIsSlab ? 0.2 : 0.01;
          
          // 2. Remplissage du layer 0
          const rand = Math.random();
          if (rand < slabChance) layer0.putTileAt(getRandom(TILE.SLAB_START, TILE.SLAB_END), x, y);
          else if (rand < flowerChance) layer0.putTileAt(getRandom(TILE.FLOWER_START, TILE.FLOWER_END), x, y);
          else layer0.putTileAt(getRandom(TILE.GRASS_START, TILE.GRASS_END), x, y);

          // 3. Remplissage du layer 1
          if (isLeft && isTop) layer1.putTileAt(TILE.TOP_LEFT, x, y);
          else if (isRight && isTop) layer1.putTileAt(TILE.TOP_RIGHT, x, y);
          else if (isLeft && isBottom) layer1.putTileAt(TILE.BOT_LEFT, x, y);
          else if (isRight && isBottom) layer1.putTileAt(TILE.BOT_RIGHT, x, y);
          else if (isTop) layer1.putTileAt(getRandom(TILE.TOP_START, TILE.TOP_END), x, y);
          else if (isBottom) layer1.putTileAt(getRandom(TILE.BOT_START, TILE.BOT_END), x, y);
          else if (isLeft) layer1.putTileAt(getRandom(TILE.LEFT_START, TILE.LEFT_END), x, y);
          else if (isRight) layer1.putTileAt(getRandom(TILE.RIGHT_START, TILE.RIGHT_END), x, y);
          else {
            if (rand > 0.98) layer1.putTileAt(getRandom(TILE.STONE_START, TILE.STONE_END), x, y);
            else if (rand > 0.85) layer1.putTileAt(getRandom(TILE.WEED_START, TILE.WEED_END), x, y);
            else continue;
          }
        }
      }
      layer0.setDepth(1);
      layer1.setDepth(2);

      // // GRID OVERLAY
      const gridOverlay = this.scene.add.tileSprite(
        startX + (room.state.grid.col * 16),
        startY + (room.state.grid.row * 16),
        room.state.grid.col * 32,
        room.state.grid.row * 32,
        'overlay'
      );
      gridOverlay.setDepth(2).setAlpha(0.8);

      // ROCK SPRITES
      for (const rock of room.state.grid.rocks) {
        const x = startX + rock.gridX * MAP_DATA.cellSize;
        const y = startY + rock.gridY * MAP_DATA.cellSize;
        // const rand = getRandom(1, 4);
        // const sprite = this.scene.add.sprite(x + 32, y + 20, `rock${rand}`).setDepth(3);
        // this.rockSprites.set(r.id, sprite);
        // this.scene.add.rectangle(
        //     x + 32,
        //     y + 32,
        //     64,
        //     64,
        //     0x777777
        //   ).setDepth(3);
        const sprite = this.scene.add.sprite(x + 32, y + 32, `rock`).setDepth(3);
        sprite.setOrigin(0.5, 0.5);
        this.rockSprites.set(rock.id, sprite);
        ySortGroup.add(sprite);
      }

      // --- AREAS ---
      for (const area of room.state.grid.areas) {
        const x = startX + area.gridX * MAP_DATA.cellSize;
        const y = startY + area.gridY * MAP_DATA.cellSize;

        let baseColor = getColorByAreaType(area.type);
        // const normalizedMultiplier = (area.multiplier - 100) / 100;
        // const normalizedMultiplier = area.multiplier - 100;
        // const areaShape = this.scene.add.circle(x, y, area.radius, baseColor, 0.15)
        const areaShape = this.scene.add.circle(x, y, area.radius)
        areaShape.setStrokeStyle(2, baseColor, 0.50)
        areaShape.setDepth(3);
        areaShape.setMask(this.mask);

        // const areaShape2 = this.scene.add.circle(x, y, area.radius)
        // areaShape2.setStrokeStyle(2, baseColor, 0.30)
        // areaShape2.setDepth(3);
        // areaShape2.setMask(this.mask);

        // const perimeter = 2 * Math.PI * area.radius;
        // const particleCount = Math.floor(perimeter / 1.5);
        // const circleZone = new Phaser.Geom.Circle(x, y, area.radius);
        // const emitter = this.scene.add.particles(0, 0, 'dot', {
        //   lifespan: 2500,
        //   speed: 10,
        //   radial: true,
        //   scale: { start: 0.12, end: 0 },
        //   alpha: { start: 0.8, end: 0 },
        //   frequency: 20,
        //   quantity: 1,
        //   tint: baseColor,
        //   blendMode: 'ADD',
        //   emitZone: {
        //       type: 'edge',
        //       source: circleZone,
        //       quantity: particleCount,
        //   },
        //   // emitCallback: (particle: any) => {
        //   //   const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

        //   //   particle.x = x + Math.cos(angle) * area.radius;
        //   //   particle.y = y + Math.sin(angle) * area.radius;

        //   //   // particle.velocityX = Math.cos(angle) * 30;
        //   //   // particle.velocityY = Math.sin(angle) * 30;
        //   //   particle.velocityX = 0;
        //   //   particle.velocityY = -10;
        //   // }
        // });
        // emitter.setDepth(3);
        // emitter.setMask(this.mask);

        // --- Affichage du pourcentage ---
        const text = (area.type === 'speed')
          ? Math.round((1 - (100 / (area.multiplier + 100))) * 100)
          : area.multiplier;
        const percentageText = this.scene.add.text(x, y, `${area.type === 'speed' ? '-' : '+'} ${text}%`, {
            fontFamily: 'Roboto',
            fontSize: '12px',
            fontStyle: 'bold',
            color: `#${baseColor.toString(16).padStart(6, '0')}`,
            // color: '#ffffff',
            // stroke: '#51361e',
            // stroke: '#000000',
            // stroke: `#${baseColor.toString(16).padStart(6, '0')}`,
            // strokeThickness: 3
        })
        .setOrigin(0.5) // Centre le texte
        .setDepth(8000); // Au-dessus du cercle

      }
    });
  }

  public createRockSprite(rock: RockState, offsetX: number, offsetY: number, landMargin: number, ySortGroup: Phaser.GameObjects.Group) {
    const sprite = this.scene.add.sprite(offsetX + (landMargin * 32), offsetY + (landMargin * 32), `rock`).setDepth(3);
    sprite.setOrigin(0.5, 0.5);
    this.rockSprites.set(rock.id, sprite);
    ySortGroup.add(sprite);
  }

  public updateRockSprite(rockId: string) {
    const sprite = this.rockSprites.get(rockId);
    if (sprite) {
      sprite.setAlpha(0.5);
      sprite.setTint(0xF8BBD0);
    }
  }

  public removeRockSprite(rockId: string) {
    const sprite = this.rockSprites.get(rockId);
    if (sprite) {
      sprite.destroy();
      this.rockSprites.delete(rockId);
    }
  }

  public destroy() {

  }
}
