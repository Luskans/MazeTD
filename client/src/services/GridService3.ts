import type { GameState } from "../../../server/src/rooms/schema/GameState";
import { MAP_DATA } from "../../../server/src/datas/mapData";
import type { Room } from "colyseus.js";
import { getRandom } from "../../../server/src/services/utils";
import { getColorByAreaType } from "./utils";
import type { CheckpointState } from "../../../server/src/rooms/schema/CheckpointState";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";

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

export class GridService3 {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private rockSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private checkpointSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private areaSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
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
    this.scene.add.tileSprite(0, 0, worldWidth, worldHeight, 'ocean').setOrigin(0, 0).setDepth(0);
  }

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

      const tileset = map.addTilesetImage('tileset', 'tileset');
      
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

      // GRID OVERLAY
      const gridOverlay = this.scene.add.tileSprite(
        startX + (room.state.grid.col * 16),
        startY + (room.state.grid.row * 16),
        room.state.grid.col * 32,
        room.state.grid.row * 32,
        'overlay'
      );
      gridOverlay.setDepth(1).setAlpha(0.8);

      // ROCK SPRITES
      for (const rock of room.state.grid.rocks) {
        const x = startX + rock.gridX * MAP_DATA.cellSize;
        const y = startY + rock.gridY * MAP_DATA.cellSize;
        const rand = getRandom(0, 3);
        const sprite = this.scene.add.sprite(x + 32, y + 32,  `rock${rand}`).setDepth(3);
        sprite.setOrigin(0.5, 0.66);
        this.rockSprites.set(rock.id, sprite);
        ySortGroup.add(sprite);
      }

      // --- CHEKCPOINTS ---
      // const checkpoints = room.state.grid.checkpoints;
      // checkpoints.forEach((c: CheckpointState, index: number) => {
      //   const x = startX + c.gridX * MAP_DATA.cellSize;
      //   const y = startY + c.gridY * MAP_DATA.cellSize;
        
      //   const sprite = this.scene.add.sprite(x + 32, y + 32, 'checkpoint');
      //   sprite.setOrigin(0.5, 0.5);
      //   sprite.setDepth(4); 
      // });

      for (let i = 0; i < 9; i++) {
        this.scene.anims.create({
          key: `checkpoint_anim_${i}`,
          frames: this.scene.anims.generateFrameNumbers('checkpoints', { 
            start: i * 6, 
            end: (i * 6) + 5 
          }),
          frameRate: 1,
          repeat: -1
        });
      }
      const checkpoints = room.state.grid.checkpoints;
      checkpoints.forEach((c: CheckpointState, index: number) => {
        const x = startX + c.gridX * MAP_DATA.cellSize;
        const y = startY + c.gridY * MAP_DATA.cellSize;
        
        const sprite = this.scene.add.sprite(x + 32, y + 32, 'checkpoints');
        sprite.setOrigin(0.5, 0.5); 
        sprite.setDepth(1);
        this.checkpointSprites.set(`${(player as PlayerState).sessionId}_checkpoint_${index}`, sprite);
        // ySortGroup.add(sprite);
        sprite.play({key: `checkpoint_anim_${index}`, startFrame: Math.floor(Math.random() * 6)});
        
        // if (index === checkpoints.length - 1) {
        //   sprite.play({key: 'checkpoint_anim_8', startFrame: Math.floor(Math.random() * 6)});
        // } else {
        //   const animIndex = (index % 8); 
        //   sprite.play({key: `checkpoint_anim_${animIndex}`, startFrame: Math.floor(Math.random() * 6)});
        // }
      });

      // --- AREAS ---
      for (let i = 0; i < 4; i++) {
        this.scene.anims.create({
          key: `area_anim_${i}`,
          frames: this.scene.anims.generateFrameNumbers('areas', { 
            start: i * 6, 
            end: (i * 6) + 5 
          }),
          frameRate: 6,
          repeat: -1
        });
      }
      for (const area of room.state.grid.areas) {
        const x = startX + area.gridX * MAP_DATA.cellSize;
        const y = startY + area.gridY * MAP_DATA.cellSize;
        const sprite = this.scene.add.sprite(x, y + 2, 'areas');
        sprite.setOrigin(0.5, 1); 
        // sprite.setDepth(3);
        this.areaSprites.set(`${(player as PlayerState).sessionId}_area_${index}`, sprite);
        ySortGroup.add(sprite);
        
        if (area.type === "speed") {
          sprite.play({key: 'area_anim_0', startFrame: Math.floor(Math.random() * 6)});
        } else if (area.type === "damage") {
          sprite.play({key: 'area_anim_1', startFrame: Math.floor(Math.random() * 6)});
        } else if (area.type === "attackSpeed") {
          sprite.play({key: 'area_anim_2', startFrame: Math.floor(Math.random() * 6)});
        } else if (area.type === "range") {
          sprite.play({key: 'area_anim_3', startFrame: Math.floor(Math.random() * 6)});
        }



        let baseColor = getColorByAreaType(area.type);
        // const normalizedMultiplier = (area.multiplier - 100) / 100;
        // const normalizedMultiplier = area.multiplier - 100;
        // const areaShape = this.scene.add.circle(x, y, area.radius, baseColor, 0.15)
        // const areaShape = this.scene.add.circle(x, y, area.radius)
        // areaShape.setStrokeStyle(2, baseColor, 0.50)
        // areaShape.setDepth(3);
        // areaShape.setMask(this.mask);
        // const glow = areaShape.postFX.addGlow(0xffff00, 4, 0);
        // const bloom = areaShape.postFX.addBloom(0xffff00, 4, 4);
        // const shine = areaShape.postFX.addShine(0.5, 5, 5, false);

        // const areaShape2 = this.scene.add.circle(x, y, area.radius)
        // areaShape2.setStrokeStyle(2, baseColor, 0.30)
        // areaShape2.setDepth(3);
        // areaShape2.setMask(this.mask);

        const perimeter = 2 * Math.PI * area.radius;
        const particleCount = Math.floor(perimeter / 1.5);
        console.log(`particles : ${5000 / (perimeter / 4)}`)
        const circleZone = new Phaser.Geom.Circle(x, y, area.radius);
        const emitter = this.scene.add.particles(0, 0, 'dot', {
          // lifespan: 2500,
          speed: { min: 5, max: 15 },
          radial: true,
          alpha: { start: 1, end: 0.5 },
          // alpha: { start: 0, pos: 0.2, value: 1, end: 0 },
          // alpha: {start: 1, end: 0, steps: 1, yoyo: true},
          // speed: { min: 10, max: 20 },
          // scale: { start: 0.4, end: 0 },
          scale: { start: 0.25, end: 0.10, random: true },
          // scale: { min: 0.1, max: 0.2 },
          lifespan: { min: 800, max: 1400 },
          // angle: { min: 260, max: 280 },
          angle: { min: 220, max: 320 },
          gravityY: -8,
          // accelerationY: 1,
          // alpha: 1,
          frequency: 1000 / (perimeter / 14),
          // frequency: 16,
          quantity: 3,
          tint: baseColor,
          // blendMode: 'ADD',
          emitZone: {
              type: 'edge',
              source: circleZone,
              // quantity: particleCount,
              quantity: 0,
              stepRate: 4,
              seamless: true,
              yoyo: false
          },
          // emitCallback: (particle: any) => {
          //   const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

          //   particle.x = x + Math.cos(angle) * area.radius;
          //   particle.y = y + Math.sin(angle) * area.radius;

          //   // particle.velocityX = Math.cos(angle) * 30;
          //   // particle.velocityY = Math.sin(angle) * 30;
          //   particle.velocityX = 0;
          //   particle.velocityY = -10;
          // }
        });
        emitter.setDepth(3);
        emitter.setMask(this.mask);

        // --- Affichage du pourcentage ---
        const text = (area.type === 'speed')
          ? Math.round((1 - (100 / (area.multiplier + 100))) * 100)
          : area.multiplier;
        const percentageText = this.scene.add.text(x, y - 36, `${area.type === 'speed' ? '-' : '+'} ${text}%`, {
            fontFamily: 'Roboto',
            fontSize: '24px',
            fontStyle: 'bold',
            // color: `#${baseColor.toString(16).padStart(6, '0')}`,
            color: '#ffffff',
            stroke: '#51361e',
            // stroke: '#000000',
            // stroke: `#${baseColor.toString(16).padStart(6, '0')}`,
            strokeThickness: 4
        })
        .setOrigin(0.5) // Centre le texte
        .setScale(0.5)
        .setDepth(8000); // Au-dessus du cercle

      }
      
    });
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
