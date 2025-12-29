import type { SetupService } from './SetupService';
import type { Room } from 'colyseus.js';
import type { GameState } from '../../../server/src/rooms/schema/GameState';

export class CameraService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isReady: boolean = false;
  private setupService: SetupService;

  private cameraSpeed = 1500; 
  private zoomSpeed = 0.05; 
  private minZoom = 0.5;
  private maxZoom = 2.0;

  constructor(scene: Phaser.Scene, room: Room<GameState>, setupService: SetupService) {
    this.scene = scene;
    this.room = room;
    this.setupService = setupService;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    
    // Écouteurs
    scene.input.on('wheel', this.handleWheel, this);
    this.scene.game.events.on('focus_on_player', this.handleFocus, this);
    
    this.isReady = true;
  }

  /**
   * Gère le zoom via la molette de la souris.
   */
  private handleWheel(pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) {
    const camera = this.scene.cameras.main;
    
    // deltaY > 0 signifie zoom arrière, deltaY < 0 signifie zoom avant
    const zoomFactor = deltaY > 0 ? 1 / 1.1 : 1.1; 
    let newZoom = camera.zoom * zoomFactor;

    // Clamper le zoom dans les limites min/max
    newZoom = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
    camera.zoomTo(newZoom, 50); // Zoom doux en 50ms
  }

  /**
   * Doit être appelé dans la méthode update() de la scène.
   * Gère le déplacement de la caméra avec les touches directionnelles.
   */
  public update(time: number, delta: number): void {
    if (!this.isReady) return;

    const camera = this.scene.cameras.main;
    const speed = this.cameraSpeed * (delta / 1000); // Vitesse ajustée au delta time
    
    // Réinitialiser la vitesse de la caméra
    camera.scrollX += 0;
    camera.scrollY += 0;

    // Déplacement Horizontal
    if (this.cursors.left.isDown) {
      camera.scrollX -= speed;
    } else if (this.cursors.right.isDown) {
      camera.scrollX += speed;
    }

    // Déplacement Vertical
    if (this.cursors.up.isDown) {
      camera.scrollY -= speed;
    } else if (this.cursors.down.isDown) {
      camera.scrollY += speed;
    }
  }

  public handleFocus(playerIndex: number): void {
    const camera = this.scene.cameras.main;
    const playerOffset = this.setupService.getPlayerOffsets(playerIndex)
    const halfGridWidth = Math.round(this.room.state.grid.col * 16);
    const halfGridHeight = Math.round(this.room.state.grid.row * 16);
    const centerOffsetX = halfGridWidth + playerOffset.x;
    const centerOffsetY = halfGridHeight + playerOffset.y;
    camera.pan(centerOffsetX, centerOffsetY, 600, 'Cubic.easeInOut');
  }
}