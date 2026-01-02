import { Room } from "colyseus";
import { GameState } from "../rooms/schema/GameState";
import { PlayerState } from "../rooms/schema/PlayerState";
import { EnemyState } from "../rooms/schema/EnemyState";

export class CombatService {
  private room: Room<GameState>;

  constructor(room: Room<GameState>) {
    this.room = room;
  }

  update(delta: number) {
    for (const player of this.room.state.players.values()) {
      this.resolveCombat(player, delta);
    }
  }

  private resolveCombat(player: PlayerState, delta: number) {
    for (const tower of player.towers.values()) {
      const target = this.findTarget(tower, player.enemies);
      if (!target) continue;

      const damage = tower.damage * delta;
      target.hp -= damage;
      player.damage += damage;

      if (target.hp <= 0) {
        this.onEnemyKilled(player, target);
      }
    }
  }

  private onEnemyKilled(player: PlayerState, enemy: EnemyState) {
    player.kills++;
    player.enemies.delete(enemy.id);
  }

}