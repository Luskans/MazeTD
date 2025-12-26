import Phaser from "phaser";

export interface TowerStates {
  ownerId: string;
  currentHp: number;
  maxHp: number;
  armor: number;
}

export class Tower extends Phaser.GameObjects.Container {
  sprite: Phaser.GameObjects.Sprite;
  label: Phaser.GameObjects.Text;
  stats: TowerStates;

  constructor(scene: Phaser.Scene, x: number, y: number, ownerName: string, ownerId: string) {
    super(scene, x, y);

    this.stats = {
      ownerId,
      currentHp: 100,
      maxHp: 100,
      armor: 10,
    };

    this.sprite = scene.add.sprite(0, 0, "tower").setOrigin(0.5).setScale(1.2);
    this.label = scene.add.text(0, -80, ownerName, {
      fontSize: "20px",
      fontFamily: "Arial",
      color: "#fff",
      stroke: "#000",
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add([this.sprite, this.label]);
    scene.add.existing(this);
  }

  takeDamage(amount: number) {
    const reduced = Math.max(1, amount - this.stats.armor);
    this.stats.currentHp = Math.max(0, this.stats.currentHp - reduced);
    console.log(`Tower ${this.stats.ownerId} HP: ${this.stats.currentHp}`);
  }

  heal(amount: number) {
    this.stats.currentHp = Math.min(this.stats.maxHp, this.stats.currentHp + amount);
  }
}
