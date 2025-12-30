import { Room } from "colyseus";
import { GameState } from "../rooms/schema/GameState";
import { MAP_DATA } from "../datas/mapData";
import { PlayerState } from "../rooms/schema/PlayerState";
import { WaveConfig } from "../rooms/schema/WaveConfig";
import { ENEMIES_DATA } from "../datas/enemiesData";
import { EnemyState } from "../rooms/schema/EnemyState";

type RankedPlayer = {
  player: PlayerState;
  rank: number;
  value: number;
};

export class WaveService {
  private room: Room<GameState>;
  private countdownTimer?: NodeJS.Timeout;

  constructor(room: Room<GameState>) {
    this.room = room;
  }

  public startFirstWave() {
    this.startCountdown(60);
  }

  private startCountdown(seconds = MAP_DATA.waveTimer) {
    const state = this.room.state;
    state.wavePhase = "countdown";
    state.countdown = seconds;
    state.countdownMax = seconds;

    this.countdownTimer = setInterval(() => {
      state.countdown--;

      if (state.countdown <= 0) {
        clearInterval(this.countdownTimer);
        this.startWave();
      }
    }, 1000);
  }

  public startWave() {
    const state = this.room.state;
    this.resetStatsAndPlayers();
    state.wavePhase = "running";

    const wave = state.waves[state.currentWaveIndex];

    for (const player of state.players.values().filter(p => !p.isDefeated)) {
      this.spawnWaveForPlayer(player, wave);
    }
  }

  private spawnWaveForPlayer(player: PlayerState, wave: WaveConfig) {
    const enemyData = ENEMIES_DATA[wave.enemyId];
    if (!enemyData) {
      console.log(`Enemy with id ${wave.enemyId} not found in datas.`);
      return;
    }
    for (let i = 0; i < enemyData.count; i++) {
      const enemy = new EnemyState(/* ... */);
      // player.enemies.set(enemy.id, enemy);
    }
  }

  private onEnemyKilled(player: PlayerState, enemy: EnemyState) {
    player.kills++;
    // player.enemies.delete(enemy.id);
    // this.checkWaveEnd();
  }

  private onEnemyReachedEnd(player: PlayerState, enemy: EnemyState) {
    // player.lives--;
    player.enemies.delete(enemy.id);
    this.checkWaveEnd();
  }

  private checkWaveEnd() {
    const state = this.room.state;

    const enemiesLeft = Array.from(state.players.values())
      .some(p => p.enemies.size > 0);

    if (!enemiesLeft) {
      this.endWave();
    }
  }

  private endWave() {
    const state = this.room.state;
    const players = Array.from(state.players.values()).filter(p => !p.isDefeated);
    // state.wavePhase = "countdown";

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
    // for (const player of this.room.state.players.values()) {
    //   player.gold += player.income + player.incomeBonus;
    //   player.incomeBonus = 0;
    //   // reset wave stats if needed
    // }
    // const state = this.room.state;
    // const players = Array.from(state.players.values()).filter(p => !p.isDefeated);

    const damageRanking = this.computeRanking(players, p => p.damage);
    this.assignIncomeBonus(damageRanking, players.length);

    const mazeRanking = this.computeRanking(players, p => p.mazeDuration);
    this.assignIncomeBonus(mazeRanking, players.length);
  }

  // private computeRanking<T>(players: PlayerState[], valueGetter: (p: PlayerState) => number): PlayerState[] {
  //   return [...players].sort((a, b) => {
  //     return valueGetter(b) - valueGetter(a);
  //   });
  // }
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

  // private assignIncomeBonus(rankedPlayers: PlayerState[], maxBonus: number) {
  //   rankedPlayers.forEach((player, index) => {
  //     const bonus = Math.max(maxBonus - index, 0);
  //     player.incomeBonus += bonus;
  //   });
  // }
  private assignIncomeBonus(rankedPlayers: RankedPlayer[], maxBonus: number) {
    rankedPlayers.forEach(({ player, rank }) => {
      const bonus = Math.max(maxBonus - rank + 1, 0);
      player.incomeBonus += bonus;
    });
  }

  private calculateIncome(players: PlayerState[]) {
    const state = this.room.state;
    players.forEach((player, index) => {
      const incomeUpgrade = player.upgrades.get('income').currentValue;
      if (!incomeUpgrade) {
        console.log(`Income upgrade not found for ${player.username} with id ${player.sessionId}`);
        return;
      }
      player.income = Math.round(MAP_DATA.baseIncome + ((MAP_DATA.baseIncome + state.waveCount) * incomeUpgrade) / 100);
      player.gold += player.income + player.incomeBonus;
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
