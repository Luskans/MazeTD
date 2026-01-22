import type { Room } from "colyseus.js";
import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";
import { PathfindingService } from "../../../server/src/services/PathfindingService";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import { getColorByAreaType, getPlayerOffset } from "./utils";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import { TOWERS_DATA } from "../../../server/src/datas/towersData";

export class BuildingService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private pathfindingService: PathfindingService;
  private startClickPos = { x: 0, y: 0 };
  private buildingsSprites: Map<string, Phaser.GameObjects.Sprite> = new Map();
  private buildingsParticles: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  private shopBuildingDataId: string | null = null;
  private shopBuildingType: string | null = null;
  private shopBuildingSize: number | null = null;

  private isPreparing = false;
  private previewContainer: Phaser.GameObjects.Container;
  private ghostSprite: Phaser.GameObjects.Sprite;
  private ghostParticles: Phaser.GameObjects.Particles.ParticleEmitter;
  private gridRect: Phaser.GameObjects.Rectangle;

  private selectedSprite: Phaser.GameObjects.Sprite | null = null;
  private selectionGraphics: Phaser.GameObjects.Graphics;
  private selectedBuildingId: string | null = null;

  constructor(scene: Phaser.Scene, room: Room<GameState>, pathfindingService: PathfindingService) {
    this.scene = scene;
    this.room = room;
    this.pathfindingService = pathfindingService;

    this.previewContainer = scene.add.container(0, 0).setVisible(false).setDepth(8000);
    this.gridRect = scene.add.rectangle(0, 0, 64, 64, 0x00ff00, 0.4).setOrigin(0, 0);
    this.ghostSprite = scene.add.sprite(0, 0, "").setAlpha(0.6).setOrigin(0, 0);
    this.ghostParticles = scene.add.particles(0, 0, 'dot', {
      speed: { min: 10, max: 20 },
      lifespan: { min: 800, max: 1200 },
      angle: { min: 260, max: 280 },
      scale: { start: 0.25, end: 0 },
      alpha: 1,
      tint: [0xff0000, 0x00ff00],
      // tint: 0xffffff,
      // blendMode: 'ADD',
      frequency: 40,
      emitting: false,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 32),
        quantity: 1
      }
    }).setDepth(8001);
    this.previewContainer.add([this.gridRect, this.ghostSprite]);
    this.selectionGraphics = this.scene.add.graphics().setDepth(3);

    this.createAnimations('basic', 12);
    this.createAnimations('fire', 12);
    this.createAnimations('ice', 12);
    this.createAnimations('air', 12);
    this.createAnimations('nature', 12);
    this.createAnimations('earth', 12);
    this.createAnimations('water', 12);
    this.createAnimations('electric', 12);
    this.createAnimations('ghost', 12);
    this.createAnimations('arcane', 12);
    this.createAnimations('fairy', 12);
    this.createAnimations('light', 12);
    this.createAnimations('dark', 12);
    this.createAnimations('poison', 12);
    this.createAnimations('blood', 12);
    this.createAnimations('metal', 12);

    // Écouteurs
    this.scene.game.events.on('choose_tower', this.startPreparation, this);
    this.scene.game.events.on('choose_wall', this.startPreparation, this);
    this.scene.input.on('pointermove', this.updatePreview, this);
    this.scene.input.on('pointerdown', this.placeBuilding, this);
    this.scene.input.keyboard!.on('keydown-ESC', this.cancelPreparation, this);
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.startClickPos.x = pointer.x;
        this.startClickPos.y = pointer.y;
      }
    });
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonReleased()) {
        const distanceMoved = Phaser.Math.Distance.Between(
          this.startClickPos.x, this.startClickPos.y,
          pointer.x, pointer.y
        );
        if (distanceMoved < 10) {
          this.cancelPreparation();
          this.deselectBuilding();
        }
      }
    });
  }

  private createAnimations(dataId: string, frames: number) {
    const animKey = `${dataId}_anim`;
    if (!this.scene.anims.exists(animKey)) {
      this.scene.anims.create({
          key: animKey,
          frames: this.scene.anims.generateFrameNumbers(dataId, { start: 0, end: (frames - 1) }),
          frameRate: 16,
          repeat: -1
      });
    }
  }

  private startPreparation(event: {dataId: string, type: string, size: number}) {
    this.isPreparing = true;
    this.shopBuildingDataId = event.dataId;
    this.shopBuildingType = event.type;
    this.shopBuildingSize = event.size;

    this.gridRect.setSize(event.size * 32, event.size * 32);
    this.ghostSprite.setTexture(`${event.dataId}_icon`);
    this.ghostSprite.setOrigin(0.5, 0.75);
    this.ghostSprite.setPosition(event.size * 16, event.size * 16);
    this.ghostSprite.setScale(1);
    // this.ghostSprite.setSize(pixelSize, pixelSize);
    if (event.type === "tower") {
      this.ghostSprite.setScale(2);
      this.ghostSprite.setPosition(32, 16);
    }
    this.previewContainer.setVisible(true);
    this.scene.input.setDefaultCursor('url(assets/cursors/open.png) 6 8, auto');
  }

  private updatePreview(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing) return;
    const playerOffset = getPlayerOffset(this.room);

    const relativeX = pointer.worldX - playerOffset.x;
    const relativeY = pointer.worldY - playerOffset.y;

    const gridX = Math.floor(relativeX / 32);
    const gridY = Math.floor(relativeY / 32);

    this.previewContainer.x = (gridX * 32) + playerOffset.x;
    this.previewContainer.y = (gridY * 32) + playerOffset.y;

    const isValid = this.checkLocalValidity(gridX, gridY);
    this.gridRect.setFillStyle(isValid ? 0x00ff00 : 0xff0000, 0.4);


    if (this.shopBuildingType === 'wall') {
        this.ghostParticles.stop();
        return;
    }

    // Point de détection : centre de la base de la tour
    const centerX = this.previewContainer.x + (this.shopBuildingSize! * 16);
    const centerY = this.previewContainer.y + (this.shopBuildingSize! * 16);

    let activeAreasColor: number[] = [];
    for (const area of this.room.state.grid.areas) {
        if (area.type === 'speed') continue;
        const areaX = playerOffset.x + (area.gridX * 32);
        const areaY = playerOffset.y + (area.gridY * 32);
        if (Phaser.Math.Distance.Between(centerX, centerY, areaX, areaY) <= area.radius) {
            activeAreasColor.push(getColorByAreaType(area.type));
        }
    }

    if (activeAreasColor.length > 0) {
        this.ghostParticles.setPosition(centerX, centerY);
        // this.ghostParticles.setParticleTint(activeAreasColor);
        this.ghostParticles.updateConfig({tint: activeAreasColor});
        // this.ghostParticles.setParticleTint([0x00ff00, 0x0000ff]);
        if (!this.ghostParticles.emitting) this.ghostParticles.start();
    } else {
        this.ghostParticles.stop();
    }
  }

  private checkLocalValidity(gridX: number, gridY: number): boolean {
    const player = this.room.state.players.get(this.room.sessionId);
    const grid = this.room.state.grid;
    const gridSize = this.shopBuildingSize!;

    if (gridX < 0 || gridY < 0 ||
      gridX + gridSize > this.room.state.grid.col ||
      gridY + gridSize > this.room.state.grid.row) {
      return false;
    }

    const hasCollision = (otherX: number, otherY: number, otherSize: number) => {
      return !(gridX + gridSize <= otherX ||
        otherX + otherSize <= gridX ||
        gridY + gridSize <= otherY ||
        otherY + otherSize <= gridY);
    };

    const wouldFullyBlockCheckpoint = (buildingX: number, buildingY: number, buildingSize: number, checkpointX: number, checkpointY: number) => {
      let blockedCells = 0;

      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const cellX = checkpointX + dx;
          const cellY = checkpointY + dy;

          if (cellX >= buildingX && cellX < buildingX + buildingSize && cellY >= buildingY && cellY < buildingY + buildingSize) {
            blockedCells++;
          }
        }
      }

      return blockedCells === 4;
    }

    for (const rock of player.rocks.values()) {
      if (hasCollision(rock.gridX, rock.gridY, 2)) return false;
    }

    for (const tower of player.towers.values()) {
      if (hasCollision(tower.gridX, tower.gridY, 2)) return false;
    }

    for (const wall of player.walls.values()) {
      if (hasCollision(wall.gridX, wall.gridY, wall.size)) return false;
    }

    for (const checkpoint of grid.checkpoints.values()) {
      if (wouldFullyBlockCheckpoint(gridX,gridY,gridSize,checkpoint.gridX,checkpoint.gridY)) return false;
    }

    return true;
  }

  private placeBuilding(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing || pointer.rightButtonDown()) return;
    const playerOffset = getPlayerOffset(this.room)

    const player = this.room.state.players.get(this.room.sessionId);
    const gridX = Math.floor((pointer.worldX - playerOffset.x) / 32);
    const gridY = Math.floor((pointer.worldY - playerOffset.y) / 32);

    if (!this.checkLocalValidity(gridX, gridY)) return;

    const isDuringWave = this.room.state.wavePhase === 'running';
    const isPathPossible = this.pathfindingService.validatePlacement(player, gridX, gridY, this.shopBuildingSize as number, isDuringWave);

    if (!isPathPossible) {
      console.log('Construction impossible : chemin bloqué.')
      return;
    }

    this.room.send("place_building", {
      dataId: this.shopBuildingDataId,
      x: gridX,
      y: gridY,
      size: this.shopBuildingSize,
      type: this.shopBuildingType
    });
  }

  private cancelPreparation() {
    this.isPreparing = false;
    this.previewContainer.setVisible(false);
    this.ghostParticles.stop();
  }

  public getSelectedId() {
    return this.selectedBuildingId;
  }

  public getSprite(buildingId: string) {
    return this.buildingsSprites.get(buildingId);
  }

  public addBuildingSprite(buildingState: TowerState | WallState, type: "tower" | "wall", playerOffset: { x: number, y: number }, player: PlayerState, ySortGroup: Phaser.GameObjects.Group) {
    const x = (buildingState.gridX * 32) + playerOffset.x;
    const y = (buildingState.gridY * 32) + playerOffset.y;
    const buildingSize = (type === 'wall') ? (buildingState as WallState).size : 2;
    const texture = (type === 'wall') ? `${buildingState.dataId}_icon` : buildingState.dataId;
    const sprite = this.scene.add.sprite(x + (buildingSize * 16), y + (buildingSize * 16), texture)
    if (type === "tower") {
      const animKey = `${buildingState.dataId}_anim`;
      sprite.play(animKey);
    }
    sprite.setOrigin(0.5, 0.75);
    sprite.setData('ownerId', player.sessionId);
    // sprite.setInteractive();
    sprite.setInteractive({
      pixelPerfect: true,
      alphaTolerance: 1,
      cursor: 'url(assets/cursors/hand_point.png) 6 4, pointer'
    });
    // sprite.setDepth(3);
    // sprite.setScale(2);
    // sprite.on('pointerover', () => {
    //   if (sprite === this.selectedSprite) return;
    //   sprite.postFX.clear();
    //   sprite.postFX.addGlow(0xffffff, 2);
    // });
    // sprite.on('pointerout', () => {
    //   if (sprite === this.selectedSprite) return;
    //   sprite.postFX.clear();
    // });
    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer, event: Phaser.Types.Input.EventData) => {
      if (pointer.leftButtonDown()) {
        if (buildingState.sellingPending) return;
        this.selectBuilding(buildingState, player.sessionId, type, sprite);
      }
    });
    if (buildingState.placingPending) {
      sprite.setAlpha(0.6);
      sprite.setTint(0xFFF3A0);
    }
    this.buildingsSprites.set(buildingState.id, sprite);
    ySortGroup.add(sprite);



    // Si c'est une tour, on check si elle est née dans un buff
    if (type === "tower") {
      const centerX = sprite.x;
      const centerY = sprite.y;
      
      // On cherche l'area (identique à la logique du ghost)
      let activeAreasColor: number[] = [];
      for (const area of this.room.state.grid.areas) {
        if (area.type === 'speed') continue;
        const areaX = playerOffset.x + (area.gridX * 32);
        const areaY = playerOffset.y + (area.gridY * 32);
        if (Phaser.Math.Distance.Between(centerX, centerY, areaX, areaY) <= area.radius) {
          activeAreasColor.push(getColorByAreaType(area.type));
        }
      }
      if (activeAreasColor.length !== 0) {
        const emitter = this.createTowerParticles(centerX, centerY, activeAreasColor);
        this.buildingsParticles.set(buildingState.id, emitter);
      }
    }
  }

  private createTowerParticles(x: number, y: number, colors: number[]) {
    const emitter = this.scene.add.particles(x, y, 'dot', {
      speed: { min: 10, max: 20 },
      scale: { start: 0.25, end: 0 },
      angle: { min: 260, max: 280 },
      alpha: 1,
      lifespan: { min: 800, max: 1200 },
      tint: colors,
      frequency: 40,
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 32),
        quantity: 1
      }
    }).setDepth(8000); // Sous la tour (profondeur 3 dans ton code)
    return emitter;
  }

  public removeBuildingSprite(id: string) {
    const sprite = this.buildingsSprites.get(id);
    if (sprite) {
      this.buildingsSprites.delete(id);
      sprite.destroy();
    }
    const emitter = this.buildingsParticles.get(id);
    if (emitter) {
      emitter.destroy();
      this.buildingsParticles.delete(id);
    }
  }

  public updateBuildingSprite(id: string, action: "placing" | "selling") {
    const sprite = this.buildingsSprites.get(id);
    if (!sprite) return;
    if (action === "placing") {
      sprite.setAlpha(1);
      sprite.clearTint();
    } else if (action === "selling") {
      sprite.setAlpha(0.6);
      sprite.setTint(0xF8BBD0);
    }
  }

  // selectBuilding(buildingState: TowerState | WallState, ownerId: string, type: "tower" | "wall", sprite: Phaser.GameObjects.Sprite) {
  //   this.selectedBuildingId = buildingState.id;

  //   // Dessiner l'aura
  //   this.selectionGraphics.clear();
  //   this.selectionGraphics.lineStyle(2, 0x00ffff, 1);
  //   // const centerX = sprite.x + sprite.displayWidth / 2;
  //   // const centerY = sprite.y + sprite.displayHeight / 2;
  //   const centerX = sprite.x;
  //   const centerY = sprite.y;
  //   this.selectionGraphics.strokeCircle(centerX, centerY, sprite.displayWidth * 0.5);

  //   // Animation de pulsation
  //   this.scene.tweens.add({
  //     targets: this.selectionGraphics,
  //     alpha: 0.5,
  //     duration: 800,
  //     yoyo: true,
  //     repeat: -1
  //   });

  //   window.dispatchEvent(new CustomEvent('select-building', { 
  //     detail: { 
  //       isVisible: true,
  //       buildingId: buildingState.id,
  //       type: type,
  //       ownerId: ownerId
  //     } 
  //   }));
  // }
  public selectBuilding(buildingState: TowerState | WallState, ownerId: string, type: "tower" | "wall", sprite: Phaser.GameObjects.Sprite) {
    if (this.selectedSprite) {
      this.selectedSprite.postFX.clear();
    }
    // sprite.postFX.clear();
    this.selectionGraphics.clear();
    this.scene.tweens.killTweensOf(this.selectionGraphics);
    this.selectionGraphics.setAlpha(1);

    // const outline = sprite.postFX.addOutline(0xffffff, 2);
    // const outline = sprite.postFX.addBloom(0xffffff);
    
    
    this.selectedSprite = sprite;
    this.selectedSprite.postFX.addGlow(0xffffff, 2);
    this.selectedBuildingId = buildingState.id;
    const towerData = TOWERS_DATA[buildingState.dataId];
    const fillColor = 0xffffff;
    const fillAlpha = 0.2;
    const lineThickness = 2;

    const centerX = sprite.x;
    const centerY = sprite.y;
    // this.selectionGraphics.lineStyle(lineThickness, fillColor, 0.3);
    this.selectionGraphics.fillStyle(fillColor, fillAlpha);

    if (type === "tower" && towerData) {
      const range = (buildingState as TowerState).range;
      const baseAngle = ((buildingState as TowerState).direction) * (Math.PI / 2); // 0, 90, 180, 270 degrés
      const coneAngleRad = Phaser.Math.DegToRad(towerData.attack.angle || 90);

      switch (towerData.attack.mode) {
        case 'circle':
          this.selectionGraphics.fillCircle(centerX, centerY, range);
          // this.selectionGraphics.strokeCircle(centerX, centerY, range);
          break;

        case 'cone':
          const drawCone = (rotation: number) => {
            const start = rotation - (coneAngleRad / 2);
            const end = rotation + (coneAngleRad / 2);
            this.selectionGraphics.beginPath();
            this.selectionGraphics.moveTo(centerX, centerY);
            this.selectionGraphics.arc(centerX, centerY, range, start, end);
            this.selectionGraphics.closePath();
            this.selectionGraphics.fillPath();
            // this.selectionGraphics.strokePath();
          };

          drawCone(baseAngle);
          if (towerData.attack.dual) {
            drawCone(baseAngle + Math.PI); // Direction opposée (+180°)
          }
          break;

        // case 'line':
        //   const lineWidth = 64;
        //   const drawLine = (rotation: number) => {
        //     // On utilise la rotation du canvas pour dessiner des rectangles inclinés facilement
        //     this.selectionGraphics.save();
        //     this.selectionGraphics.translate(centerX, centerY);
        //     this.selectionGraphics.rotate(rotation);

        //     // On dessine le rectangle (x décalé de la moitié de la largeur, y commence à 0 vers le range)
        //     this.selectionGraphics.fillRect(-lineWidth / 2, 0, lineWidth, range);
        //     this.selectionGraphics.strokeRect(-lineWidth / 2, 0, lineWidth, range);

        //     this.selectionGraphics.restore();
        //   };

        //   drawLine(baseAngle);
        //   if (towerData.dual) drawLine(baseAngle + Math.PI);
        //   if (towerData.quad) {
        //     drawLine(baseAngle + Math.PI / 2);  // +90°
        //     drawLine(baseAngle - Math.PI / 2);  // -90°
        //   }
        //   break;
        case 'line':
          const lineWidth = 64;
          const drawLine = (rotation: number) => {
            // On calcule la direction du vecteur
            const vec = new Phaser.Math.Vector2().setToPolar(rotation, range);
            const perpVec = new Phaser.Math.Vector2().setToPolar(rotation + Math.PI / 2, lineWidth / 2);

            // Calcul des 4 coins du rectangle de la ligne
            const p1 = { x: centerX + perpVec.x, y: centerY + perpVec.y };
            const p2 = { x: centerX - perpVec.x, y: centerY - perpVec.y };
            const p3 = { x: p2.x + vec.x, y: p2.y + vec.y };
            const p4 = { x: p1.x + vec.x, y: p1.y + vec.y };

            this.selectionGraphics.fillPoints([p1, p2, p3, p4], true);
            // this.selectionGraphics.strokePoints([p1, p2, p3, p4], true);
          };

          drawLine(baseAngle);
          if (towerData.attack.dual) drawLine(baseAngle + Math.PI);
          if (towerData.attack.quad) {
            drawLine(baseAngle + Math.PI);
            drawLine(baseAngle + Math.PI / 2);
            drawLine(baseAngle - Math.PI / 2);
          }
          break;
      }

      // const colors = [0x00ffff, 0xff00ff];
      // this.rangeParticles = this.scene.add.particles(centerX, centerY, 'dot', {
      //   speed: { min: 10, max: 20 },
      //   scale: { start: 0.13, end: 0 },
      //   alpha: { start: 1, end: 0 },
      //   lifespan: 2500,
      //   tint: colors,
      //   frequency: 20,
      //   blendMode: 'ADD',
      //   emitZone: {
      //     // type: 'random',
      //     type: 'edge',
      //     source: new Phaser.Geom.Circle(0, 0, range),
      //     quantity: 100,
      //   }
      // }).setDepth(this.selectionGraphics.depth);

      this.scene.tweens.add({
        targets: this.selectionGraphics,
        alpha: 0.4,
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    }

    window.dispatchEvent(new CustomEvent('select-building', {
      detail: { isVisible: true, buildingId: buildingState.id, type: type, ownerId: ownerId }
    }));
  }

  public deselectBuilding() {
    if (!this.selectedBuildingId) return;
    this.selectedBuildingId = null;
    this.selectionGraphics.clear();
    this.scene.tweens.killTweensOf(this.selectionGraphics);
    this.selectionGraphics.alpha = 1;
    if (this.selectedSprite) {
      this.selectedSprite.postFX.clear();
    }
    this.selectedSprite = null;

    window.dispatchEvent(new CustomEvent('select-building', {
      detail: { isVisible: false }
    }));
  }

  public destroy() {
    this.scene.game.events.off('choose-tower');
    this.scene.game.events.off('choose-wall');
    this.scene.input.off('pointermove');
    this.scene.input.off('pointerdown');
    this.previewContainer.destroy();
  }
}