import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";

export class PathService2 {
  private scene: Phaser.Scene;
  private room: Room<GameState>;

  private paths: Map<string, {
    graphics: Phaser.GameObjects.Graphics;
    points: { x: number; y: number }[];
    color: number;
    type: "current" | "pending";
    animOffset: number;
  }> = new Map();

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
    this.scene = scene;
    this.room = room;

    this.scene.events.on('update', this.updateAnimations, this);
  }

  public drawPath(
    path: any[],
    offset: { x: number; y: number },
    type: "current" | "pending",
    sessionId: string
  ) {
    const pathKey = `${sessionId}_${type}`;
    if (path.length < 2) {
      this.cleanupPath(pathKey);
      return;
    }

    const points = path.map(node => ({
      x: offset.x + node.gridX * 32 + 16,
      y: offset.y + node.gridY * 32 + 16
    }));

    // CULLING CAMERA
    // const bounds = Phaser.Geom.Rectangle.FromPoints(points);
    // if (!Phaser.Geom.Rectangle.Overlaps(
    //   this.scene.cameras.main.worldView,
    //   bounds
    // )) {
    //   return;
    // }

    let entry = this.paths.get(pathKey);
    if (!entry) {
      entry = {
        graphics: this.scene.add.graphics().setDepth(10),
        points,
        color: 0xffffff,
        type,
        animOffset: 0
      };
      this.paths.set(pathKey, entry);
    } else {
      entry.points = points;
      entry.type = type;
    }

    this.redrawPath(entry);
  }

  public cleanupPath(pathKey: string) {
    const entry = this.paths.get(pathKey);
    if (!entry) return;

    entry.graphics.destroy();
    this.paths.delete(pathKey);
  }

  private updateAnimations(_: number, delta: number) {
    const speed = 0.04 * delta;

    for (const entry of this.paths.values()) {
      if (entry.type !== "current") continue;

      entry.animOffset += speed;
      this.redrawPath(entry);
    }
  }

  private redrawPath(entry: {
    graphics: Phaser.GameObjects.Graphics;
    points: { x: number; y: number }[];
    color: number;
    type: "current" | "pending";
    animOffset: number;
  }) {
    const g = entry.graphics;
    g.clear();
    g.lineStyle(2, entry.color, 0.8);

    if (entry.type === "current") {
      this.drawChevronPath(g, entry.points, entry.animOffset);
    } else {
      this.drawDashedPath(g, entry.points);
    }
  }

  private drawChevronPath(
    graphics: Phaser.GameObjects.Graphics,
    points: { x: number; y: number }[],
    offset: number
  ) {
    const spacing = 16;
    const size = 4;

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];

      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      for (let d = (offset % spacing); d < length; d += spacing) {
        const cx = start.x + Math.cos(angle) * d;
        const cy = start.y + Math.sin(angle) * d;

        const left = angle + Math.PI * 0.75;
        const right = angle - Math.PI * 0.75;

        graphics.lineBetween(
          cx, cy,
          cx + Math.cos(left) * size,
          cy + Math.sin(left) * size
        );

        graphics.lineBetween(
          cx, cy,
          cx + Math.cos(right) * size,
          cy + Math.sin(right) * size
        );
      }
    }
  }

  private drawDashedPath(
    graphics: Phaser.GameObjects.Graphics,
    points: { x: number; y: number }[]
  ) {
    const dash = 4;
    const gap = 8;

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];

      const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
      const angle = Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y);

      for (let d = 0; d < distance; d += dash + gap) {
        const x1 = start.x + Math.cos(angle) * d;
        const y1 = start.y + Math.sin(angle) * d;

        const d2 = Math.min(d + dash, distance);
        const x2 = start.x + Math.cos(angle) * d2;
        const y2 = start.y + Math.sin(angle) * d2;

        graphics.lineBetween(x1, y1, x2, y2);
      }
    }
  }
}
