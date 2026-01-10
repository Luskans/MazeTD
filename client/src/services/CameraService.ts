import type { Room } from 'colyseus.js';
import type { GameState } from '../../../server/src/rooms/schema/GameState';
import { MAP_DATA } from '../../../server/src/datas/mapData';

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
    this.scene.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
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