import { getStateCallbacks, Room } from "colyseus.js";
import { MapSchema } from "@colyseus/schema";
import { network } from "./Network";
import { addChatMessage, addSystemMessage, chat, clearChat } from "../stores/chatStore.svelte";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import type { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import { gameStore, shopStore, type MyselfStore, type PlayerStore, type TowerConfigStore, type UpgradeConfigStore, type WallConfigStore, type WaveConfigStore } from "../stores/gameStore.svelte";
import type { WaveConfig } from "../../../server/src/rooms/schema/WaveConfig";

let cleanupFns: (() => void)[] = [];

export function connectGame(room: Room<GameState>) {
  disconnectGame();
  clearChat();
  const $ = getStateCallbacks(room);

  cleanupFns.push(
    $(room.state).listen("players", (players) => {

      $(players).onAdd((player, id) => {
        syncPlayers(room);

        $(player).onChange(() => {
          syncPlayers(room);
        });
      });

      $(players).onRemove(() => {
        syncPlayers(room);
      });

      syncPlayers(room);
    })
  );

  cleanupFns.push(
    $(room.state).listen("waves", (waves: any) => {
      const result: WaveConfigStore[] = [];
      waves.forEach((w: WaveConfig) => {
        result.push({
          index: w.index,
          enemyId: w.enemyId
        });
      });

      gameStore.waves = result;
    })
  );

  cleanupFns.push(
    $(room.state).listen("currenWaveIndex", () => {
      gameStore.currentWaveIndex = room.state.currentWaveIndex;
    })
  );

  cleanupFns.push(
    $(room.state).listen("waveCount", () => {
      gameStore.waveCount = room.state.waveCount;
    })
  );

  cleanupFns.push(
    room.onMessage("wave_countdown", (sec: number) => {
      gameStore.countdown = sec;
    })
  );

  cleanupFns.push(
    room.onMessage("wave_start", () => {
      gameStore.countdown = null;
    })
  );

  cleanupFns.push(
    $(room.state).listen("shop", (shop: any) => {

      const towers: TowerConfigStore[] = [];
      shop.towersConfig.forEach((config: TowerConfigStore) => {
        towers.push({
          id: config.id,
          price: config.price
        });
      });

      const upgrades: UpgradeConfigStore[] = [];
      shop.upgradesConfig.forEach((config: UpgradeConfigStore) => {
        upgrades.push({
          id: config.id,
          price: config.price,
          multiplier: config.multiplier
        });
      });

      const walls: WallConfigStore[] = [];
      shop.wallsConfig.forEach((config: WallConfigStore) => {
        walls.push({
          id: config.id,
          price: config.price
        });
      });

      shopStore.towers = towers;
      shopStore.upgrades = upgrades;
      shopStore.walls = walls;
    })
  );

  cleanupFns.push(
    room.onMessage("chat", (msg: any) => {
      addChatMessage(msg.from ?? "anonymous", msg.text);
    })
  );

  cleanupFns.push(
    room.onMessage("sys", (text: string) => {
      addSystemMessage(text);
    })
  );
}

const syncPlayers = (room: Room<GameState>) => {
    const players = updatePlayers(room.state.players);
    // const me = room.state.players.find((p: PlayerState) => p.sessionId === room.sessionId) ?? null;
    const meState = room.state.players.get(room.sessionId) ?? null;

    gameStore.players = players.map(p => ({ ...p }));
    gameStore.me = meState ? updateMyself(meState) : null;
  };

const updatePlayers = (players: MapSchema<PlayerState>): PlayerStore[] => {
  const result: PlayerStore[] = [];

  players.forEach((player: PlayerStore, sessionId: string) => {
    result.push({
      sessionId: player.sessionId,
      username: player.username,
      elo: player.elo,
      isDefeated: player.isDefeated,
      isDisconnected: player.isDisconnected,
      isReady: player.isReady,
      // viewers: player.viewers,
      lives: player.lives,
      kills: player.kills,
      damage: player.damage,
      mazeTime: player.mazeTime,
      incomeBonus: player.incomeBonus
    });
  });

  return result;
}

const updateMyself = (player: PlayerState): MyselfStore => {
  const result = {
    sessionId: player.sessionId,
    username: player.username,
    elo: player.elo,
    rank: player.rank,
    isDefeated: player.isDefeated,
    isReady: player.isReady,
    viewers: player.viewers,
    lives: player.lives,
    gold: player.gold,
    income: player.income,
    population: player.population,
    maxPopulation: player.maxPopulation
  };

  return result;
}

export function sendChatMessage() {
  const text = chat.input.trim();
  if (!text) return;

  network.sendChat(text);
  chat.input = "";
}

export function disconnectGame() {
  cleanupFns.forEach(fn => fn());
  cleanupFns = [];
  gameStore.players = [];
  gameStore.me = null;
  gameStore.waves = [];
  gameStore.currentWaveIndex = 0;
  gameStore.waveCount = 0;
  gameStore.countdown = null;
}