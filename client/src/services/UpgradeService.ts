import type { Room } from "colyseus.js";
import type { TowerState } from "../../../server/src/rooms/schema/TowerState";
import type { WallState } from "../../../server/src/rooms/schema/WallState";
import { PathfindingService } from "../../../server/src/services/PathfindingService";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { RockState } from "../../../server/src/rooms/schema/RockState";
import { getPlayerOffset } from "./utils";
import { GridService3 } from "./GridService3";
import { COLORS } from "../styles/theme";

export class UpgradeService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private gridService: GridService3;

  private isPreparing = false;
  private upgradeDataId: string | null = null;
  private upgradeType: string | null = null;
  private gridRect: Phaser.GameObjects.Rectangle;
  private hoveredRockId: string | null = null;
  private highlightedSprite: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, room: Room<GameState>, gridService: GridService3) {
    this.scene = scene;
    this.room = room;
    this.gridService = gridService;

    this.gridRect = scene.add.rectangle(0, 0, 32, 32, 0x00ff00, 0.4);
    this.gridRect.setOrigin(0, 0).setDepth(4);
    this.gridRect.setVisible(false);

    // Écouteurs
    this.scene.game.events.on('choose_upgrade', this.startPreparation, this);
    this.scene.input.on('pointermove', this.updateHover, this);
    this.scene.input.on('pointerdown', this.tryDestroy, this);
    this.scene.input.keyboard?.on('keydown-ESC', this.cancelPreparation, this);
    this.scene.input.on('pointerdown', (p: any) => { if (p.rightButtonDown()) this.cancelPreparation(); });

    // this.scene.input.on('pointermove', this.updatePreview, this);
    // this.scene.input.on('pointerdown', this.placeBuilding, this);
    // this.scene.input.keyboard!.on('keydown-ESC', this.cancelPreparation, this);
    // this.scene.input.on('pointerdown', (p: any) => { if (p.rightButtonDown()) this.cancelPreparation(); });
  }

  // private startPreparation(event: any) {
  //   if (event.buildingId === "destroy") {
  //     this.previewDestroy();
  //   } else {
  //     this.room.send("buy_upgrade", {
  //       buildingId: event.buildingId,
  //       buildingType: event.buildingType
  //     });
  //   }
  // }

  private startPreparation(event: {dataId: string, type: string}) {
    if (event.dataId !== "destroy") {
      this.playBoughtEffect();
      this.room.send("buy_upgrade", {
        dataId: event.dataId,
        type: event.type
      });

    } else {
      this.isPreparing = true;
      this.upgradeDataId = event.dataId;
      this.upgradeType = event.type;
      this.scene.input.setDefaultCursor('url(assets/cursors/pickaxe.png) 9 9, auto');
      this.gridRect.setVisible(true);
    }
  }

  private updateHover(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing) return;

    const player = this.room.state.players.get(this.room.sessionId);
    if (!player) return;

    const playerOffset = getPlayerOffset(this.room, player.sessionId);
    const gridX = Math.floor((pointer.worldX - playerOffset.x) / 32);
    const gridY = Math.floor((pointer.worldY - playerOffset.y) / 32);

    this.gridRect.setPosition(gridX * 32 + playerOffset.x, gridY * 32 + playerOffset.y);

    let foundRock: RockState | null = null;
    for (const rock of player.rocks.values()) {
      if (gridX >= rock.gridX && gridX < rock.gridX + 2 && gridY >= rock.gridY && gridY < rock.gridY + 2) {
        if (!rock.destroyPending) foundRock = rock;
        break;
      }
    }
    this.gridRect.setFillStyle(foundRock ? COLORS.VALID :COLORS.INVALID, 0.4);

    if (!foundRock) {
      this.clearHighlight();
      return;
    }

    if (this.hoveredRockId === foundRock.id) return;

    this.clearHighlight();
    this.hoveredRockId = foundRock.id;
    const sprite = this.gridService.getRockSprite(foundRock.id);
    
    if (sprite) {
      this.highlightedSprite = sprite;
      sprite.postFX.clear();
      sprite.postFX.addGlow(COLORS.GLOW, 2);
    }
  }

  private tryDestroy(pointer: Phaser.Input.Pointer) {
    if (!this.isPreparing || pointer.rightButtonDown()) return;
    if (!this.hoveredRockId || !this.highlightedSprite) return;
    
    const player = this.room.state.players.get(this.room.sessionId);
    const rockState = player?.rocks.get(this.hoveredRockId);
    if (!rockState || rockState.destroyPending) return;

    this.playDestroyEffect(this.highlightedSprite);

    this.room.send("destroy_rock", {
      dataId: this.upgradeDataId,
      type: this.upgradeType,
      rockId: this.hoveredRockId
    });

    this.cancelPreparation();
  }

  private clearHighlight() {
    if (this.highlightedSprite) {
      this.highlightedSprite.postFX.clear();
      this.highlightedSprite = null;
    }
    this.hoveredRockId = null;
  }

  private cancelPreparation() {
    this.isPreparing = false;
    this.scene.input.setDefaultCursor('url(assets/cursors/pointer.png) 4 4, auto');
    this.gridRect.setVisible(false);
    this.clearHighlight();
  }

  public destroy() {
    this.scene.game.events.off('choose_upgrade', this.startPreparation, this);
    this.scene.input.off('pointermove', this.updateHover, this);
    this.scene.input.off('pointerdown', this.tryDestroy, this);
    this.scene.input.keyboard?.off('keydown-ESC', this.cancelPreparation, this);
  }

  private playDestroyEffect(sprite: Phaser.GameObjects.Sprite) {
    const x = sprite.x;
    const y = sprite.y;

    const particles = this.scene.add.particles(x, y, 'dot', {
      speed: { min: 160, max: 220 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      tint: COLORS.ROCK,
      gravityY: 200,
      frequency: -1,
    });

    particles.setDepth(sprite.depth + 1);
    particles.explode(20);

    this.scene.tweens.add({
      targets: sprite,
      x: x + 4,
      yoyo: true,
      duration: 50,
      repeat: 3,
      onComplete: () => {
        particles.destroy();
      }
    });
  }

  public playBoughtEffect() {
    if (!this.scene) return;
    const cam = this.scene.cameras.main;
    const { centerX, centerY, width, height } = cam.worldView;

    const flash = this.scene.add.rectangle(centerX, centerY, width, height, 0xffffff, 0.6)
      .setDepth(10002)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
      onComplete: () => flash.destroy()
    });

    // const graphics = this.scene.add.graphics();
    // const cam = this.scene.cameras.main;
    
    // graphics.lineStyle(10, 0xffffff, 1);
    // graphics.strokeRect(cam.worldView.x, cam.worldView.y, cam.worldView.width, cam.worldView.height);
    // graphics.setDepth(10005);
    // graphics.setAlpha(0);

    // this.scene.tweens.add({
    //     targets: graphics,
    //     alpha: 1,
    //     duration: 200,
    //     yoyo: true,
    //     repeat: 1,
    //     onComplete: () => graphics.destroy()
    // });

    const particles = this.scene.add.particles(centerX, cam.worldView.y, 'dot', {
      x: { min: -width/2, max: width/2 },
      y: 0,
      quantity: 4,
      lifespan: 2000,
      speedY: { min: 200, max: 400 },
      scale: { start: 0.5, end: 0 },
      tint: [COLORS.DAMAGE, COLORS.ATTACK_SPEED, COLORS.SPEED, COLORS.RANGE],
      gravityY: 200,
      emitting: false
    });

    particles.setDepth(10003);
    particles.explode(40);

    this.scene.time.delayedCall(2000, () => particles.destroy());
  }
}