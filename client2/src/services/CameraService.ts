import * as Phaser from 'phaser';

export class CameraService {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isReady: boolean = false;

  // Vitesse de déplacement de la caméra en pixels/seconde
  private cameraSpeed = 1500; 

  // Vitesse de zoom (facteur par frame)
  private zoomSpeed = 0.05; 
  
  // Zoom minimum et maximum
  private minZoom = 0.5;
  private maxZoom = 2.0;

  constructor(scene: Phaser.Scene) {
      this.scene = scene;
      this.cursors = scene.input.keyboard!.createCursorKeys();
      
      // Initialiser le contrôle de la molette de la souris pour le zoom
      scene.input.on('wheel', this.handleWheel, this);
      
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
}