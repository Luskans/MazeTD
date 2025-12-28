<script lang="ts">
  import Panel from './Panel.svelte';
  import WaveHUD from './WaveHUD.svelte';
  import PlayersPanel from './PlayersPanel.svelte';
  import ShopPanel from './ShopPanel.svelte';
  import WavesPanel from './WavesPanel.svelte';
  import SettingsPanel from './SettingsPanel.svelte';
  import ActionBar from './ActionBar.svelte';
  import { gameStore } from '../../stores/gameStore.svelte';
  
  let activePanel = $state<"players" | "shop" | "waves" | "settings" | null>(null);
  // const player = $derived($gameRoom?.state.players.get($gameRoom.sessionId));
  // $: state = $roomState;
  // let player = $state("");
  // onMount(() => {
  //   if ($gameRoom) {
  //     $gameRoom.onStateChange((state) => {
  //       player = state.players.get($gameRoom.sessionId);
  //     });
  //   }
  // });

  const togglePanel = (panel: "players" | "shop" | "waves" | "settings") => {
    activePanel = (activePanel === panel) ? null : panel;
  };
</script>

<div class="wave-hud">
  <WaveHUD />
</div>

<div class="action-bar">
  <ActionBar 
    {activePanel} 
    onButtonClick={togglePanel} 
  />
</div>

{#if activePanel === "players"}
  <Panel title={activePanel} onClose={() => activePanel = null}>
    <!-- <PlayersPanel players={$gameRoom.state.players} /> -->
    <!-- <PlayersPanel players={$gameRoom.state.players} /> -->
    <PlayersPanel players={gameStore.players} />
  </Panel>
{/if}

{#if activePanel === "shop"}
  <Panel title={activePanel} onClose={() => activePanel = null}>
    <ShopPanel />
  </Panel>
{/if}

<!-- {#if activePanel === "waves" && $gameRoom}
  <Panel title={activePanel} onClose={closePanel}>
    <WavesPanel game={$gameRoom.state} />
  </Panel>
{/if} -->

{#if activePanel === "settings"}
  <Panel title={activePanel} onClose={() => activePanel = null}>
    <SettingsPanel />
  </Panel>
{/if}

<style>
  .wave-hud {
    position: fixed;
    top: 10px;
    right: 20px;
    /* left: 50%;
    transform: translateX(-50%); */
  }
  .action-bar {
    position: fixed;
    top: 52px;
    left: 0px;
    color: var(--white);
    background: var(--primary);
    border: 3px solid var(--secondary-dark);
    border-left: none;
    border-radius: 0 8px 8px 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    z-index: 1;
  }
</style>