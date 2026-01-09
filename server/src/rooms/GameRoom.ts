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
import { ShopService } from "../services/ShopService";
import { TowerService } from "../services/TowerService";
import { AreaService } from "../services/AreaService";
import { UpgradeService } from "../services/UpgradeService";

export class GameRoom extends Room<GameState> {
  private eventBus: TypedEventEmitter;
  private setupService: SetupService;
  private pathfindingService: PathfindingService;
  private shopService: ShopService;
  private buildService: BuildService;
  private waveService: WaveService;
  private towerService: TowerService;
  private enemyService: EnemyService;
  private areaService: AreaService;
  private upgradeService: UpgradeService;
  private combatService: CombatService;

  onCreate(options: any) {
    Encoder.BUFFER_SIZE = 48 * 1024; // 16 KB
    console.log(`🚀 Creation la game room ${this.roomId} !`);
    this.state = new GameState();
    this.eventBus = new EventEmitter();
    this.setupService = new SetupService(this);
    this.shopService = new ShopService(this); 
    this.pathfindingService = new PathfindingService(this);
    this.towerService = new TowerService(this);
    this.buildService = new BuildService(this);
    this.enemyService = new EnemyService(this, this.eventBus);
    this.waveService = new WaveService(this, this.eventBus);
    this.combatService = new CombatService(this);

    this.setPrivate();
    this.setupService.setupGame();


    this.onMessage("loaded", (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      player.hasLoaded = true;

      if (this._allPlayersLoaded()) {
        this.broadcast("begin");
        this.waveService.startFirstWave();
      }
    });

    this.onMessage("place_building", (client: Client, data: { dataId: string, x: number, y: number, size: number, type: 'tower' | 'wall' }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const isDuringWave = this.state.wavePhase === "running";

      // 0. Vérification de la population
      const isPopulationValid = this.shopService.checkMaxPopulation(player);
      if (!isPopulationValid) {
        client.send("error", "You have reached the max buildings you can construct.");
        return;
      }

      // 1. Vérification des ressources
      const paymentCost = this.shopService.checkShopPayment(player, data.dataId, data.type);
      if (paymentCost === null) {
        client.send("error", "You don't have enough gold.");
        return;
      }

      // 2. Vérification du Pathfinding
      const isPathValid = this.pathfindingService.validatePlacement(player, data.x, data.y, data.size, isDuringWave);
      if (!isPathValid) {
        client.send("error", "You can't build here : path blocked.");
        return;
      }

      // 3. Effectuer le paiement
      this.shopService.makeShopPayment(player, paymentCost);
      
      if (data.type === 'tower') {
        // 4. Création du building
        const tower = this.towerService.createTower(player, data.dataId, data.x, data.y, paymentCost, isDuringWave);
        
        // 5. Update les modificateurs des areas
        // this.areaService.applyAreasToTower(tower, this.state.grid.areas);
        
        // 6. Update les modificateurs des upgrades
        // this.upgradeService.applyUpgradesToTower(tower, player);
        
        // 7. Update les statistiques de la tower
        // this.towerService.updateTower(tower);
        
      } else {
        this.towerService.createWall(player, data.dataId, data.x, data.y, data.size, paymentCost, isDuringWave);
      }

      // 8. Update le chemin
      this.pathfindingService.calculateAndSetPath(player, isDuringWave);
    });
    // this.onMessage("place_building", (client: Client, data: { buildingId: string, x: number, y: number, buildingSize: number, buildingType: string }) => {
    //   const player = this.state.players.get(client.sessionId);
    //   if (!player) return;
    //   const isDuringWave = this.state.wavePhase === "running";

    //   // 0. Vérification de la population
    //   const isPopulationValid = this.buildService.validatePopulation(player);
    //   if (!isPopulationValid) {
    //     client.send("not_enough_population", "You have reach your max population.");
    //     return;
    //   }

    //   // 1. Vérification des ressources
    //   const paymentCost = this.buildService.validateShopPayment(this.state, player, data.buildingId, data.buildingType);
    //   if (paymentCost === null) {
    //     client.send("not_enough_gold", "You don't have enough gold.");
    //     return;
    //   }

    //   // 2. Validation du Pathfinding
    //   const isPathValid = this.pathfindingService.validatePlacement(this.state, player, data.x, data.y, data.buildingSize, isDuringWave);
    //   if (!isPathValid) {
    //     client.send("path_blocked", "You can't build here : path blocked.");
    //     return;
    //   }

    //   // 3. Placement et mise à jour du chemin
    //   if (data.buildingType == "tower") {
    //     this.buildService.createTower(player, data.x, data.y, data.buildingId, paymentCost, isDuringWave);

    //   } else if (data.buildingType == "wall") {
    //     this.buildService.createWall(player, data.x, data.y, data.buildingId, isDuringWave);
    //   }
      
    //   // 4. Recalculer et STOCKER le nouveau chemin dans l'état Colyseus
    //   this.pathfindingService.calculateAndSetPath(this.state, player, isDuringWave); 
      
    //   console.log(`Building placé par ${client.sessionId} nommé ${player.username} en ${data.x},${data.y}`);
    // });

    this.onMessage("buy_upgrade", (client: Client, data: { dataId: string, type: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const paymentCost = this.shopService.checkShopPayment(player, data.dataId, data.type);
      if (paymentCost === null) {
        client.send("error", "You don't have enough gold.");
        return;
      }

      this.shopService.makeShopPayment(player, paymentCost);
      const upgrade = this.shopService.levelupUpgrade(player, data.dataId);
      this.shopService.applyUpgrade(player, upgrade);
    });
    // this.onMessage("buy_upgrade", (client: Client, data: { buildingId: string, buildingType: string }) => {
    //   const player = this.state.players.get(client.sessionId);
    //   if (!player) return;

    //   const paymentCost = this.buildService.validateShopPayment(this.state, player, data.buildingId, data.buildingType);
    //   if (paymentCost === null) {
    //     client.send("not_enough_gold", "You don't have enough gold.");
    //     return;
    //   }

    //   this.buildService.buyUpgrade(this.state, player, data.buildingId);
    //   console.log(`Upgrade achetée par ${client.sessionId} nommé ${player.username}.`);
    // });

    this.onMessage("destroy_rock", (client: Client, data: { dataId: string, type: string, rockId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const isDuringWave = this.state.wavePhase === 'running';

      const paymentCost = this.shopService.checkShopPayment(player, data.dataId, data.type);
      if (paymentCost === null) {
        client.send("error", "You don't have enough gold.");
        return;
      }

      this.shopService.makeShopPayment(player, paymentCost);
      this.shopService.levelupUpgrade(player, data.dataId);

      if (isDuringWave) {
        const rock = player.rocks.get(data.rockId);
        if (rock) {
          rock.destroyPending = true;
        }
      } else {
        if (player.rocks.has(data.rockId)) {
          player.rocks.delete(data.rockId); 
        }
      }
      this.pathfindingService.calculateAndSetPath(player, isDuringWave); 
    });
    // this.onMessage("destroy_rock", (client: Client, data: { buildingId: string, buildingType: string, rockId: string }) => {
    //   const player = this.state.players.get(client.sessionId);
    //   if (!player) return;
    //   const isDuringWave = this.state.wavePhase === 'running';

    //   const paymentCost = this.buildService.validateShopPayment(this.state, player, data.buildingId, data.buildingType);
    //   if (paymentCost === null) {
    //     client.send("not_enough_gold", "You don't have enough gold.");
    //     return;
    //   }

    //   this.buildService.buyUpgrade(this.state, player, data.buildingId);

    //   if (isDuringWave) {
    //     const rock = player.rocks.get(data.rockId);
    //     if (rock) {
    //       rock.destroyPending = true;
    //     }
    //   } else {
    //     if (player.rocks.has(data.rockId)) {
    //       player.rocks.delete(data.rockId); 
    //     }
    //   }
    //   this.pathfindingService.calculateAndSetPath(this.state, player, isDuringWave); 
    // });

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

    this.onMessage("player_ready", (client: Client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      if (this.state.wavePhase === "running") return;
      player.isReady = true;

      const allReady = Array.from(this.state.players.values()).every(p => p.isReady && !p.isDefeated && !p.isDisconnected);
      if (allReady && this.state.wavePhase === "countdown") {
        this.waveService.startWave();
      }
    });

    this.onMessage("levelup_building", (client: Client, data: { buildingId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;

      const paymentCost = this.towerService.checkLevelupPayment(player, data.buildingId);
      if (paymentCost === null) {
        client.send("error", "You don't have enough gold.");
        return;
      }
      this.towerService.makeLevelupPayment(player, paymentCost);
      const tower = this.towerService.getTower(player, data.buildingId);
      this.towerService.levelupTower(player, paymentCost, tower);
      this.towerService.updateTower(tower);
    });
    // this.onMessage("levelup_building", (client: Client, data: { buildingId: string }) => {
    //   const player = this.state.players.get(client.sessionId);
    //   if (!player) return;

    //   const paymentCost = this.buildService.validateLevelUpPayment(this.state, player, data.buildingId);
    //   if (paymentCost === null) {
    //     client.send("not_enough_gold", "You don't have enough gold.");
    //     return;
    //   }
    // });

    this.onMessage("sell_building", (client: Client, data: { buildingId: string, buildingType: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const isDuringWave = this.state.wavePhase === 'running';

      const goldReceived = this.towerService.sellBuilding(player, data.buildingId, data.buildingType, isDuringWave);
      if (goldReceived === null) {
        client.send("error", "Error to sell the building.");
        return;
      }
      this.pathfindingService.calculateAndSetPath(player, isDuringWave); 
    });
    // this.onMessage("sell_building", (client: Client, data: { buildingId: string, buildingType: string }) => {
    //   const player = this.state.players.get(client.sessionId);
    //   if (!player) return;
    //   const isDuringWave = this.state.wavePhase === 'running';

    //   const paymentCost = this.buildService.validateSellPayment(this.state, player, data.buildingId, data.buildingType, isDuringWave);
    //   if (paymentCost === null) {
    //     client.send("error_sell_building", "Error to sell the building.");
    //     return;
    //   }
    //   this.pathfindingService.calculateAndSetPath(this.state, player, isDuringWave); 
    // });

    this.onMessage("rotate_building", (client: Client, data: { buildingId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      const isDuringWave = this.state.wavePhase === 'running';

      this.towerService.rotateTower(player, data.buildingId, isDuringWave);
    });

    this.setSimulationInterval((deltaTime: number) => {
        this.enemyService.update(deltaTime);

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

    this.setupService.setupPlayer(player);
    this.pathfindingService.calculateAndSetPath(player, isDuringWave);

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
