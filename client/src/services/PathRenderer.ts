import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";

export class PathRenderer {
  private scene: Phaser.Scene;
   private room: Room<GameState>;
  // private graphics: Phaser.GameObjects.Graphics;
  // private pulse!: Phaser.GameObjects.Arc;
  // private tween?: Phaser.Tweens.Tween;
  private paths: Map<string, { 
    graphics: Phaser.GameObjects.Graphics, 
    pulse: Phaser.GameObjects.Arc, 
    tween: Phaser.Tweens.Tween 
  }> = new Map();

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
    this.scene = scene;
    this.room = room;
    // this.graphics = scene.add.graphics().setDepth(10);
  }

  // drawPath(path: any[], offset: {x: number, y: number}, type: "current" | "pending") {
  //   // this.graphics.clear();
  //   const pathKey = `${this.room.sessionId}_${type}`;
  //   this.cleanupPath(pathKey);

  //   if (path.length < 2) return;

  //   if (type === "current") {
  //     this.graphics.lineStyle(3, 0x00ffff, 0.4); // Plus discret car ligne droite
  //   } else {
  //     this.graphics.lineStyle(3, 0xff00ff, 0.4); // Plus discret car ligne droite
  //   }
  //   this.graphics.beginPath();

  //   // Conversion des coordonnées une seule fois
  //   const points = path.map(node => ({
  //     x: offset.x + (node.gridX * 32) + 16, // +16 pour être au centre de la case
  //     y: offset.y + (node.gridY * 32) + 16
  //   }));

  //   this.graphics.moveTo(points[0].x, points[0].y);
  //   for (let i = 1; i < points.length; i++) {
  //     this.graphics.lineTo(points[i].x, points[i].y);
  //   }
  //   this.graphics.strokePath();

  //   this.createPulse(points);
  // }

  // private createPulse(points: {x: number, y: number}[]) {
  //   this.cleanup();

  //   const curve = new Phaser.Curves.Path(points[0].x, points[0].y);
  //   for (let i = 1; i < points.length; i++) {
  //     curve.lineTo(points[i].x, points[i].y);
  //   }

  //   this.pulse = this.scene.add.circle(0, 0, 4, 0x00ffff, 1).setDepth(11);
  //   const tempVec = new Phaser.Math.Vector2();

  //   this.tween = this.scene.tweens.addCounter({
  //     from: 0,
  //     to: 1,
  //     duration: 4000,
  //     repeat: -1,
  //     onUpdate: (t) => {
  //       const val = t.getValue() as number;
  //       curve.getPoint(val, tempVec);
  //       if (this.pulse.active) this.pulse.setPosition(tempVec.x, tempVec.y);
  //     }
  //   });
  // }

  // private cleanup() {
  //   if (this.tween) this.tween.stop();
  //   if (this.pulse) this.pulse.destroy();
  // }

  // destroy() {
  //   this.cleanup();
  //   this.graphics.destroy();
  // }

  drawPath(path: any[], offset: {x: number, y: number}, type: "current" | "pending") {
    const pathKey = `${this.room.sessionId}_${type}`;
    
    // Nettoyage de l'ancien tracé pour cette clé précise uniquement
    this.cleanupPath(pathKey);

    if (path.length < 2) return;

    // Création d'un nouveau graphics pour ce tracé
    const graphics = this.scene.add.graphics().setDepth(10);
    const color = type === "current" ? 0x00ffff : 0xff00ff;
    const alpha = type === "current" ? 0.4 : 0.6; // Un peu plus visible pour le pending

    graphics.lineStyle(3, color, alpha);
    graphics.beginPath();

    const points = path.map(node => ({
      x: offset.x + (node.gridX * 32) + 16,
      y: offset.y + (node.gridY * 32) + 16
    }));

    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.strokePath();

    // Création du pulse spécifique
    const pulseData = this.createPulse(points, color, pathKey);

    // Sauvegarde dans la Map
    this.paths.set(pathKey, {
      graphics,
      pulse: pulseData.pulse,
      tween: pulseData.tween
    });
  }

  private createPulse(points: {x: number, y: number}[], color: number, pathKey: string) {
    const curve = new Phaser.Curves.Path(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      curve.lineTo(points[i].x, points[i].y);
    }

    const pulse = this.scene.add.circle(0, 0, 4, color, 1).setDepth(11);
    const tempVec = new Phaser.Math.Vector2();

    const tween = this.scene.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 4000,
      repeat: -1,
      onUpdate: (t) => {
        const val = t.getValue() as number;
        curve.getPoint(val, tempVec);
        if (pulse && pulse.active) pulse.setPosition(tempVec.x, tempVec.y);
      }
    });

    return { pulse, tween };
  }

  private cleanupPath(pathKey: string) {
    const existing = this.paths.get(pathKey);
    if (existing) {
      existing.graphics.destroy();
      existing.pulse.destroy();
      existing.tween.stop();
      this.paths.delete(pathKey);
    }
  }

  public destroy() {
    this.paths.forEach((_, key) => this.cleanupPath(key));
  }
}