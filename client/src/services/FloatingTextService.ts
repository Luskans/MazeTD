import { COLORS } from "../styles/theme";

export class FloatingTextService {
  private static instance: FloatingTextService;
  private scene!: Phaser.Scene;

  private constructor() {}

  public static getInstance(): FloatingTextService {
    if (!FloatingTextService.instance) {
      FloatingTextService.instance = new FloatingTextService();
    }
    return FloatingTextService.instance;
  }

  public init(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public error(x: number, y: number, message: string) {
    if (!this.scene) return;

    const text = this.scene.add.text(x, y, message, {
      fontFamily: 'Roboto',
      fontSize: '28px',
      fontStyle: 'bold',
      color: COLORS.ERROR,
      stroke: COLORS.OUTLINE,
      strokeThickness: 4
    }).setOrigin(0.5).setScale(0.5).setDepth(10000);

    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      // alpha: 0.2,
      duration: 1200,
      ease: 'Cubic.out',
      onComplete: () => text.destroy()
    });
  }

  public success(x: number, y: number, action: string,  cost: string) {
    if (!this.scene) return;

    const text = this.scene.add.text(0, 0, action, {
      fontFamily: 'Roboto',
      fontSize: '28px',
      fontStyle: 'bold',
      color: COLORS.WHITE,
      stroke: COLORS.OUTLINE,
      strokeThickness: 4
    }).setOrigin(0.5).setScale(0.5);

    const price = (action === "Building sold") ? `+ ${cost}` : `- ${cost}`;
    const text2 = this.scene.add.text(-10, 16, price, {
      fontFamily: 'Roboto',
      fontSize: '28px',
      fontStyle: 'bold',
      color: (action === "Building sold") ? COLORS.SUCCESS : COLORS.ERROR,
      stroke: COLORS.OUTLINE,
      strokeThickness: 4
    }).setOrigin(0.5).setScale(0.5);

    const icon = this.scene.add.image(20, 16, 'income').setDisplaySize(18, 18).setOrigin(0.5, 0.5);

    const container = this.scene.add.container(x, y, [text, text2, icon]).setDepth(10000);

    this.scene.tweens.add({
      targets: container,
      y: y - 60,
      // alpha: 0.2,
      duration: 1200,
      ease: 'Cubic.out',
      onComplete: () => container.destroy()
    });
  }

  public info(from: string, message: string) {
    if (!this.scene) return;

    const camera = this.scene.cameras.main;
    const centerX = camera.worldView.centerX;
    const topY = camera.worldView.y + (camera.worldView.height * 0.2);
    const msg = `${from} ${message}`

    const text = this.scene.add.text(centerX, topY, msg, {
        fontFamily: 'Roboto',
        fontSize: '18px',
        fontStyle: 'bold',
        color: COLORS.WHITE,
        stroke: COLORS.OUTLINE,
        strokeThickness: 2
    }).setOrigin(0.5).setDepth(10000).setAlpha(0).setScale(0.5);

    this.scene.tweens.add({
        targets: text,
        alpha: 1,
        scale: 1,
        y: topY - 20,
        duration: 400,
        ease: 'Back.easeOut'
    });

    this.scene.tweens.add({
        targets: text,
        alpha: 0,
        y: topY - 60,
        delay: 2000 - 500,
        duration: 500,
        onComplete: () => text.destroy()
    });
  }
}