import { Room } from "colyseus";
import { GameState } from "../rooms/schema/GameState";
import { PathfindingService } from "./PathfindingService";
import { PlayerState } from "../rooms/schema/PlayerState";
import { EnemyState } from "../rooms/schema/EnemyState";
import { EnemyType } from "../types/enemiesType";
import { PathNodeState } from "../rooms/schema/PathNodeState";
import { TypedEventEmitter } from "./EventBus";

export class EnemyService {
  private room: Room<GameState>;
  private eventBus: TypedEventEmitter;

  constructor(room: Room<GameState>, eventBus: TypedEventEmitter) {
    this.room = room;
    this.eventBus = eventBus;
    this.eventBus.on('ENEMY_SPAWNED', (player, enemyData) => {
      this.spawnEnemy(player, enemyData);
    });
  }

  spawnEnemy(player: PlayerState, enemyData: EnemyType) {
    const enemy = new EnemyState();
    enemy.id = crypto.randomUUID();
    enemy.dataId = enemyData.id;
    enemy.hp = enemyData.stats.hp;
    enemy.maxHp = enemyData.stats.hp;
    enemy.speed = enemyData.stats.speed;
    enemy.pathIndex = 0;

    const start = player.currentPath[0];
    enemy.gridX = start.gridX;
    enemy.gridY = start.gridY;

    player.enemies.set(enemy.id, enemy);
  }

  // update(deltaTime: number) {
  //   for (const player of this.room.state.players.values()) {
  //     this.updateEnemiesForPlayer(player, deltaTime);
  //   }
  // }

  // private updateEnemiesForPlayer(player: PlayerState, delta: number) {
  //   const path = player.currentPath;

  //   for (const enemy of player.enemies.values()) {
  //     const node = path[enemy.pathIndex];
  //     if (!node) continue;

  //     // déplacement
  //     enemy.gridX += (node.gridX - enemy.gridX) * enemy.speed * delta;
  //     enemy.gridY += (node.gridY - enemy.gridY) * enemy.speed * delta;

  //     if (this.reachedNode(enemy, node)) {
  //       enemy.pathIndex++;

  //       if (enemy.pathIndex >= path.length) {
  //         this.onEnemyReachedEnd(player, enemy);
  //       }
  //     }
  //   }
  // }

  update(deltaTime: number) {
    const state = this.room.state;

    for (const player of state.players.values()) {
      const path = player.currentPath;
      if (!path || path.length < 2) continue;

      for (const enemy of player.enemies.values()) {
        this.updateEnemy(enemy, path, player);
      }
    }
  }

  // private updateEnemy(enemy: EnemyState, path: PathNodeState[], player: PlayerState) {
  //   const currentIndex = enemy.pathIndex;
  //   const nextIndex = currentIndex + 1;

  //   // Fin du path
  //   if (nextIndex >= path.length) {
  //     this.onEnemyReachedEnd(player, enemy);
  //     return;
  //   }

  //   const speedPerTick = enemy.speed / 1000; // cases par ms
  //   enemy.progress += speedPerTick * this.room.clock.deltaTime;

  //   // Si on a atteint la prochaine case
  //   if (enemy.progress >= 1) {
  //     enemy.progress = 0;
  //     enemy.pathIndex++;

  //     enemy.gridX = path[enemy.pathIndex].gridX;
  //     enemy.gridY = path[enemy.pathIndex].gridY;
  //   }
  // }
  private updateEnemy(enemy: EnemyState, path: PathNodeState[], player: PlayerState) {
    const currentIndex = enemy.pathIndex;
    const nextIndex = currentIndex + 1;

    if (nextIndex >= path.length) {
      this.onEnemyReachedEnd(player, enemy);
      return;
    }

    const startNode = path[currentIndex];
    const targetNode = path[nextIndex];

    // 1. Calcul de la progression
    const speedPerTick = enemy.speed / 1000; 
    enemy.progress += speedPerTick * this.room.clock.deltaTime;

    // 2. Mise à jour des coordonnées RÉELLES (Interpolation sur le serveur)
    // On calcule où se trouve l'ennemi entre le point A et le point B
    enemy.gridX = startNode.gridX + (targetNode.gridX - startNode.gridX) * enemy.progress;
    enemy.gridY = startNode.gridY + (targetNode.gridY - startNode.gridY) * enemy.progress;

    // 3. Changement de segment
    if (enemy.progress >= 1) {
      enemy.progress = 0;
      enemy.pathIndex++;
      // On force la position exacte sur le nœud pour éviter les décalages cumulés
      enemy.gridX = path[enemy.pathIndex].gridX;
      enemy.gridY = path[enemy.pathIndex].gridY;
    }
  }

  private onEnemyReachedEnd(player: PlayerState, enemy: EnemyState) {
    player.enemies.delete(enemy.id);
    // player.lives--;
    this.eventBus.emit('ENEMY_REMOVED');

  }
}