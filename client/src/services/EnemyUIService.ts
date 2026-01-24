// export class EnemyUIService {
//   private scene: Phaser.Scene;
//   private bars = new Map<string, Phaser.GameObjects.Container>();

import { COLORS } from "../styles/theme";

//   constructor(scene: Phaser.Scene) {
//     this.scene = scene;

//     scene.events.on('enemy_spawned', this.onSpawn, this);
//     scene.events.on('enemy_despawned', this.onDespawn, this);
//     scene.events.on('enemy_hp_changed', this.onHpChanged, this);
//   }

//   private onSpawn(data: {
//     id: string;
//     sprite: Phaser.GameObjects.Sprite;
//     maxHp: number;
//   }) {
//     const width = 26;
//     const height = 4;

//     const bg = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.6)
//       .setOrigin(0.5);

//     const bar = this.scene.add.rectangle(
//       -width / 2,
//       0,
//       width,
//       height,
//       0x00ff00
//     ).setOrigin(0, 0.5);

//     const container = this.scene.add.container(0, 0, [bg, bar]);
//     container.setDepth(9920);

//     container.setData('sprite', data.sprite);
//     container.setData('bar', bar);
//     container.setData('maxHp', data.maxHp);

//     this.bars.set(data.id, container);
//   }

//   private onHpChanged(data: {
//     id: string;
//     hp: number;
//   }) {
//     const container = this.bars.get(data.id);
//     if (!container) return;

//     const bar = container.getData('bar') as Phaser.GameObjects.Rectangle;
//     const maxHp = container.getData('maxHp');

//     bar.scaleX = Phaser.Math.Clamp(data.hp / maxHp, 0, 1);
//   }

//   private onDespawn(id: string) {
//     const bar = this.bars.get(id);
//     if (!bar) return;

//     bar.destroy();
//     this.bars.delete(id);
//   }

//   update() {
//     this.bars.forEach(container => {
//       const sprite = container.getData('sprite') as Phaser.GameObjects.Sprite;
//       container.setPosition(sprite.x, sprite.y - sprite.displayHeight * 0.75);
//     });
//   }
// }



export class EnemyUIService {
  private scene: Phaser.Scene;
  private bars = new Map<string, {
    container: Phaser.GameObjects.Container;
    graphics: Phaser.GameObjects.Graphics;
    maxHp: number;
    currentHp: number;
    sprite: Phaser.GameObjects.Sprite;
  }>();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    scene.events.on('enemy_spawned', this.onSpawn, this);
    scene.events.on('enemy_hp_changed', this.onHpChanged, this);
    scene.events.on('enemy_despawned', this.onDespawn, this);
  }

  private onSpawn(data: { id: string; sprite: Phaser.GameObjects.Sprite; maxHp: number; }) {
    const graphics = this.scene.add.graphics();
    const container = this.scene.add.container(0, 0, [graphics]);
    container.setDepth(data.sprite.depth + 1);

    this.bars.set(data.id, {
      container,
      graphics,
      maxHp: data.maxHp,
      currentHp: data.maxHp,
      sprite: data.sprite
    });

    this.redrawBar(data.id);
  }

  private onHpChanged(data: { id: string; hp: number; }) {
    const entry = this.bars.get(data.id);
    if (!entry) return;

    entry.currentHp = Phaser.Math.Clamp(data.hp, 0, entry.maxHp);
    this.redrawBar(data.id);
  }

  private redrawBar(id: string) {
    const entry = this.bars.get(id);
    if (!entry) return;

    const { graphics, currentHp, maxHp } = entry;

    const width = 28;
    const height = 6;
    const radius = 3;
    const padding = 1;

    const ratio = Phaser.Math.Clamp(currentHp / maxHp, 0, 1);

    graphics.clear();

    // --- BORDURE NOIRE ---
    graphics.fillStyle(COLORS.BAR_OUTLINE, 1);
    graphics.fillRoundedRect(
      -width / 2 - padding,
      -height / 2 - padding,
      width + padding * 2,
      height + padding * 2,
      radius + 1
    );

    // --- FOND ---
    graphics.fillStyle(COLORS.BAR_BACK, 0.8);
    graphics.fillRoundedRect(
      -width / 2,
      -height / 2,
      width,
      height,
      radius
    );

    // --- COULEUR SELON HP ---
    let startColor: number;
    let endColor: number;

    if (ratio <= 0.25) {
      startColor = COLORS.BAR_HIGH;
      endColor = COLORS.BAR_HIGH;
    } else if (ratio <= 0.5) {
      startColor = COLORS.BAR_MID;
      endColor = COLORS.BAR_MID;
    } else {
      startColor = COLORS.BAR_LOW;
      endColor = COLORS.BAR_LOW;
    }

    const barWidth = Math.max(0, (width - 2) * ratio);

    // --- DÉGRADÉ SIMULÉ (2 rectangles) ---
    graphics.fillStyle(startColor, 1);
    graphics.fillRoundedRect(
      -width / 2 + 1,
      -height / 2 + 1,
      barWidth,
      height - 2,
      radius - 1
    );

    graphics.fillStyle(endColor, 0.8);
    graphics.fillRect(
      -width / 2 + 1,
      -height / 2 + height / 2,
      barWidth,
      (height - 2) / 2
    );
  }

  public update() {
    this.bars.forEach(entry => {
      const { container, sprite } = entry;
      if (!sprite.active) return;

      container.setPosition(
        sprite.x,
        sprite.y - sprite.displayHeight * 0.9
      );
    });
  }

  private onDespawn(id: string) {
    const entry = this.bars.get(id);
    if (!entry) return;

    entry.container.destroy();
    this.bars.delete(id);
  }
}
