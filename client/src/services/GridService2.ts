import type { GameState } from "../../../server/src/rooms/schema/GameState";
import { MAP_DATA } from "../../../server/src/datas/mapData";
import type { Room } from "colyseus.js";
import { getRandom } from "../../../server/src/services/utils";
import { WaterPostPipeline } from "../shaders/WaterPostPipeline";
import type { RockState } from "../../../server/src/rooms/schema/RockState";
import { getColorByAreaType } from "./utils";
import type { CheckpointState } from "../../../server/src/rooms/schema/CheckpointState";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";

// const TILE1 = {
//   TOP_LEFT: 0, TOP: 1, TOP_RIGHT: 2,
//   LEFT: 21, CENTER: 22, RIGHT: 23,
//   BOT_LEFT: 42, BOT: 43, BOT_RIGHT: 44,
//   WALL_LEFT: 63, WALL_CENTER: 64, WALL_RIGHT: 65,
//   WALL_BOT_LEFT: 91, WALL_BOT: 92, WALL_BOT_RIGHT: 93
// };
const TILE1 = {
  TOP_LEFT: 0, TOP_START: 4, TOP_END: 6, TOP_RIGHT: 1,
  LEFT_START: 7, LEFT_END: 9, RIGHT_START: 10, RIGHT_END: 12,
  BOT_LEFT: 2, BOT_START: 13, BOT_END: 15, BOT_RIGHT: 3,
  WALL_LEFT: 16, WALL_RIGHT: 22,
  WALL_MID_START: 17, WALL_MID_END: 21,
  WALL_BOT_LEFT: 23, WALL_BOT_RIGHT: 27,
  WALL_BOT_START: 24, WALL_BOT_END: 26,
  GRASS_START: 30, GRASS_END: 69
};

const TILE2 = {
  LEAF_START: 0, LEAF_END: 2,
  FLOWER_START: 4, FLOWER_END: 14,
  GRASS_START: 15, GRASS_END: 19,
  DIRT_START: 20, DIRT_END: 26,
  STONE_START: 27, STONE_END: 29,
  CLOD_START: 30, CLOD_END: 32,
  VINE1: 60, VINE2_TOP: 40, VINE2_BOT: 50,
  VINE3_TOP: 41, VINE3_MID: 51, VINE3_BOT: 61,
  VINE4_TOP: 35, VINE4_MID1: 45, VINE4_MID2: 55, VINE4_BOT: 65
}

export class GridService2 {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private rockSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private checkpointSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private mask!: Phaser.Display.Masks.GeometryMask;
  private animatedTiles: { tile: Phaser.Tilemaps.Tile, startId: number, frameOffset: number }[] = [];

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
    const islandWidth = gridPixelWidth + (4 * 32) + 2 * MAP_DATA.outsideSize;
    const islandHeight = gridPixelHeight + (6 * 32) + 2 * MAP_DATA.outsideSize;
    const worldWidth = activeCols * (islandWidth + MAP_DATA.spaceSize) + MAP_DATA.spaceSize;
    const worldHeight = activeRows * (islandHeight + MAP_DATA.spaceSize) + MAP_DATA.spaceSize;
    this.scene.add.tileSprite(0, 0, worldWidth, worldHeight, 'water').setOrigin(0, 0).setDepth(0);
  }

  public createPlayersGrid(room: Room<GameState>, ySortGroup: Phaser.GameObjects.Group) {
    const { width: gridW, height: gridH } = this.getGridPixelSize();
    const players = Array.from(room.state.players.values());

    players.forEach((player, index) => {
      const pos = this.computeGridPosition2x4(index, gridW, gridH);

      // On définit la taille de notre "île" (Grille + 2 cases de marge pour herbe/falaise)
      const landMargin = 1;
      const islandCols = room.state.grid.col + (landMargin * 4);
      const islandRows = room.state.grid.row + (landMargin * 6);

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

      const tileset_ground = map.addTilesetImage('tileset_ground', 'tileset_ground');
      const tileset_object = map.addTilesetImage('tileset_object', 'tileset_object');
      
      // 2. On positionne la tilemap pour que la grille logique tombe au bon endroit
      const startX = pos.x + MAP_DATA.outsideSize;
      const startY = pos.y + MAP_DATA.outsideSize;
      const islandStartX = pos.x + MAP_DATA.outsideSize - (2 * landMargin * 32);
      const islandStartY = pos.y + MAP_DATA.outsideSize - (2 * landMargin * 32);
      const layer0 = map.createBlankLayer(`player_layer0_${index}`, tileset_ground!, islandStartX, islandStartY);
      const layer1 = map.createBlankLayer(`player_layer1_${index}`, tileset_object!, startX, startY);
      if (!layer0 || !layer1) return;

      for (let x = 0; x < islandCols; x++) {
        for (let y = 0; y < islandRows; y++) {
          
          const isLeft = x === 0;
          const isRight = x === islandCols - 1;
          const isTop = y === 0;
          const isBottomGrass = y === islandRows - 3;
          const isMiddleWall = y === islandRows - 2;
          const isBottomWall = y === islandRows - 1;
          
          if (isLeft && isTop) layer0.putTileAt(TILE1.TOP_LEFT, x, y);
          else if (isRight && isTop) layer0.putTileAt(TILE1.TOP_RIGHT, x, y);
          else if (isLeft && isBottomGrass) layer0.putTileAt(TILE1.BOT_LEFT, x, y);
          else if (isRight && isBottomGrass) layer0.putTileAt(TILE1.BOT_RIGHT, x, y);
          else if (isLeft && isMiddleWall) layer0.putTileAt(TILE1.WALL_LEFT, x, y);
          else if (isRight && isMiddleWall) layer0.putTileAt(TILE1.WALL_RIGHT, x, y);
          else if (isLeft && isBottomWall) layer0.putTileAt(TILE1.WALL_BOT_LEFT, x, y);
          else if (isRight && isBottomWall) layer0.putTileAt(TILE1.WALL_BOT_RIGHT, x, y);
          else if (isTop) layer0.putTileAt(getRandom(TILE1.TOP_START, TILE1.TOP_END), x, y);
          else if (isLeft) layer0.putTileAt(getRandom(TILE1.LEFT_START, TILE1.LEFT_END), x, y);
          else if (isRight) layer0.putTileAt(getRandom(TILE1.RIGHT_START, TILE1.RIGHT_END), x, y);
          else if (isBottomGrass) layer0.putTileAt(getRandom(TILE1.BOT_START, TILE1.BOT_END), x, y);
          else if (isMiddleWall) layer0.putTileAt(getRandom(TILE1.WALL_MID_START, TILE1.WALL_MID_END), x, y);
          else if (isBottomWall) layer0.putTileAt(getRandom(TILE1.WALL_BOT_START, TILE1.WALL_BOT_END), x, y);
          else layer0.putTileAt(getRandom(70, 75), x, y);

          const leftTile = layer1.getTileAt(x - 1, y)?.index;
          const topTile = layer1.getTileAt(x, y - 1)?.index;

          const isNearFlower = (tile: any) => tile >= TILE2.FLOWER_START && tile <= TILE2.FLOWER_END;
          const rand = Math.random();
          let selectedTile = -1;

          if (rand < (isNearFlower(leftTile) || isNearFlower(topTile) ? 0.4 : 0.03)) layer1.putTileAt(getRandom(TILE2.FLOWER_START, TILE2.FLOWER_END), x, y);
          else continue;
          // else if (rand < 0.08) selectedTile = getRandom(TILE2.DIRT_START, TILE2.DIRT_END);
          // else if (rand < 0.12) selectedTile = getRandom(TILE2.STONE_START, TILE2.STONE_END);
          // else if (rand < 0.16) selectedTile = getRandom(TILE2.LEAF_START, TILE2.LEAF_END);
          // else if (rand < 0.22) selectedTile = -1; 
          // else selectedTile = getRandom(TILE2.GRASS_START, TILE2.GRASS_END);
          // if (selectedTile !== -1) layer1.putTileAt(selectedTile, x, y);
        }
      }
      layer0.setDepth(1);
      layer1.setDepth(2);

      // GRID OVERLAY
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
        const rand = getRandom(0, 3);
        // const sprite = this.scene.add.sprite(x + 32, y + 20, `rock${rand}`).setDepth(3);
        // this.rockSprites.set(r.id, sprite);
        // this.scene.add.rectangle(
        //     x + 32,
        //     y + 32,
        //     64,
        //     64,
        //     0x777777
        //   ).setDepth(3);
        const sprite = this.scene.add.sprite(x + 32, y + 32,  `rock${rand}`).setDepth(3);
        sprite.setOrigin(0.5, 0.66);
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
      
      // --- CHEKCPOINTS ---
      for (let i = 0; i < 9; i++) {
        this.scene.anims.create({
          key: `flag_anim_${i}`,
          frames: this.scene.anims.generateFrameNumbers('checkpoints', { 
            start: i * 6, 
            end: (i * 6) + 5 
          }),
          frameRate: 6,
          repeat: -1
        });
      }
      const checkpoints = room.state.grid.checkpoints;
      checkpoints.forEach((c: CheckpointState, index: number) => {
        const x = startX + c.gridX * MAP_DATA.cellSize;
        const y = startY + c.gridY * MAP_DATA.cellSize;
        
        const sprite = this.scene.add.sprite(x + 32, y + 32, 'checkpoint_sheet');
        sprite.setOrigin(0.5, 1); 
        // sprite.setDepth(3);
        this.checkpointSprites.set(`${(player as PlayerState).sessionId}_checkpoint_${index}`, sprite);
        ySortGroup.add(sprite);
        
        if (index === checkpoints.length - 1) {
          sprite.play({key: 'flag_anim_8', startFrame: Math.floor(Math.random() * 6)});
        } else {
          const animIndex = (index % 8); 
          sprite.play({key: `flag_anim_${animIndex}`, startFrame: Math.floor(Math.random() * 6)});
        }
      });
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
