import { EventEmitter } from 'events';
import { PlayerState } from '../rooms/schema/PlayerState';
import { EnemyType } from '../types/enemiesType';

export interface GameEvents {
  'ENEMY_SPAWNED': (player: PlayerState, enemyData: EnemyType) => void;
  'ENEMY_REMOVED': () => void;
  'BUILDING_PLACEMENT': (player: PlayerState, buildingX: number, buildingY: number, buildingSize: number, isDuringWave: boolean) => void;
  'PATH_VALID': () => void;
  'PATH_INVALID': () => void;
  // 'WAVE_STARTED': (waveNumber: number) => void;
  // 'PLAYER_READY': (playerId: string) => void;
}

export class TypedEventEmitter extends EventEmitter {
  emit<K extends keyof GameEvents>(event: K, ...args: Parameters<GameEvents[K]>): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof GameEvents>(event: K, listener: GameEvents[K]): this {
    return super.on(event, listener);
  }
}