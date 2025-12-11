import { ENEMIES_DATA } from "../constants/enemiesData";
import { MAP_DATA } from "../constants/mapData";
import { TOWERS_DATA } from "../constants/towersData";
import { UPGRADES_DATA } from "../constants/upgradesData";
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
import { WaveState } from "../rooms/schema/WaveState";
import { getRandom, getRandomDecimal } from "./utils";

export class SetupService {

  public setupGame(state: GameState): void {
    this.generateGrid(state);
    this.generateRocks(state);
    this.generateCheckpoints(state);
    this.generateAreas(state);
    this.generateWaves(state);
    this.generateShop(state);
  }

  public setupPlayer(state: GameState, player: PlayerState): void {
    this.setupPlayerUpgrades(state, player);
    this.setupPlayerGrid(state, player);
  }

  private generateGrid(state: GameState): void {
    state.grid.col = getRandom(MAP_DATA.minCol, MAP_DATA.maxCol);
    state.grid.row = getRandom(MAP_DATA.minRow, MAP_DATA.maxRow);
  }

  private generateRocks(state: GameState): void {
    const totalCells = (state.grid.col * state.grid.row) / 4;
    const minRocks = Math.floor(totalCells * MAP_DATA.minRocks);
    const maxRocks = Math.floor(totalCells * MAP_DATA.maxRocks);
    const rockCount = getRandom(minRocks, maxRocks);
    const rocks: {x: number, y: number}[] = [];

    for (let i = 0; i < rockCount; i++) {
      let placed = false;

      for (let attempt = 0; attempt < 50 && !placed; attempt++) {
        const x = getRandom(0, state.grid.col - 2);
        const y = getRandom(0, state.grid.row - 2);

        let overlap = rocks.some(r => {
          return !(x+2 <= r.x || r.x+2 <= x || y+2 <= r.y || r.y+2 <= y);
        });

        if (!overlap) {
          rocks.push({ x, y });
          let rock = new RockState();
          rock.id = crypto.randomUUID();
          rock.gridX = x;
          rock.gridY = y;
          state.grid.rocks.push(rock);
          placed = true;
        }
      }
    }
  }

  private generateCheckpoints(state: GameState) {
    const totalCells = (state.grid.col * state.grid.row) / 4;
    // const minChecks = Math.floor(totalCells / 50);
    // const maxChecks = Math.floor(totalCells / 400);
    const minChecks = 2;
    let maxChecks = Math.round(0.005 * totalCells + 3.5);
    maxChecks = Math.max(minChecks, maxChecks);
    const checkCount = getRandom(minChecks, maxChecks);
    const checkpoints: {x: number, y: number}[] = [];

    for (let i = 0; i < checkCount; i++) {
      let placed = false;

      for (let attempt = 0; attempt < 50 && !placed; attempt++) {
        const x = getRandom(0, state.grid.col - 2);
        const y = getRandom(0, state.grid.row - 2);

        let blocked = state.grid.rocks.some(r => {
          // return x >= r.gridX && x < r.gridX+2 && y >= r.gridY && y < r.gridY+2;
          return !(x+2 <= r.gridX || r.gridX+2 <= x || y+2 <= r.gridY || r.gridY+2 <= y);
        });

        let overlap = checkpoints.some(c => {
          return !(x+2 <= c.x || c.x+2 <= x || y+2 <= c.y || c.y+2 <= y);
        });

        if (!blocked && !overlap) {
          checkpoints.push({ x, y });
          let checkpoint = new CheckpointState();
          checkpoint.id = crypto.randomUUID();
          checkpoint.gridX = x;
          checkpoint.gridY = y;
          checkpoint.order = i;
          state.grid.checkpoints.push(checkpoint);
          placed = true;
        }
      }
    }
  }

  private generateAreas(state: GameState) {
    const totalCells = (state.grid.col * state.grid.row) / 4;
    const minAreas = Math.floor(totalCells / 50);
    const maxAreas = Math.floor(totalCells / 300);
    const areaCount = getRandom(minAreas, maxAreas);

    for (let i = 0; i < areaCount; i++) {
      let area = new AreaState();
      area.id = crypto.randomUUID();
      area.gridX = getRandom(0, state.grid.col);
      area.gridY = getRandom(0, state.grid.row);
      area.radius = getRandom(MAP_DATA.minAreaRadius, MAP_DATA.maxAreaRadius);

      area.damageMultiplier = getRandom(MAP_DATA.minAreaMultiplier, MAP_DATA.maxAreaMultiplier);
      area.attackSpeedMultiplier = getRandom(MAP_DATA.minAreaMultiplier, MAP_DATA.maxAreaMultiplier);
      area.rangeMultiplier = getRandom(MAP_DATA.minAreaMultiplier, MAP_DATA.maxAreaMultiplier);
      area.speedMultiplier = getRandom((1/MAP_DATA.maxAreaMultiplier), MAP_DATA.maxAreaMultiplier);

      state.grid.areas.push(area);
    }
  }

  private generateWaves(state: GameState) {
    for (let i = 0; i < MAP_DATA.waveCount; i++) {
      const randomEnemy = this.getRandomEnemy(ENEMIES_DATA);
      // const enemy = new EnemyState();
      // enemy.name = randomEnemy.name;
      // enemy.maxHp = randomEnemy.hp;
      // enemy.currentHp = randomEnemy.hp;
      // enemy.speed = randomEnemy.speed;
      // enemy.armor = randomEnemy.armor;
      // enemy.count = randomEnemy.count;

      const wave = new WaveState();
      wave.index = i;
      wave.enemyId = randomEnemy.name;

      state.waves.push(wave);
    }
  }

  private getRandomEnemy(enemies: Array<any>) {
    const randomIndex = Math.floor(Math.random() * enemies.length);
    return enemies[randomIndex];
  }

  private generateShop(state: GameState) {
    const shop = new ShopState();
    
    for (let towerData of TOWERS_DATA) {
      let towerConfig = new TowerConfig();
      let randomPrice = Math.floor(towerData.price * getRandom(MAP_DATA.minPriceMultiplier, MAP_DATA.maxPriceMultiplier));
      
      towerConfig.id = towerData.name;
      towerConfig.price = towerData.name === "basic" ? towerData.price : randomPrice;
      
      shop.towersConfig.set(towerConfig.id, towerConfig);
      state.shop = shop;
    }

    for (let upgradeData of UPGRADES_DATA) {
      let upgradeConfig = new UpgradeConfig();
      let randomPrice = Math.floor(upgradeData.price * getRandom(MAP_DATA.minPriceMultiplier, MAP_DATA.maxPriceMultiplier));
      let randomUpgradeMultiplier = getRandomDecimal(MAP_DATA.minUpgradeMultiplier, MAP_DATA.maxUpgradeMultiplier);

      upgradeConfig.id = upgradeData.name;
      upgradeConfig.price = randomPrice;
      upgradeConfig.upgradeMultiplier = randomUpgradeMultiplier;
      
      shop.upgradesConfig.set(upgradeConfig.id, upgradeConfig);
    }
  }

  private setupPlayerUpgrades(state: GameState, player: PlayerState) {
    player.hp = MAP_DATA.baseHp;
    player.gold = MAP_DATA.baseGold;
    player.income = MAP_DATA.baseIncome;
    player.population = MAP_DATA.basePopulation;
    for (let upgradeData of UPGRADES_DATA) {
      let upgradeConfig = state.shop.upgradesConfig.get(upgradeData.name);
      let upgrade = new UpgradeState();
      upgrade.id = upgradeData.name;
      upgrade.level = 1;
      upgrade.cost = upgradeConfig.price;
      upgrade.value = upgradeData.value;
      upgrade.nextCost = upgradeConfig.price + upgradeConfig.upgradeMultiplier;
      upgrade.nextCost = (upgrade.level + 1) * upgrade.value;
      player.upgrades.set(upgradeData.name, upgrade);
      // upgrade.value = UPGRADES_DATA.find(u => u.name === upgradeData.name).value;
      // upgrade.nextCost = UPGRADES_DATA.find(u => u.name === upgradeData.name).value;
    }
  }

  private setupPlayerGrid(state: GameState, player: PlayerState) {
    for (const rock of state.grid.rocks) {
        player.rocks.set(rock.id, new RockState({
          gridX: rock.gridX,
          gridY: rock.gridY })); 
    }
    for (const checkpoint of state.grid.checkpoints) {
        player.checkpoints.set(checkpoint.id, new CheckpointState({ 
          gridX: checkpoint.gridX,
          gridY: checkpoint.gridY,
          order: checkpoint.order
        })); 
    }
    for (const area of state.grid.areas) {
      player.areas.set(area.id, new AreaState({ 
        gridX: area.gridX,
        gridY: area.gridY,
        radius: area.radius,
        damageMultiplier: area.damageMultiplier,
        attackMultiplier: area.attackSpeedMultiplier,
        rangeMultiplier: area.rangeMultiplier,
        speedMultiplier: area.speedMultiplier
      })); 
    }
  }
}