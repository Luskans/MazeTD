import type { Room } from 'colyseus.js';
import type { GameState } from '../../../server/src/rooms/schema/GameState';

export class CameraService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isReady: boolean = false;

  private cameraSpeed = 1500;
  private zoomSpeed = 0.05;
  private minZoom = 0.5;
  private maxZoom = 2.0;

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
    this.scene = scene;
    this.room = room;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.setupLimits();

    scene.input.on('wheel', this.handleWheel, this);
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        const camera = this.scene.cameras.main;
        camera.scrollX -= (pointer.x - pointer.prevPosition.x) / camera.zoom;
        camera.scrollY -= (pointer.y - pointer.prevPosition.y) / camera.zoom;
      }
    });

    this.isReady = true;
  }

  private setupLimits() {
    // On calcule la zone totale. Exemple si tes joueurs sont disposés sur l'axe X :
    const playerCount = this.room.state.players.size || 1;
    const gridPixelWidth = this.room.state.grid.col * 32;
    const gridPixelHeight = this.room.state.grid.row * 32;

    // Supposons que SetupService place les joueurs avec un espacement (offset)
    // Ici on définit une zone large qui englobe tout (à adapter selon ta disposition)
    const totalWidth = gridPixelWidth * playerCount * 2;
    const totalHeight = gridPixelHeight * 2;

    // On centre les limites autour de l'origine ou de tes offsets
    this.scene.cameras.main.setBounds(-1000, -1000, totalWidth + 2000, totalHeight + 2000);
  }

  private handleWheel(pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) {
    const camera = this.scene.cameras.main;

    // deltaY > 0 signifie zoom arrière, deltaY < 0 signifie zoom avant
    const zoomFactor = deltaY > 0 ? 1 / 1.1 : 1.1;
    let newZoom = camera.zoom * zoomFactor;

    newZoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
    camera.zoomTo(newZoom, 50);
  }

  public update(time: number, delta: number): void {
    if (!this.isReady) return;

    const camera = this.scene.cameras.main;
    const speed = this.cameraSpeed * (delta / 1000);

    camera.scrollX += 0;
    camera.scrollY += 0;

    if (this.cursors.left.isDown) {
      camera.scrollX -= speed;
    } else if (this.cursors.right.isDown) {
      camera.scrollX += speed;
    }

    if (this.cursors.up.isDown) {
      camera.scrollY -= speed;
    } else if (this.cursors.down.isDown) {
      camera.scrollY += speed;
    }
  }

  public handleFocus(playerOffset: { x: number, y: number }): void {
    const camera = this.scene.cameras.main;
    const halfGridWidth = Math.round(this.room.state.grid.col * 16);
    const halfGridHeight = Math.round(this.room.state.grid.row * 16);
    const centerOffsetX = halfGridWidth + playerOffset.x;
    const centerOffsetY = halfGridHeight + playerOffset.y;
    camera.pan(centerOffsetX, centerOffsetY, 600, 'Cubic.easeInOut');
  }
}