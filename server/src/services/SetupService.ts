import { generateId, Room } from "colyseus";
import { ENEMIES_DATA } from "../datas/enemiesData";
import { MAP_DATA } from "../datas/mapData";
import { TOWERS_DATA } from "../datas/towersData";
import { UPGRADES_DATA } from "../datas/upgradesData";
import { WALLS_DATA } from "../datas/wallsData";
import { AreaState } from "../rooms/schema/AreaState";
import { CheckpointState } from "../rooms/schema/CheckpointState";
import { EnemyState } from "../rooms/schema/EnemyState";
import { GameState } from "../rooms/schema/GameState";
import { PlayerState } from "../rooms/schema/PlayerState";
import { RockState } from "../rooms/schema/RockState";
import { ShopState } from "../rooms/schema/ShopState";
import { TowerConfig } from "../rooms/schema/TowerConfig";
import { UpgradeConfig } from "../rooms/schema/UpgradeConfig";
import { UpgradeState } from "../rooms/schema/UpgradeState";
import { WallConfig } from "../rooms/schema/WallConfig";
import { WaveConfig } from "../rooms/schema/WaveConfig";
import { PathfindingService } from "./PathfindingService";
import { getRandom } from "./utils";

export class SetupService {
  private room: Room<GameState>;
    
  constructor(room: Room<GameState>) {
    this.room = room;
  }

  public setupGame(): void {
    this.generateGrid();
    this.generateRocks();
    this.generateCheckpoints();
    this.generateAreas();
    this.generateWaves();
    this.generateShop();
  }

  public setupPlayer(player: PlayerState): void {
    this.setupPlayerUpgrades(player);
    this.setupPlayerGrid(player);
  }

  private generateGrid(): void {
    this.room.state.grid.col = getRandom(MAP_DATA.minCol, MAP_DATA.maxCol);
    this.room.state.grid.row = getRandom(MAP_DATA.minRow, MAP_DATA.maxRow);
  }

  private generateRocks(): void {
    const totalCells = (this.room.state.grid.col * this.room.state.grid.row) / 4;
    const minRocks = Math.floor((totalCells * MAP_DATA.minRocks) / 100);
    const maxRocks = Math.floor((totalCells * MAP_DATA.maxRocks) / 100);
    const rockCount = getRandom(minRocks, maxRocks);
    const rocks: { x: number, y: number }[] = [];

    for (let i = 0; i < rockCount; i++) {
      let placed = false;

      for (let attempt = 0; attempt < 50 && !placed; attempt++) {
        const x = getRandom(0, this.room.state.grid.col - 2);
        const y = getRandom(0, this.room.state.grid.row - 2);

        let overlap = rocks.some(r => {
          return !(x + 2 <= r.x || r.x + 2 <= x || y + 2 <= r.y || r.y + 2 <= y);
        });

        if (!overlap) {
          rocks.push({ x, y });
          const rock = new RockState();
          rock.id = crypto.randomUUID();
          rock.gridX = x;
          rock.gridY = y;
          this.room.state.grid.rocks.push(rock);
          placed = true;
        }
      }
    }
  }

  // private generateCheckpoints(state: GameState) {
  //   const totalCells = (state.grid.col * state.grid.row) / 4;
  //   // const minChecks = Math.floor(totalCells / 50);
  //   // const maxChecks = Math.floor(totalCells / 400);
  //   const minChecks = 2;
  //   let maxChecks = Math.round(0.005 * totalCells + 3.5);
  //   maxChecks = Math.max(minChecks, maxChecks);
  //   const checkCount = getRandom(minChecks, maxChecks);
  //   const checkpoints: {x: number, y: number}[] = [];

  //   for (let i = 0; i < checkCount; i++) {
  //     let placed = false;

  //     for (let attempt = 0; attempt < 50 && !placed; attempt++) {
  //       const x = getRandom(0, state.grid.col - 2);
  //       const y = getRandom(0, state.grid.row - 2);

  //       let blocked = state.grid.rocks.some(r => {
  //         // return x >= r.gridX && x < r.gridX+2 && y >= r.gridY && y < r.gridY+2;
  //         return !(x+2 <= r.gridX || r.gridX+2 <= x || y+2 <= r.gridY || r.gridY+2 <= y);
  //       });

  //       let overlap = checkpoints.some(c => {
  //         return !(x+2 <= c.x || c.x+2 <= x || y+2 <= c.y || c.y+2 <= y);
  //       });

  //       if (!blocked && !overlap) {
  //         checkpoints.push({ x, y });
  //         let checkpoint = new CheckpointState();
  //         checkpoint.id = crypto.randomUUID();
  //         checkpoint.gridX = x;
  //         checkpoint.gridY = y;
  //         checkpoint.order = i;
  //         state.grid.checkpoints.push(checkpoint);
  //         placed = true;
  //       }
  //     }
  //   }
  // }

  private generateCheckpoints() {
    const pathfinding = new PathfindingService(this.room);
    const gridMap = pathfinding.buildStaticGrid();

    const totalCells = (this.room.state.grid.col * this.room.state.grid.row) / 4;
    const minChecks = 4;
    let maxChecks = Math.round(0.005 * totalCells + 3.5);
    maxChecks = Math.max(minChecks, maxChecks);

    const MAX_ATTEMPTS = 50;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      this.room.state.grid.checkpoints.clear();
      const checkpoints: { x: number; y: number }[] = [];
      const checkCount = getRandom(minChecks, maxChecks);

      for (let i = 0; i < checkCount; i++) {
        let placed = false;

        for (let tryPos = 0; tryPos < 50 && !placed; tryPos++) {
          const x = getRandom(0, this.room.state.grid.col - 2);
          const y = getRandom(0, this.room.state.grid.row - 2);

          const blocked = this.room.state.grid.rocks.some(r =>
            !(x + 2 <= r.gridX || r.gridX + 2 <= x || y + 2 <= r.gridY || r.gridY + 2 <= y)
          );

          const overlap = checkpoints.some(c =>
            !(x + 2 <= c.x || c.x + 2 <= x || y + 2 <= c.y || c.y + 2 <= y)
          );

          if (!blocked && !overlap) {
            checkpoints.push({ x, y });
            placed = true;
          }
        }
      }

      // ⚠️ Validation du path
      const orderedCheckpoints = checkpoints.map((c, i) => ({
        gridX: c.x,
        gridY: c.y,
        order: i
      }));

      if (pathfinding.validateCheckpointPath(gridMap, orderedCheckpoints)) {
        // ✅ Chemin valide → on commit
        orderedCheckpoints.forEach(cp => {
          const checkpoint = new CheckpointState();
          checkpoint.id = crypto.randomUUID();
          checkpoint.gridX = cp.gridX;
          checkpoint.gridY = cp.gridY;
          checkpoint.order = cp.order;
          this.room.state.grid.checkpoints.push(checkpoint);
        });

        return;
      }
    }

    throw new Error("Impossible de générer des checkpoints avec un chemin valide");
  }

  private generateAreas() {
    const totalCells = (this.room.state.grid.col * this.room.state.grid.row) / 4;
    // const minAreas = Math.floor(totalCells / 50);
    const minAreas = 8;
    // const maxAreas = Math.floor(totalCells / 300);
    const maxAreas = 12;
    const areaCount = getRandom(minAreas, maxAreas);

    for (let i = 0; i < areaCount; i++) {
      let area = new AreaState();
      area.id = crypto.randomUUID();
      area.gridX = getRandom(0, this.room.state.grid.col);
      area.gridY = getRandom(0, this.room.state.grid.row);
      area.radius = getRandom(MAP_DATA.minAreaRadius, MAP_DATA.maxAreaRadius);
      area.type = MAP_DATA.areaTypes[Math.floor(Math.random() * MAP_DATA.areaTypes.length)]
      if (area.type === 'speed') area.multiplier = getRandom(MAP_DATA.negativeAreaMultiplier, MAP_DATA.maxAreaMultiplier);
      else area.multiplier = getRandom(MAP_DATA.minAreaMultiplier, MAP_DATA.maxAreaMultiplier);
      this.room.state.grid.areas.push(area);
    }
  }

  private generateWaves() {
    for (let i = 0; i < MAP_DATA.waveCount; i++) {
      const randomEnemy = this.getRandomEnemy(ENEMIES_DATA);
      // const enemy = new EnemyState();
      // enemy.name = randomEnemy.name;
      // enemy.maxHp = randomEnemy.hp;
      // enemy.currentHp = randomEnemy.hp;
      // enemy.speed = randomEnemy.speed;
      // enemy.armor = randomEnemy.armor;
      // enemy.count = randomEnemy.count;

      const wave = new WaveConfig();
      wave.index = i;
      wave.enemyId = randomEnemy.id;

      this.room.state.waves.push(wave);
    }
  }

  private getRandomEnemy(enemies: Record<string, any>) {
    const keys = Object.keys(ENEMIES_DATA);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return enemies[randomKey];

    // const randomEnemy = ENEMIES_DATA[randomKey];
    // const randomIndex = Math.floor(Math.random() * enemies.length);
    // return enemies[randomIndex];
  }

  private generateShop() {
    const shop = new ShopState();

    for (let towerData of Object.values(TOWERS_DATA)) {
      const towerConfig = new TowerConfig();
      // const randomPrice = Math.floor(towerData.price * getRandom(MAP_DATA.minPriceMultiplier, MAP_DATA.maxPriceMultiplier));
      // const randomPrice = Math.floor(getRandom(towerData.price, towerData.price * MAP_DATA.maxPriceMultiplier));
      const randomPrice = Math.floor((towerData.price * getRandom(MAP_DATA.minPriceMultiplier, MAP_DATA.maxPriceMultiplier)) / 100);

      towerConfig.id = towerData.id;
      towerConfig.price = towerData.id === "basic" ? towerData.price : randomPrice;

      shop.towersConfig.set(towerConfig.id, towerConfig);
    }

    for (let upgradeData of Object.values(UPGRADES_DATA)) {
      const upgradeConfig = new UpgradeConfig();
      // const randomPrice = Math.floor(upgradeData.price * getRandom(MAP_DATA.minPriceMultiplier, MAP_DATA.maxPriceMultiplier));
      // const randomPrice = Math.floor(getRandom(upgradeData.price, upgradeData.price * MAP_DATA.maxPriceMultiplier));
      const randomPrice = Math.floor((upgradeData.price * getRandom(MAP_DATA.minPriceMultiplier, MAP_DATA.maxPriceMultiplier)) / 100);
      const randomUpgradeMultiplier = getRandom(MAP_DATA.minUpgradeMultiplier, MAP_DATA.maxUpgradeMultiplier);

      upgradeConfig.id = upgradeData.id;
      upgradeConfig.price = randomPrice;
      upgradeConfig.upgradeMultiplier = randomUpgradeMultiplier;

      shop.upgradesConfig.set(upgradeConfig.id, upgradeConfig);
    }

    for (let wallData of Object.values(WALLS_DATA)) {
      const wallConfig = new WallConfig();

      wallConfig.id = wallData.id;
      wallConfig.price = wallData.price;

      shop.wallsConfig.set(wallConfig.id, wallConfig);
    }
    this.room.state.shop = shop;
  }

  private setupPlayerUpgrades(player: PlayerState) {
    player.lives = MAP_DATA.baseLives;
    player.gold = MAP_DATA.baseGold;
    player.income = MAP_DATA.baseIncome;
    player.maxPopulation = MAP_DATA.baseMaxPopulation;
    for (let upgradeData of Object.values(UPGRADES_DATA)) {
      const upgradeConfig = this.room.state.shop.upgradesConfig.get(upgradeData.id);
      const upgrade = new UpgradeState();
      // upgrade.id = generateId();
      // upgrade.dataId = upgradeData.id
      upgrade.dataId = upgradeData.id
      upgrade.level = 1;
      upgrade.currentCost = upgradeConfig.price;
      upgrade.currentValue = upgradeData.baseValue;
      // upgrade.nextCost = Math.round(upgrade.currentCost * upgradeConfig.upgradeMultiplier);
      // upgrade.nextValue = Math.round(upgrade.currentValue + upgradeData.upgradeValue);
      upgrade.nextCost = upgrade.currentCost + Math.round(upgradeData.price * upgradeConfig.upgradeMultiplier / 100);
      // upgrade.nextCost = Math.round(upgrade.currentCost * upgradeConfig.upgradeMultiplier / 100);
      upgrade.nextValue = upgrade.currentValue + upgradeData.upgradeValue;
      player.upgrades.set(upgrade.dataId, upgrade);
    }
  }

  private setupPlayerGrid(player: PlayerState) {
    for (const rock of this.room.state.grid.rocks) {
      player.rocks.set(rock.id, new RockState({
        id: rock.id,
        gridX: rock.gridX,
        gridY: rock.gridY
      }));
    }
    for (const checkpoint of this.room.state.grid.checkpoints) {
      player.checkpoints.set(checkpoint.id, new CheckpointState({
        gridX: checkpoint.gridX,
        gridY: checkpoint.gridY,
        order: checkpoint.order
      }));
    }
    for (const area of this.room.state.grid.areas) {
      player.areas.set(area.id, new AreaState({
        gridX: area.gridX,
        gridY: area.gridY,
        radius: area.radius,
        type: area.type,
        multiplier: area.multiplier
      }));
    }
  }
}