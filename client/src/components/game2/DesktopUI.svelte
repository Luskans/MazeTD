<script lang="ts">
  import WaveHUD from './WaveHUD.svelte';
  import { gameStore } from '../../stores/gameStore.svelte';
  import Menu from './Menu.svelte';
  import { onMount } from 'svelte';
  import PlayerHUD from './PlayerHUD.svelte';
  import Panel from './Panel.svelte';
  import PlayersPanel from './PlayersPanel.svelte';
  
  let activePanel = $state<"menu" | "players" | "shop" | "waves" | "settings" | null>(null);
  let selection = $state({ isVisible: false, buildingId: '', type: '' });

  const togglePanel = (panel: "menu" | "players" | "shop" | "waves" | "settings") => {
    activePanel = (activePanel === panel) ? null : panel;
  };

  onMount(() => {
    const handleSelect = (e: any) => {
      if (e.detail.isVisible) activePanel = null;
    };
    window.addEventListener('select-building', handleSelect);
    return () => window.removeEventListener('select-building', handleSelect);
  });
</script>

<div class="wave-hud">
  <WaveHUD />
</div>


<div class="menu-bar">
  <PlayerHUD />
  <Menu 
    {activePanel} 
    onButtonClick={togglePanel} 
  />
</div>

{#if activePanel === "players"}
  <Panel title={activePanel} onClose={() => activePanel = null}>
    <PlayersPanel players={gameStore.players} />
  </Panel>
{/if}

<!-- {#if activePanel === "shop"}
  <Panel title={activePanel} onClose={() => activePanel = null}>
    <ShopPanel />
  </Panel>
{/if}

{#if activePanel === "waves"}
  <Panel title={activePanel} onClose={() => activePanel = null}>
    <WavesPanel />
  </Panel>
{/if}

{#if activePanel === "settings"}
  <Panel title={activePanel} onClose={() => activePanel = null}>
    <SettingsPanel />
  </Panel>
{/if}

<BuildingInfo /> -->

<style>
  .wave-hud {
    position: fixed;
    top: 10px;
    right: 20px;
    /* left: 50%;
    transform: translateX(-50%); */
  }
  .menu-bar {
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }
</style>