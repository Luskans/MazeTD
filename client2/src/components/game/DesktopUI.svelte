<script lang="ts">
  import { onMount } from 'svelte';
  import { gameRoom } from '../../stores/GlobalVariables';
  import Button from './Button.svelte';
  import Panel from './Panel.svelte';
  import WaveHUD from './WaveHUD.svelte';
  import type { PlayerState } from '../../../../server/src/rooms/schema/PlayerState';
  import PlayersPanel from './PlayersPanel.svelte';
  import ShopPanel from './ShopPanel.svelte';
  import WavesPanel from './WavesPanel.svelte';
  import SettingsPanel from './SettingsPanel.svelte';
  
  let activePanel = $state<"players" | "shop" | "waves" | "settings" | null>(null);

  // onMount(() => {
  //   if ($gameRoom) {
  //     $gameRoom.onStateChange((state) => {
  //       player = state.players.get($gameRoom.sessionId);
  //     });
  //   }
  // });

  const player = $derived(
    $gameRoom?.state.players.get($gameRoom.sessionId)
  );

  const closePanel = () => {
      activePanel = null;
  };

  const handleClick = (panel: "players" | "shop" | "waves" | "settings") => {
    (activePanel == panel) ? activePanel = null : activePanel = panel;
  }

  // function handleTowerClick() {
  //   (window as any).phaserGame.events.emit('choose_tower', { buildingId: 'basic', buildingType: "tower", buildingSize: 2 })
  // }

  // function handleWallClick() {
  //   (window as any).phaserGame.events.emit('choose_wall', { buildingId: 'small_wall', buildingType: "wall", buildingSize: 1 })
  // }
</script>

<div class="wave-hud">
  <WaveHUD />
</div>

<div class="action-bar">
  {#if player}
  <div class="hud-resources">
    <div class="hud-item">
      <img src="/icons/gold.png" alt="Gold" class="hud-icon" />
      <p class="hud-text">{player.gold}</p>
    </div>
    <div class="hud-item">
      <img src="/icons/income.png" alt="Income" class="hud-icon" />
      <p class="hud-text">{player.income}</p>
    </div>
    <div class="hud-item">
      <img src="/icons/tower.png" alt="Population" class="hud-icon" />
      <p class="hud-text">{player.population}/{player.maxPopulation}</p>
    </div>
  </div>
  {/if}
  <div class="buttons">
    <Button 
      image="players"
      shortcut="Q"
      active={activePanel === 'players'}
      onclick={() => handleClick('players')} 
    />
    <Button 
      image="shop"
      shortcut="W"
      active={activePanel === 'shop'}
      onclick={() => handleClick('shop')}
    />
    <Button 
      image="waves"
      shortcut="E"
      active={activePanel === 'waves'}
      onclick={() => handleClick('waves')} 
    />
    <Button 
      image="settings"
      shortcut=""
      active={activePanel === 'settings'}
      onclick={() => handleClick('settings')} 
    />
  </div>
</div>

<!-- {#if activePanel === "players" && $gameRoom}
  <Panel title={activePanel} onClose={closePanel}>
    <PlayersPanel players={$gameRoom.state.players} />
  </Panel>
{/if} -->

{#if activePanel === "shop"}
  <Panel title={activePanel} onClose={closePanel}>
    <ShopPanel />
  </Panel>
{/if}

<!-- {#if activePanel === "waves" && $gameRoom}
  <Panel title={activePanel} onClose={closePanel}>
    <WavesPanel game={$gameRoom.state} />
  </Panel>
{/if} -->

{#if activePanel === "settings" && $gameRoom}
  <Panel title={activePanel} onClose={closePanel}>
    <SettingsPanel />
  </Panel>
{/if}

<style>
  .wave-hud {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
  .action-bar {
    position: fixed;
    top: 80px;
    left: 0px;
    color: var(--white);
    background: var(--primary);
    border: 3px solid var(--secondary);
    border-left: none;
    border-radius: 0 8px 8px 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 1;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .hud-resources {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .hud-item {
    display: flex;
    align-items: center;
  }
  .hud-icon {
    background-color: var(--secondary-light);
    padding: 4px;
    border: 2px solid var(--primary-dark);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    object-fit: contain;
    z-index: 2;
  }
  .hud-text {
    width: 100%;
    font-weight: bold;
    background-color: var(--primary-dark);
    padding: 2px 16px;
    border-radius: 0 16px 16px 0;
    margin-left: -4px;
    text-align: right;
  }
</style>