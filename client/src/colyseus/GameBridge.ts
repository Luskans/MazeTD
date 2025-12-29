import { getStateCallbacks, Room } from "colyseus.js";
import { MapSchema } from "@colyseus/schema";
import { network } from "./Network";
import { addChatMessage, addSystemMessage, chat, clearChat } from "../stores/chatStore.svelte";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import { PlayerState } from "../../../server/src/rooms/schema/PlayerState";
import { gameStore, shopStore, type MyselfStore, type PlayerStore, type TowerConfigStore, type UpgradeConfigStore, type UpgradeStore, type WallConfigStore, type WaveConfigStore } from "../stores/gameStore.svelte";
import type { WaveConfig } from "../../../server/src/rooms/schema/WaveConfig";
import type { UpgradeState } from "../../../server/src/rooms/schema/UpgradeState";

let cleanupFns: (() => void)[] = [];

export function connectGame(room: Room<GameState>) {
  disconnectGame();
  clearChat();
  const $ = getStateCallbacks(room);

  // cleanupFns.push(
  //   $(room.state).listen("players", (players) => {

  //     $(players).onAdd((player, id) => {
  //       syncPlayers(room);

  //       const myPlayer = room.state.players.get(room.sessionId);
  //       $(myPlayer.viewers).onChange(() => {
  //         if (gameStore.me) {
  //           gameStore.me = {
  //             ...gameStore.me,
  //             viewers: Array.from(myPlayer.viewers.keys())
  //           };
  //         }
  //       })

  //       $(myPlayer.upgrades).onChange(() => {
  //         if (gameStore.me) {
  //           gameStore.me = {
  //             ...gameStore.me,
  //             upgrades: Array.from(myPlayer.viewers.keys())
  //           };
  //         }
  //       })

  //       $(player).onChange(() => {
  //         syncPlayers(room);
  //       });
  //     });

  //     $(players).onRemove(() => {
  //       syncPlayers(room);
  //     });

  //     syncPlayers(room);
  //   })
  // );
  cleanupFns.push(
    $(room.state).listen("players", (players) => {
      $(players).onAdd((player, id) => {
        $(player).onChange(() => updateStore(room));
        $(player.viewers).onChange(() => updateStore(room));
        $(player.upgrades).onChange(() => updateStore(room));
        
        updateStore(room);
      });

      $(players).onRemove(() => updateStore(room));
      updateStore(room);
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
          // multiplier: config.multiplier
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
  // cleanupFns.push(
  //   $(room.state).listen("shop", (shop: any) => {
  //     shopStore.towers = shop.towersConfig.forEach((c: any) => ({ id: c.id, price: c.price }));
  //     shopStore.upgrades = shop.upgradesConfig.forEach((c: any) => ({ id: c.id, price: c.price }));
  //     shopStore.walls = shop.wallsConfig.forEach((c: any) => ({ id: c.id, price: c.price }));
  //   })
  // );

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
    $(room.state).listen("currenWaveIndex", () => { gameStore.currentWaveIndex = room.state.currentWaveIndex; })
  );

  cleanupFns.push(
    $(room.state).listen("waveCount", () => { gameStore.waveCount = room.state.waveCount; })
  );

  cleanupFns.push(
    room.onMessage("wave_countdown", (sec: number) => { gameStore.countdown = sec; })
  );

  cleanupFns.push(
    room.onMessage("wave_start", () => { gameStore.countdown = null; })
  );

  cleanupFns.push(
    room.onMessage("chat", (msg: any) => { addChatMessage(msg.from ?? "anonymous", msg.text); })
  );

  cleanupFns.push(
    room.onMessage("sys", (text: string) => { addSystemMessage(text); })
  );
}

const updateStore = (room: Room<GameState>) => {
  // const players = updatePlayers(room.state.players);
  // const me = room.state.players.find((p: PlayerState) => p.sessionId === room.sessionId) ?? null;
  const meState = room.state.players.get(room.sessionId) ?? null;

  // gameStore.players = players.map(p => ({ ...p }));
  gameStore.players = updatePlayers(room.state.players);
  gameStore.me = meState ? updateMyself(meState) : null;
};

const updatePlayers = (players: MapSchema<PlayerState>): PlayerStore[] => {
  const result: PlayerStore[] = [];

  players.forEach((player: PlayerState, sessionId: string) => {
    result.push({
      sessionId: player.sessionId,
      username: player.username,
      elo: player.elo,
      isDefeated: player.isDefeated,
      isDisconnected: player.isDisconnected,
      isReady: player.isReady,
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
    viewers: Array.from(player.viewers.keys() as string),
    lives: player.lives,
    gold: player.gold,
    income: player.income,
    population: player.population,
    maxPopulation: player.maxPopulation,
    upgrades: updateUpgrades(player.upgrades)
  };

  return result;
}

const updateUpgrades = (upgrades: MapSchema<UpgradeState>): UpgradeStore[] => {
  const result: UpgradeStore[] = [];

  upgrades.forEach((upgrade: UpgradeState, id: string) => {
    result.push({
      id: upgrade.dataId,
      level: upgrade.level,
      currentCost: upgrade.currentCost,
      currentValue: upgrade.currentValue, 
      nextValue: upgrade.nextValue,
      nextCost: upgrade.nextCost
    });
  });

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