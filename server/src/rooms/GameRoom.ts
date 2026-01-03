import { Room, Client } from "colyseus";
import { GameState } from "./schema/GameState";
import { TowerState } from "./schema/TowerState";
import { EnemyState } from "./schema/EnemyState";
import { PlayerState } from "./schema/PlayerState";
import { SetupService } from "../services/SetupService";
import { PathfindingService } from "../services/PathfindingService";
import { BuildService } from "../services/BuildService";
import { Encoder } from "@colyseus/schema";
import { WaveService } from "../services/WaveService";
import { EnemyService } from "../services/EnemyService";
import { CombatService } from "../services/CombatService";
import { EventEmitter } from "stream";
import { TypedEventEmitter } from "../services/EventBus";

export class GameRoom extends Room<GameState> {
  private eventBus: TypedEventEmitter;
  private setupService: SetupService;
  private pathfindingService: PathfindingService;
  private buildService: BuildService;
  private waveService: WaveService;
  private enemyService: EnemyService;
  private combatService: CombatService;

  onCreate(options: any) {
    Encoder.BUFFER_SIZE = 48 * 1024; // 16 KB
    console.log(`🚀 Creation la game room ${this.roomId} !`);
    this.state = new GameState();
    this.eventBus = new EventEmitter();
    this.setupService = new SetupService(); 
    this.pathfindingService = new PathfindingService();
    this.buildService = new BuildService(this);
    this.enemyService = new EnemyService(this, this.eventBus);
    this.waveService = new WaveService(this, this.eventBus);
    this.combatService = new CombatService(this);

    this.setPrivate();
    this.setupService.setupGame(this.state);


    this.onMessage("loaded", (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.hasLoaded = true;

      if (this._allPlayersLoaded()) {
        this.broadcast("begin");
        this.waveService.startFirstWave();
      }
    });

    this.onMessage("place_building", (client: Client, data: { buildingId: string, x: number, y: number, buildingSize: number, buildingType: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const isDuringWave = this.state.wavePhase === "running";
      console.log(" la wave est en running ?", isDuringWave);

      // 0. Vérification de la population
      const isPopulationValid = this.buildService.validatePopulation(player);
      if (!isPopulationValid) {
        client.send("not_enough_population", "You have reach your max population.");
        return;
      }

      // 1. Vérification des ressources
      const paymentCost = this.buildService.validatePayment(this.state, player, data.buildingId, data.buildingType);
      if (paymentCost === null) {
        client.send("not_enough_gold", "You don't have enough gold.");
        return;
      }

      // 2. Validation du Pathfinding
      const isPathValid = this.pathfindingService.validatePlacement(this.state, player, data.x, data.y, data.buildingSize, isDuringWave);
      if (!isPathValid) {
        client.send("path_blocked", "You can't build here : path blocked.");
        return;
      }

      // 3. Placement et mise à jour du chemin
      if (data.buildingType == "tower") {
        this.buildService.createTower(player, data.x, data.y, data.buildingId, paymentCost, isDuringWave);

      } else if (data.buildingType == "wall") {
        this.buildService.createWall(player, data.x, data.y, data.buildingId, isDuringWave);
      }
      
      // 4. Recalculer et STOCKER le nouveau chemin dans l'état Colyseus
      this.pathfindingService.calculateAndSetPath(this.state, player, isDuringWave); 
      
      console.log(`Building placé par ${client.sessionId} nommé ${player.username} en ${data.x},${data.y}`);
    });

    this.onMessage("buy_upgrade", (client: Client, data: { buildingId: string, buildingType: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const paymentCost = this.buildService.validatePayment(this.state, player, data.buildingId, data.buildingType);
      if (paymentCost === null) {
        client.send("not_enough_gold", "You don't have enough gold.");
        return;
      }

      this.buildService.buyUpgrade(this.state, player, data.buildingId);
      console.log(`Upgrade achetée par ${client.sessionId} nommé ${player.username}.`);
    });

    this.onMessage("destroy_rock", (client: Client, data: { buildingId: string, buildingType: string, rockId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const isDuringWave = this.state.wavePhase === 'running';

      const paymentCost = this.buildService.validatePayment(this.state, player, data.buildingId, data.buildingType);
      if (paymentCost === null) {
        client.send("not_enough_gold", "You don't have enough gold.");
        return;
      }

      if (player.rocks.has(data.rockId)) {
        player.rocks.delete(data.rockId); 
        this.pathfindingService.calculateAndSetPath(this.state, player, isDuringWave); 
      }
      this.buildService.buyUpgrade(this.state, player, data.buildingId);
    });

    this.onMessage("grant_vision", (client: Client, data: { targetId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !data.targetId) return;

      player.viewers.set(data.targetId, true);
    });

    this.onMessage("remove_vision", (client: Client, data: { targetId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || !data.targetId) return;

      player.viewers.delete(data.targetId);
    });

    this.onMessage("player_ready", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (this.state.wavePhase === "running") return;
      player.isReady = true;

      // Vérifier si tous les joueurs sont prêts
      const allReady = Array.from(this.state.players.values()).every(p => p.isReady && !p.isDefeated && !p.isDisconnected);

      if (allReady && this.state.wavePhase === "countdown") {
        // this._startNextWave();
        this.waveService.startWave();
      }
    });

    this.setSimulationInterval((deltaTime: number) => {
        this.enemyService.update(deltaTime);
        // this.combatService.update(deltaTime);
        // this.waveService.update(deltaTime);
    }, 50);
  }

  onJoin(client: Client, options: any) {
    console.log(`🔌 Client ${client.sessionId} joining with options:`, options);
    const isDuringWave = this.state.wavePhase === "running";

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
    this.pathfindingService.calculateAndSetPath(this.state, player, isDuringWave);

    console.log(`✅ Player ${player.username} joined successfully`);
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
