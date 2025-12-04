import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";
import { TowerState } from "./schema/TowerState";
import { EnemyState } from "./schema/EnemyState";
import { PlayerState } from "./schema/PlayerState";

export class GameRoom extends Room<GameState> {

  onCreate(options: any) {
    console.log(`🚀 Dans la game room ${this.roomId}, les joueurs devraient se co à ca !`);
    this.state = new GameState();

    this.onMessage("loaded", (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      console.log("dans loaded du server, player : ", player)
      if (!player) return;

      player.hasLoaded = true;
      if (this._allPlayersLoaded()) {
        this.broadcast("begin");
      }
    });

    this.setPrivate();
  }

  onJoin(client: Client, options: any) {
    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.uid = options?.uid;
    player.username = options?.username;
    player.elo = options?.elo;
    player.hasLoaded = false;
    player.isDefeated = false;
    player.isDisconnected = false;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.hasLoaded = true;
      player.isDefeated = true;
      player.isDisconnected = true;
      this.broadcast("sys", `${player.username} has left the game.`);
    }
  }

  _allPlayersLoaded(): boolean {
    if (this.state.players.size === 0) return false;
    return Array.from(this.state.players.values()).every(p => p.hasLoaded === true);
  }
}
