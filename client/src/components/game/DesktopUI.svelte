<script lang="ts">
  import Panel from './Panel.svelte';
  import WaveHUD from './WaveHUD.svelte';
  import PlayersPanel from './PlayersPanel.svelte';
  import ShopPanel from './ShopPanel.svelte';
  import WavesPanel from './WavesPanel.svelte';
  import SettingsPanel from './SettingsPanel.svelte';
  import ActionBar from './ActionBar.svelte';
  import { gameStore } from '../../stores/gameStore.svelte';
  import BuildingInfo from './BuildingInfo.svelte';
  
  let activePanel = $state<"players" | "shop" | "waves" | "settings" | null>(null);

  const togglePanel = (panel: "players" | "shop" | "waves" | "settings") => {
    activePanel = (activePanel === panel) ? null : panel;
  };
</script>

<div class="wave-hud">
  <WaveHUD />
</div>


<div class="action-bar textured-component">
  <div class="aura-container">
  <!-- <div class="container">
    <svg style="display:none">
      <filter id="noiseFilter">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.6" 
          numOctaves="3" 
          stitchTiles="stitch"/>
      </filter>
    </svg> -->
    <ActionBar 
      {activePanel} 
      onButtonClick={togglePanel} 
    />
  </div>
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

<BuildingInfo />

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

  .aura-container {
    position: relative;
    /* width: 100px;
    height: 100px; */
    background: #222;
    /* border-radius: 50%; */
    z-index: 1;
  }
  .aura-container::after {
    content: "";
    position: absolute;
    top: -5px; left: -5px; right: -5px; bottom: -5px;
    background: linear-gradient(45deg, #ff00ee, #00d2ff);
    /* border-radius: 50%; */
    z-index: -1;
    filter: blur(15px);
    opacity: 0.7;
    animation: aura-move 3s infinite alternate;
  }
  @keyframes aura-move {
    0% {
      transform: scale(1) translate(0, 0);
      filter: blur(15px);
    }
    50% {
      transform: scale(1.1) translate(2px, -3px);
      filter: blur(20px);
    }
    100% {
      transform: scale(0.95) translate(-2px, 2px);
      filter: blur(15px);
    }
  }

  /* IMAGE EN CSS */
  /* .textured-component {
    background-color: #ff9595;
    background-image: 
      linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), 
      url('https://grainy-gradients.vercel.app/noise.svg');
    background-repeat: repeat;
    background-blend-mode: overlay;
  } */

  /* MOTIFS EN CSS */
  /* .textured-component {
    background-color: #ff9595;
    background-image: radial-gradient(#444cf7 0.5px, #e5e5f7 0.5px);
    background-size: 10px 10px;
  } */

  /* FILTRE SVG (le plus performant)*/
  /* .container {
    position: relative;
    background: #ffa2a2;
    overflow: hidden;
  }
  .container::before {
    content: "";
    position: absolute;
    inset: 0;
    filter: url(#noiseFilter);
    opacity: 0.35;
    pointer-events: none;
  } */

  /* MASK PNG */
  /* .textured-component {
    background: #fff;
    mask-image: url('assets/grass.png');
    mask-size: cover;
  } */
</style>