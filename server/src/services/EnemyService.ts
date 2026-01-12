import { Room } from "colyseus";
import { GameState } from "../rooms/schema/GameState";
import { PathfindingService } from "./PathfindingService";
import { PlayerState } from "../rooms/schema/PlayerState";
import { EnemyState } from "../rooms/schema/EnemyState";
import { EnemyType } from "../types/enemiesType";
import { PathNodeState } from "../rooms/schema/PathNodeState";
import { TypedEventEmitter } from "./EventBus";

// export class EnemyService {
//   private room: Room<GameState>;
//   private eventBus: TypedEventEmitter;

//   constructor(room: Room<GameState>, eventBus: TypedEventEmitter) {
//     this.room = room;
//     this.eventBus = eventBus;
//     this.eventBus.on('ENEMY_SPAWNED', (player, enemyData) => {
//       this.spawnEnemy(player, enemyData);
//     });
//   }

//   spawnEnemy(player: PlayerState, enemyData: EnemyType) {
//     const enemy = new EnemyState();
//     enemy.id = crypto.randomUUID();
//     enemy.dataId = enemyData.id;
//     enemy.hp = enemyData.stats.hp;
//     enemy.maxHp = enemyData.stats.hp;
//     enemy.speed = enemyData.stats.speed;
//     enemy.pathIndex = 0;

//     const start = player.currentPath[0];
//     enemy.gridX = start.gridX;
//     enemy.gridY = start.gridY;

//     player.enemies.set(enemy.id, enemy);
//   }

//   // update(deltaTime: number) {
//   //   for (const player of this.room.state.players.values()) {
//   //     this.updateEnemiesForPlayer(player, deltaTime);
//   //   }
//   // }

//   // private updateEnemiesForPlayer(player: PlayerState, delta: number) {
//   //   const path = player.currentPath;

//   //   for (const enemy of player.enemies.values()) {
//   //     const node = path[enemy.pathIndex];
//   //     if (!node) continue;

//   //     // déplacement
//   //     enemy.gridX += (node.gridX - enemy.gridX) * enemy.speed * delta;
//   //     enemy.gridY += (node.gridY - enemy.gridY) * enemy.speed * delta;

//   //     if (this.reachedNode(enemy, node)) {
//   //       enemy.pathIndex++;

//   //       if (enemy.pathIndex >= path.length) {
//   //         this.onEnemyReachedEnd(player, enemy);
//   //       }
//   //     }
//   //   }
//   // }

//   update(deltaTime: number) {
//     const state = this.room.state;

//     for (const player of state.players.values()) {
//       const path = player.currentPath;
//       if (!path || path.length < 2) continue;

//       for (const enemy of player.enemies.values()) {
//         this.updateEnemy(enemy, path, player);
//       }
//     }
//   }

//   // private updateEnemy(enemy: EnemyState, path: PathNodeState[], player: PlayerState) {
//   //   const currentIndex = enemy.pathIndex;
//   //   const nextIndex = currentIndex + 1;

//   //   // Fin du path
//   //   if (nextIndex >= path.length) {
//   //     this.onEnemyReachedEnd(player, enemy);
//   //     return;
//   //   }

//   //   const speedPerTick = enemy.speed / 1000; // cases par ms
//   //   enemy.progress += speedPerTick * this.room.clock.deltaTime;

//   //   // Si on a atteint la prochaine case
//   //   if (enemy.progress >= 1) {
//   //     enemy.progress = 0;
//   //     enemy.pathIndex++;

//   //     enemy.gridX = path[enemy.pathIndex].gridX;
//   //     enemy.gridY = path[enemy.pathIndex].gridY;
//   //   }
//   // }
//   // private updateEnemy(enemy: EnemyState, path: PathNodeState[], player: PlayerState) {
//   //   const currentIndex = enemy.pathIndex;
//   //   const nextIndex = currentIndex + 1;

//   //   if (nextIndex >= path.length) {
//   //     this.onEnemyReachedEnd(player, enemy);
//   //     return;
//   //   }

//   //   const startNode = path[currentIndex];
//   //   const targetNode = path[nextIndex];

//   //   // 1. Calcul de la progression
//   //   const speedPerTick = enemy.speed / 1000; 
//   //   enemy.progress += speedPerTick * this.room.clock.deltaTime;

//   //   // 2. Mise à jour des coordonnées RÉELLES (Interpolation sur le serveur)
//   //   // On calcule où se trouve l'ennemi entre le point A et le point B
//   //   enemy.gridX = startNode.gridX + (targetNode.gridX - startNode.gridX) * enemy.progress;
//   //   enemy.gridY = startNode.gridY + (targetNode.gridY - startNode.gridY) * enemy.progress;

//   //   // 3. Changement de segment
//   //   if (enemy.progress >= 1) {
//   //     enemy.progress = 0;
//   //     enemy.pathIndex++;
//   //     // On force la position exacte sur le nœud pour éviter les décalages cumulés
//   //     enemy.gridX = path[enemy.pathIndex].gridX;
//   //     enemy.gridY = path[enemy.pathIndex].gridY;
//   //   }
//   // }
//   private updateEnemy(enemy: EnemyState, path: PathNodeState[], player: PlayerState) {
//     const targetNode = path[enemy.pathIndex + 1];
//     if (!targetNode) {
//       this.onEnemyReachedEnd(player, enemy);
//       return;
//     }

//     // 1. Calculer le vecteur vers la cible
//     const dx = targetNode.gridX - enemy.gridX;
//     const dy = targetNode.gridY - enemy.gridY;
//     const distance = Math.sqrt(dx * dx + dy * dy);

//     // 2. Déplacement à vitesse constante
//     const moveDist = (enemy.speed / 1000) * this.room.clock.deltaTime;

//     if (distance <= moveDist) {
//       // On a atteint (ou dépassé) le nœud, on passe au suivant
//       enemy.gridX = targetNode.gridX;
//       enemy.gridY = targetNode.gridY;
//       enemy.pathIndex++;
//     } else {
//       // On avance de façon linéaire vers la cible
//       enemy.gridX += (dx / distance) * moveDist;
//       enemy.gridY += (dy / distance) * moveDist;
//     }
//   }

//   private onEnemyReachedEnd(player: PlayerState, enemy: EnemyState) {
//     player.enemies.delete(enemy.id);
//     // player.lives--;
//     this.eventBus.emit('ENEMY_REMOVED');

//   }
// }














export class EnemyService {
  private room: Room<GameState>;
  private eventBus: any; // Remplacez par votre type TypedEventEmitter

  constructor(room: Room<GameState>, eventBus: any) {
    this.room = room;
    this.eventBus = eventBus;

    this.eventBus.on('ENEMY_SPAWNED', (player: PlayerState, enemyData: any) => {
      this.spawnEnemy(player, enemyData);
    });
  }

  spawnEnemy(player: PlayerState, enemyData: any) {
    const enemy = new EnemyState();
    enemy.id = crypto.randomUUID();
    enemy.dataId = enemyData.id;
    enemy.hp = enemyData.stats.hp;
    enemy.maxHp = enemyData.stats.hp;
    enemy.speed = enemyData.stats.speed; // ex: 2.5 (cases par seconde)
    enemy.pathIndex = 0;

    const path = player.currentPath;
    if (path && path.length > 0) {
      // On place l'ennemi exactement sur le premier nœud du chemin lissé
      enemy.gridX = path[0].gridX;
      enemy.gridY = path[0].gridY;
      player.enemies.set(enemy.id, enemy);
    }
  }

  update(deltaTime: number) {
    for (const player of this.room.state.players.values()) {
      const path = player.currentPath;
      if (!path || path.length < 2) continue;

      for (const enemy of player.enemies.values()) {
        this.updateEnemy(enemy, path, player, deltaTime);
      }
    }
  }

  private updateEnemy(enemy: EnemyState, path: PathNodeState[], player: PlayerState, deltaTime: number) {
    const nextIndex = enemy.pathIndex + 1;

    // 1. Vérifier si on est arrivé au bout du chemin
    if (nextIndex >= path.length) {
      this.onEnemyReachedEnd(player, enemy);
      return;
    }

    const targetNode = path[nextIndex];

    // 2. Calcul du vecteur de mouvement
    const dx = targetNode.gridX - enemy.gridX;
    const dy = targetNode.gridY - enemy.gridY;
    const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

    // 3. Calcul de la distance parcourue ce tick (Vitesse * Temps)
    // On divise par 1000 car deltaTime est souvent en millisecondes
    const moveDistance = (enemy.speed * deltaTime) / 1000;

    if (distanceToTarget <= moveDistance) {
      // On a atteint le nœud cible (ou on le dépasse)
      enemy.gridX = targetNode.gridX;
      enemy.gridY = targetNode.gridY;
      enemy.pathIndex++;

      // Recursion légère pour consommer le reste du mouvement vers le nœud suivant
      // Cela évite les micro-ralentissements aux virages
      const remainingDist = moveDistance - distanceToTarget;
      if (remainingDist > 0 && enemy.pathIndex + 1 < path.length) {
        this.updateEnemy(enemy, path, player, remainingDist * (1000 / enemy.speed));
      }
    } else {
      // On avance de façon rectiligne vers le prochain point du chemin lissé
      const vx = (dx / distanceToTarget) * moveDistance;
      const vy = (dy / distanceToTarget) * moveDistance;

      enemy.gridX += vx;
      enemy.gridY += vy;

      // 4. Calcul de l'angle (optionnel : utile pour le client si vous voulez une rotation précise)
      // On peut stocker l'angle dans le State pour que le client sache où regarder
      // enemy.angle = Math.atan2(vy, vx);
    }
  }

  private onEnemyReachedEnd(player: PlayerState, enemy: EnemyState) {
    player.enemies.delete(enemy.id);
    // player.lives -= 1; 
    this.eventBus.emit('ENEMY_REMOVED');
  }
}