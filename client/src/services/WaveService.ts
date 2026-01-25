import { COLORS } from "../styles/theme";

export class WaveService {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public playShakeEffect() {
    const cam = this.scene.cameras.main;
    cam.shake(200, 0.005);
  }

  public playStartEffect(waveNumber: number) {
    if (!this.scene) return;

    const camera = this.scene.cameras.main;
    const centerX = camera.worldView.centerX;
    const topY = camera.worldView.y + (camera.worldView.height * 0.2);
    const width = camera.worldView.width;

    const bgHeight = 100;
    const background = this.scene.add.rectangle(0, 0, width + 200, bgHeight, 0x000000, 0.5);

    const text = this.scene.add.text(0, 0, `WAVE ${waveNumber} START`, {
      fontFamily: 'Roboto, Arial, sans-serif',
      fontSize: '36px',
      fontStyle: 'italic',
      color: COLORS.WHITE,
      // letterSpacing: 4
    }).setOrigin(0.5);

    const startX = camera.worldView.right + (width / 2);
    const container = this.scene.add.container(startX, topY, [background, text]).setDepth(10001);

    this.scene.tweens.chain({
      targets: container,
      tweens: [
        // Entrée depuis la droite vers le centre
        {
          x: centerX,
          duration: 600,
          ease: 'Cubic.easeOut'
        },
        // Petite pause au milieu (0.8 seconde)
        {
          x: centerX,
          duration: 800,
          delay: 500
        },
        // Sortie vers la gauche
        {
          x: camera.worldView.left - (width / 2),
          duration: 500,
          ease: 'Cubic.easeIn',
          onComplete: () => container.destroy()
        }
      ]
    });
  }
}