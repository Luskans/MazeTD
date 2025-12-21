import { MAP_DATA } from "../../../server/src/constants/mapData";
import type { PathNodeState } from "../../../server/src/rooms/schema/PathNodeState";

// export class PathRenderer {
//   private scene: Phaser.Scene;
//   private graphics: Phaser.GameObjects.Graphics;
//   private pulse!: Phaser.GameObjects.Arc;
//   private tween?: Phaser.Tweens.Tween;

//   constructor(scene: Phaser.Scene) {
//     this.scene = scene;
//     this.graphics = scene.add.graphics().setDepth(10);
//   }

//   drawPath(path: PathNodeState[], offsetX: number, offsetY: number) {
//     this.graphics.clear();

//     if (path.length < 2) return;

//     // --- LIGNE ---
//     this.graphics.lineStyle(3, 0x00ffff, 0.8);
//     this.graphics.beginPath();

//     path.forEach((node, i) => {
//       // const x = offsetX + node.gridX * MAP_DATA.cellSize + MAP_DATA.cellSize / 2;
//       // const y = offsetY + node.gridY * MAP_DATA.cellSize + MAP_DATA.cellSize / 2;
//       const x = offsetX + node.gridX * MAP_DATA.cellSize;
//       const y = offsetY + node.gridY * MAP_DATA.cellSize;

//       if (i === 0) {
//         this.graphics.moveTo(x, y);
//       } else {
//         this.graphics.lineTo(x, y);
//       }
//     });

//     this.graphics.strokePath();

//     // --- IMPULSION ---
//     this.createPulse(path, offsetX, offsetY);
//   }

//   private createPulse(path: PathNodeState[], offsetX: number, offsetY: number) {
//     // Nettoyage
//     this.pulse?.destroy();
//     this.tween?.stop();

//     const phaserPath = new Phaser.Curves.Path();

//     path.forEach((node, i) => {
//       // const x = offsetX + node.gridX * MAP_DATA.cellSize + MAP_DATA.cellSize / 2;
//       // const y = offsetY + node.gridY * MAP_DATA.cellSize + MAP_DATA.cellSize / 2;
//       const x = offsetX + node.gridX * MAP_DATA.cellSize;
//       const y = offsetY + node.gridY * MAP_DATA.cellSize;

//       if (i === 0) phaserPath.moveTo(x, y);
//       else phaserPath.lineTo(x, y);
//     });

//     this.pulse = this.scene.add.circle(0, 0, 6, 0xffffff, 1).setDepth(11);

//     const tempVec = new Phaser.Math.Vector2();

//     this.tween = this.scene.tweens.addCounter({
//       from: 0,
//       to: 1,
//       duration: 3000,
//       repeat: -1,
//       onUpdate: tween => {
//         phaserPath.getPoint(tween.getValue() as number, tempVec);
//         this.pulse.setPosition(tempVec.x, tempVec.y);
//       }
//     });
//   }

//   destroy() {
//     this.graphics.destroy();
//     this.pulse?.destroy();
//     this.tween?.stop();
//   }
// }

export class PathRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private pulse!: Phaser.GameObjects.Arc;
  private tween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics().setDepth(10);
  }

  drawPath(path: any[], offsetX: number, offsetY: number) {
    this.graphics.clear();
    if (path.length < 2) return;

    this.graphics.lineStyle(3, 0x00ffff, 0.4); // Plus discret car ligne droite
    this.graphics.beginPath();

    // Conversion des coordonnées une seule fois
    const points = path.map(node => ({
      x: offsetX + (node.gridX * 32) + 16, // +16 pour être au centre de la case
      y: offsetY + (node.gridY * 32) + 16
    }));

    this.graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.graphics.lineTo(points[i].x, points[i].y);
    }
    this.graphics.strokePath();

    this.createPulse(points);
  }

  private createPulse(points: {x: number, y: number}[]) {
    this.cleanup();

    const curve = new Phaser.Curves.Path(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      curve.lineTo(points[i].x, points[i].y);
    }

    this.pulse = this.scene.add.circle(0, 0, 4, 0x00ffff, 1).setDepth(11);
    const tempVec = new Phaser.Math.Vector2();

    this.tween = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 4000,
      repeat: -1,
      onUpdate: (t) => {
        const val = t.getValue() as number;
        curve.getPoint(val, tempVec);
        if (this.pulse.active) this.pulse.setPosition(tempVec.x, tempVec.y);
      }
    });
  }

  private cleanup() {
    if (this.tween) this.tween.stop();
    if (this.pulse) this.pulse.destroy();
  }

  destroy() {
    this.cleanup();
    this.graphics.destroy();
  }
}