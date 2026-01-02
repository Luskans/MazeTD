import { Delayed, Room } from "colyseus";
import { GameState } from "../rooms/schema/GameState";
import { MAP_DATA } from "../datas/mapData";
import { PlayerState } from "../rooms/schema/PlayerState";
import { WaveConfig } from "../rooms/schema/WaveConfig";
import { ENEMIES_DATA } from "../datas/enemiesData";
import { TypedEventEmitter } from "./EventBus";

type RankedPlayer = {
  player: PlayerState;
  rank: number;
  value: number;
};

export class WaveService {
  private room: Room<GameState>;
  private eventBus: TypedEventEmitter;
  private countdownTimer?: Delayed;
  private totalEnemiesActive = 0;

  constructor(room: Room<GameState>, eventBus: TypedEventEmitter) {
    this.room = room;
    this.eventBus = eventBus;
    this.eventBus.on('ENEMY_SPAWNED', () => {
        this.totalEnemiesActive++;
    });
    this.eventBus.on('ENEMY_REMOVED', () => {
      this.totalEnemiesActive--;
      if (this.totalEnemiesActive <= 0 && this.room.state.wavePhase === "running") {
          this.endWave();
      }
    });
  }

  public startFirstWave() {
    this.startCountdown(5); // TODO: 60
  }

  private startCountdown(seconds = MAP_DATA.waveTimer) {
    const state = this.room.state;
    state.wavePhase = "countdown";
    state.countdown = seconds;
    state.countdownMax = seconds;

    this.countdownTimer = this.room.clock.setInterval(() => {
      state.countdown--;
      if (state.countdown <= 0) {
        this.countdownTimer.clear();
        this.startWave();
      }
    }, 1000);
  }

  public startWave() {
    const state = this.room.state;
    this.resetStatsAndPlayers();
    state.wavePhase = "running";

    const wave = state.waves[state.currentWaveIndex];

    for (const player of state.players.values()) {
      if (player.isDefeated) continue;
      this.spawnWaveForPlayer(player, wave);
    }
  }

  private spawnWaveForPlayer(player: PlayerState, wave: WaveConfig) {
    const enemyData = ENEMIES_DATA[wave.enemyId];
    if (!enemyData) {
      console.log(`Enemy with id ${wave.enemyId} not found in datas.`);
      return;
    }
    let spawned = 0;

    const spawn = () => {
      if (spawned >= enemyData.count) return;

      this.eventBus.emit('ENEMY_SPAWNED', player, enemyData);
      spawned++;

      this.room.clock.setTimeout(() => spawn(), enemyData.stats.proximity);
    };

    spawn();
  }

  private endWave() {
    const state = this.room.state;
    const players = Array.from(state.players.values()).filter(p => !p.isDefeated);

    this.computeWaveStats(players);

    state.currentWaveIndex++;
    if (state.currentWaveIndex === MAP_DATA.waveCount - 1) {
      state.currentWaveIndex = 0;
    }
    state.waveCount++;

    this.calculateIncome(players);
    this.startCountdown();
  }

  private computeWaveStats(players: PlayerState[]) {
    const damageRanking = this.computeRanking(players, p => p.damage);
    this.assignIncomeBonus(damageRanking, players.length);

    const mazeRanking = this.computeRanking(players, p => p.mazeDuration);
    this.assignIncomeBonus(mazeRanking, players.length);
  }

  private computeRanking(players: PlayerState[], valueGetter: (p: PlayerState) => number): RankedPlayer[] {
    const sorted = [...players].sort((a, b) => {
      return valueGetter(b) - valueGetter(a);
    });

    const ranked: RankedPlayer[] = [];

    let currentRank = 1;
    let previousValue: number | null = null;

    sorted.forEach((player, index) => {
      const value = valueGetter(player);

      if (previousValue !== null && value < previousValue) {
        currentRank = index + 1;
      }

      ranked.push({player, rank: currentRank, value});
      previousValue = value;
    });

    return ranked;
  }

  private assignIncomeBonus(rankedPlayers: RankedPlayer[], maxBonus: number) {
    rankedPlayers.forEach(({ player, rank }) => {
      const bonus = Math.max(maxBonus - rank + 1, 0);
      player.incomeBonus += bonus;
    });
  }

  private calculateIncome(players: PlayerState[]) {
    const state = this.room.state;
    players.forEach((player, index) => {
      // const incomeUpgrade = player.upgrades.get('income').currentValue;
      const incomeUpgrade = player.upgrades.get('income');
      if (!incomeUpgrade) {
        console.log(`Income upgrade not found for ${player.username} with id ${player.sessionId}`);
        return;
      }
      player.income = Math.round(MAP_DATA.baseIncome + ((MAP_DATA.baseIncome + state.waveCount) * incomeUpgrade.currentValue) / 100);
      player.gold += player.income + player.incomeBonus;
      console.log(`Player ${player.sessionId} receive ${player.income} of income for wave ${this.room.state.waveCount} and ${player.incomeBonus} of bonus`)
    });
  }

  private resetStatsAndPlayers() {
    const state = this.room.state;
    state.players.forEach(p => {
      p.isReady = false;
      p.damage = 0;
      p.kills = 0;
      p.mazeDuration = 0;
      p.incomeBonus = 0;
    });
  }
}
