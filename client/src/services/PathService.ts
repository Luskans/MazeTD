import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";

// export class PathRenderer {
//   private scene: Phaser.Scene;
//   private room: Room<GameState>;
//   private paths: Map<string, { 
//     graphics: Phaser.GameObjects.Graphics, 
//     pulse: Phaser.GameObjects.Arc, 
//     tween: Phaser.Tweens.Tween 
//   }> = new Map();

//   constructor(scene: Phaser.Scene, room: Room<GameState>) {
//     this.scene = scene;
//     this.room = room;
//   }

//   drawPath(path: any[], offset: {x: number, y: number}, type: "current" | "pending", sessionId: string) {
//     const pathKey = `${sessionId}_${type}`;
//     this.cleanupPath(pathKey);

//     if (path.length < 2) return;

//     // Création d'un nouveau graphics pour ce tracé
//     const graphics = this.scene.add.graphics().setDepth(10);
//     const color = 0xff00ff;
//     const alpha = 0.5;
//     // const color = type === "current" ? 0x00ffff : 0xff00ff;
//     // const alpha = type === "current" ? 0.4 : 0.6;

//     // graphics.lineStyle(3, color, alpha);
//     // graphics.beginPath();

//     const points = path.map(node => ({
//       x: offset.x + (node.gridX * 32) + 16,
//       y: offset.y + (node.gridY * 32) + 16
//     }));

//     // graphics.moveTo(points[0].x, points[0].y);
//     // for (let i = 1; i < points.length; i++) {
//     //   graphics.lineTo(points[i].x, points[i].y);
//     // }
//     // graphics.strokePath();

//     if (type === "current") {
//       graphics.lineStyle(3, color, alpha);
//       graphics.beginPath();
//       graphics.moveTo(points[0].x, points[0].y);
//       for (let i = 1; i < points.length; i++) {
//         graphics.lineTo(points[i].x, points[i].y);
//       }
//       graphics.strokePath();
//     } else {
//       this.drawDashedPath(graphics, points, color, alpha);
//     }

//     const pulseData = this.createPulse(points, color, pathKey);

//     this.paths.set(pathKey, {
//       graphics,
//       pulse: pulseData.pulse,
//       tween: pulseData.tween
//     });
//   }

//   private drawDashedPath(graphics: Phaser.GameObjects.Graphics, points: {x: number, y: number}[], color: number, alpha: number) {
//     const dashLength = 8;
//     const gapLength = 8;
//     graphics.lineStyle(2, color, alpha);

//     for (let i = 0; i < points.length - 1; i++) {
//       const start = points[i];
//       const end = points[i + 1];
      
//       const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
//       const angle = Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y);
      
//       let currentDist = 0;
//       while (currentDist < distance) {
//         const x1 = start.x + Math.cos(angle) * currentDist;
//         const y1 = start.y + Math.sin(angle) * currentDist;
        
//         const nextDist = Math.min(currentDist + dashLength, distance);
//         const x2 = start.x + Math.cos(angle) * nextDist;
//         const y2 = start.y + Math.sin(angle) * nextDist;
        
//         graphics.lineBetween(x1, y1, x2, y2);
//         currentDist += dashLength + gapLength;
//       }
//     }
//   }

//   private createPulse(points: {x: number, y: number}[], color: number, pathKey: string) {
//     const curve = new Phaser.Curves.Path(points[0].x, points[0].y);
//     for (let i = 1; i < points.length; i++) {
//       curve.lineTo(points[i].x, points[i].y);
//     }

//     const pulse = this.scene.add.circle(0, 0, 4, color, 1).setDepth(11);
//     const tempVec = new Phaser.Math.Vector2();

//     const tween = this.scene.tweens.addCounter({
//       from: 0,
//       to: 1,
//       duration: 4000,
//       repeat: -1,
//       onUpdate: (t) => {
//         const val = t.getValue() as number;
//         curve.getPoint(val, tempVec);
//         if (pulse && pulse.active) pulse.setPosition(tempVec.x, tempVec.y);
//       }
//     });

//     return { pulse, tween };
//   }

//   public cleanupPath(pathKey: string) {
//     const existing = this.paths.get(pathKey);
//     if (existing) {
//       existing.graphics.destroy();
//       existing.pulse.destroy();
//       existing.tween.stop();
//       this.paths.delete(pathKey);
//     }
//   }

//   public destroy() {
//     this.paths.forEach((_, key) => this.cleanupPath(key));
//   }
// }




export class PathService {
  private scene: Phaser.Scene;
  private room: Room<GameState>;
  private paths: Map<string, { 
    graphics: Phaser.GameObjects.Graphics, 
    particles: Phaser.GameObjects.Particles.ParticleEmitter, 
    tween: Phaser.Tweens.Tween 
  }> = new Map();

  constructor(scene: Phaser.Scene, room: Room<GameState>) {
    this.scene = scene;
    this.room = room;
  }

  drawPath(path: any[], offset: {x: number, y: number}, type: "current" | "pending", sessionId: string) {
    const pathKey = `${sessionId}_${type}`;
    this.cleanupPath(pathKey);
    if (path.length < 2) return;

    const graphics = this.scene.add.graphics().setDepth(10);
    // const color = type === "current" ? 0x00ffff : 0xff00ff;
    const color = 0x00ffff;
    const points = path.map(node => ({
      x: offset.x + (node.gridX * 32) + 16,
      y: offset.y + (node.gridY * 32) + 16
    }));

    let particles: Phaser.GameObjects.Particles.ParticleEmitter | undefined;
    let tween: Phaser.Tweens.Tween | undefined;

    // --- RENDU DU CHEMIN ---
    if (type === "current") {
      this.drawGlowPath(graphics, points, color);
      const waveData = this.createEnergyWave(points, color);
      particles = waveData.particles;
      tween = waveData.tween;
    } else {
      this.drawDashedPath(graphics, points, color);
    }

    this.paths.set(pathKey, {
      graphics,
      particles: particles as any, // On stocke même si undefined pour cleanupPath
      tween: tween as any
    });

    // --- EFFET DE PULSE ---
    // this.scene.tweens.add({
    //   targets: graphics,
    //   alpha: 0.2,
    //   duration: 1000,
    //   yoyo: true,
    //   repeat: -1
    // });

    // --- EFFET D'ONDE ---
    // if (type === "current") {
    //   const waveData = this.createEnergyWave(points, color);

    //   this.paths.set(pathKey, {
    //     graphics,
    //     particles: waveData.particles,
    //     tween: waveData.tween
    //   });
    // }
  }

  private drawDashedPath(graphics: Phaser.GameObjects.Graphics, points: {x: number, y: number}[], color: number) {
    const dashLength = 8;
    const gapLength = 8;
    graphics.lineStyle(2, 0xffffff, 1);

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      
      const distance = Phaser.Math.Distance.Between(start.x, start.y, end.x, end.y);
      const angle = Phaser.Math.Angle.Between(start.x, start.y, end.x, end.y);
      
      let currentDist = 0;
      while (currentDist < distance) {
        const x1 = start.x + Math.cos(angle) * currentDist;
        const y1 = start.y + Math.sin(angle) * currentDist;
        
        const nextDist = Math.min(currentDist + dashLength, distance);
        const x2 = start.x + Math.cos(angle) * nextDist;
        const y2 = start.y + Math.sin(angle) * nextDist;
        
        graphics.lineBetween(x1, y1, x2, y2);
        currentDist += dashLength + gapLength;
      }
    }
  }

  private drawGlowPath(graphics: Phaser.GameObjects.Graphics, points: any[], color: number) {
    const shadowColor = 0x000000;
    
    // 1. Ombre portée (pour détacher du sol)
    // graphics.lineStyle(12, shadowColor, 0.2);
    // this.tracePoints(graphics, points);

    // 2. Halo extérieur (très large et transparent)
    // graphics.lineStyle(8, color, 0.3);
    // this.tracePoints(graphics, points);

    // 3. Halo moyen
    // graphics.lineStyle(6, color, 0.1);
    // this.tracePoints(graphics, points);

    // 4. Ligne centrale (coeur du néon, plus claire)
    graphics.lineStyle(2, 0xffffff, 1); // Blanc au centre pour le look "laser"
    this.tracePoints(graphics, points);
  }

  private tracePoints(graphics: Phaser.GameObjects.Graphics, points: any[]) {
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.strokePath();
  }

  private createEnergyWave(points: {x: number, y: number}[], color: number) {
    const colors = [0x00ffff, 0xff00ff];
    const curve = new Phaser.Curves.Path(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      curve.lineTo(points[i].x, points[i].y);
    }

    const pathLength = curve.getLength(); 
    const speedInPixelsPerSecond = 500;
    const dynamicDuration = (pathLength / speedInPixelsPerSecond) * 1000;

    const particles = this.scene.add.particles(0, 0, 'dot', {
      speed: 20,
      scale: { start: 0.13, end: 0 },
      alpha: { start: 1, end: 0 },
      // angle: { min: 70, max: 110 },
      lifespan: 2000,
      tint: colors,
      blendMode: 'ADD',
      frequency: 20,
      emitting: true,
    })
    particles.setDepth(3);

    const pathFollower = { t: 0 };
    const tempVec = new Phaser.Math.Vector2();

    const tween = this.scene.tweens.add({
      targets: pathFollower,
      t: 1,
      duration: dynamicDuration,
      repeat: -1,
      onUpdate: () => {
        curve.getPoint(pathFollower.t, tempVec);
        particles.particleX = tempVec.x;
        particles.particleY = tempVec.y;
      }
    });

    return { particles, tween };
  }

  public cleanupPath(pathKey: string) {
    const existing = this.paths.get(pathKey);
    if (existing) {
      if (existing.graphics) existing.graphics.destroy();
      if (existing.particles) existing.particles.destroy();
      if (existing.tween) existing.tween.stop();
      this.paths.delete(pathKey);
    }
  }
}