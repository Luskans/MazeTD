import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";
import { TowerState } from "./schema/TowerState";
import { EnemyState } from "./schema/EnemyState";
import { PlayerState } from "./schema/PlayerState";
import { SetupService } from "../services/SetupService";
import { PathfindingService } from "../services/PathfindingService";

export class GameRoom extends Room<GameState> {
  private setupService: SetupService;
  private pathfindingService: PathfindingService;

  onCreate(options: any) {
    console.log(`🚀 Creation la game room ${this.roomId} !`);
    this.state = new GameState();
    this.setPrivate();

    this.setupService = new SetupService(); 
    this.setupService.setupGame(this.state);

    this.pathfindingService = new PathfindingService();

    this.onMessage("loaded", (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.hasLoaded = true;
      if (this._allPlayersLoaded()) {
        this.broadcast("begin");
      }
    });

    this.onMessage("place_building", (client: Client, data: { x: number, y: number, type: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      // 1. Vérification des ressources, de la validité de la position, etc.

      // 2. Validation du Pathfinding
      const towerSize = 1; // Supposons une taille 1x1 pour la tour
      const isValid = this.pathfindingService.validatePlacement(this.state, player, data.x, data.y, towerSize);

      if (isValid) {
        // 3. Placement et mise à jour du chemin
        
        // AJOUTEZ la TowerState au player.towers
        // ... (création et ajout de la tour) ...
        
        // Recalculer et STOCKER le nouveau chemin dans l'état Colyseus
        this.pathfindingService.calculateAndSetPath(this.state, player); 
        
        // (Le joueur reçoit automatiquement l'état mis à jour via Colyseus)
        
      } else {
        client.send("path_blocked", "You can't build here : path blocked.");
      }
    });

    this.onMessage("destroy_rock", (client: Client, data: { rockId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (player.rocks.has(data.rockId)) {
        player.rocks.delete(data.rockId); 
        this.pathfindingService.calculateAndSetPath(this.state, player); 
      }
    });

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

    this.setupService.setupPlayer(this.state, player);
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

  // Exemple de logique de simulation dans GameRoom
  private updateEnemies(deltaTime: number) {
    for (const player of this.state.players.values()) {
      const path = player.currentPath;
      if (path.length === 0) continue; // Pas de chemin défini

      for (const enemy of player.enemies.values()) {
        const targetNode = path[enemy.pathIndex];
        
        // Logique de mouvement : se déplacer de la position actuelle de l'ennemi
        // vers la coordonnée (targetNode.gridX, targetNode.gridY).

        // Si l'ennemi a atteint la cible :
        // if (distance(enemy.x, enemy.y, targetNode.gridX, targetNode.gridY) < threshold) {
        //     enemy.pathIndex++;
        //     if (enemy.pathIndex >= path.length) {
        //         // Ennemi a atteint la fin ! Infliger des dégâts et retirer l'ennemi.
        //     }
        // }
      }
    }
  }
}
