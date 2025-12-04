import { AreaState } from "../rooms/schema/AreaState";
import { CheckpointState } from "../rooms/schema/CheckpointState";
import { EnemyState } from "../rooms/schema/EnemyState";
import { GameState } from "../rooms/schema/GameState";
import { RockState } from "../rooms/schema/RockState";
import { WaveState } from "../rooms/schema/WaveState";
import { getRandom } from "./utils";

export class SetupService {

  static generateSetup(state: GameState): void {

  }

  private generateGrid(state: GameState): void {
    state.grid.col = getRandom(MAPCONFIG.minCol, MAPCONFIG.maxCol);
    state.grid.row = getRandom(MAPCONFIG.minRow, MAPCONFIG.maxRow);
  }

  private generateRocks(state: GameState): void {
    const totalCells = (state.grid.col * state.grid.row) / 4;
    const minRocks = Math.floor(totalCells * MAPCONFIG.minRocks);
    const maxRocks = Math.floor(totalCells * MAPCONFIG.maxRocks);
    const rockCount = getRandom(minRocks, maxRocks);
    const rocks: {x: number, y: number}[] = [];

    for (let i = 0; i < rockCount; i++) {
      let placed = false;

      for (let tryCount = 0; tryCount < 50 && !placed; tryCount++) {
        const x = getRandom(0, state.grid.col - 2);
        const y = getRandom(0, state.grid.row - 2);

        let overlap = rocks.some(r => {
          return !(x+2 <= r.x || r.x+2 <= x || y+2 <= r.y || r.y+2 <= y);
        });

        if (!overlap) {
          rocks.push({ x, y });
          let rock = new RockState();
          rock.x = x;
          rock.y = y;
          state.grid.rocks.push(rock);
          placed = true;
        }
      }
    }
  }

  private generateCheckpoints(state: GameState) {
    const totalCells = (state.grid.col * state.grid.row) / 4;
    const minChecks = Math.floor(totalCells / 50);
    const maxChecks = Math.floor(totalCells / 400);
    const checkCount = getRandom(minChecks, maxChecks);
    const checkpoints: {x: number, y: number}[] = [];

    for (let i = 0; i < checkCount; i++) {
      let placed = false;

      for (let attempt = 0; attempt < 50 && !placed; attempt++) {
        const x = getRandom(0, state.grid.col - 1);
        const y = getRandom(0, state.grid.row - 1);

        let blocked = state.grid.rocks.some(r => {
          return x >= r.x && x < r.x+2 && y >= r.y && y < r.y+2;
        });

        let overlap = checkpoints.some(r => {
          return !(x+2 <= r.x || r.x+2 <= x || y+2 <= r.y || r.y+2 <= y);
        });

        if (!blocked || overlap) {
          checkpoints.push({ x, y });
          let checkpoint = new CheckpointState();
          checkpoint.x = x;
          checkpoint.y = y;
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
      const area = new AreaState();
      area.x = getRandom(0, state.grid.col);
      area.y = getRandom(0, state.grid.row);
      area.radius = getRandom(MAPCONFIG.minAreaRadius, MAPCONFIG.maxAreaRadius);

      area.damageMultiplier = getRandom(MAPCONFIG.minAreaMultiplier, MAPCONFIG.maxAreaMultiplier);
      area.attackSpeedMultiplier = getRandom(MAPCONFIG.minAreaMultiplier, MAPCONFIG.maxAreaMultiplier);
      area.rangeMultiplier = getRandom(MAPCONFIG.minAreaMultiplier, MAPCONFIG.maxAreaMultiplier);
      area.speedMultiplier = getRandom((1/MAPCONFIG.maxAreaMultiplier), MAPCONFIG.maxAreaMultiplier);

      state.grid.areas.push(area);
    }
  }

  private generateWaves(state: GameState) {
    for (let i = 0; i < 6; i++) {
      const randomEnemy = this.getRandomEnemy(ENEMIES);
      const enemy = new EnemyState();
      enemy.name = randomEnemy.name;
      enemy.maxHp = randomEnemy.hp;
      enemy.currentHp = randomEnemy.hp;
      enemy.speed = randomEnemy.speed;
      enemy.armor = randomEnemy.armor;
      enemy.count = randomEnemy.count;

      const wave = new WaveState();
      wave.index = i;
      wave.enemy = enemy;

      state.waves.push(wave);
    }
  }

  private getRandomEnemy(enemies: Array<any>) {
    const randomIndex = Math.floor(Math.random() * enemies.length);
    return enemies[randomIndex];
  }

  private generateShop(state: GameState) {
    state.prices.wall32 = R(5, 20);
    state.prices.wall64 = R(10, 35);
    state.prices.tower = R(30, 80);
    state.prices.destroyRock = R(50, 120);
    state.prices.incomeUpgrade = R(40, 100);
    state.prices.towerUpgrade = R(20, 60);
    state.prices.towerSellPenalty = R(10, 20);
  }
}