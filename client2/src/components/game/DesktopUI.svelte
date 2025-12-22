<script lang="ts">
  import { getGame } from '../../services/PhaserService';
  import Button from './Button.svelte';
  import Panel from './Panel.svelte';
  import WaveHUD from './WaveHUD.svelte';
  
  let activePanel: string | null = null;
  let gameInstance = getGame();

  const closePanel = () => {
      activePanel = null;
  };

  const handleClick = (panel: string) => {
    (activePanel == panel) ? activePanel = null : activePanel = panel;
  }

  function handleTowerClick() {
    // if (gameInstance) {
    //   gameInstance.events.emit('choose-building', { buildingId: 'basic' });
    // }
    //@ts-ignore
    window.phaserGame.events.emit('choose_tower', { buildingId: 'basic', buildingType: "tower", buildingSize: 2 })
  }
  function handleWallClick() {
    //@ts-ignore
    window.phaserGame.events.emit('choose_wall', { buildingId: 'small_wall', buildingType: "wall", buildingSize: 1 })
  }

</script>

<div class="wave-hud">
  <WaveHUD />
</div>

<div class="action-bar">
  <div class="hud-resources">
    <p>💰 : 100</p>
    <p>🗼 : 7/10</p>
  </div>
  <div class="buttons">
    <Button 
      text="Players" 
      icon="👨" 
      on:click={() => handleClick('PLAYERS')} 
    />
    <Button 
      text="Shop"
      icon="🛒"
      on:click={() => handleClick('SHOP')}
    />
    <Button 
      text="Waves"
      icon="📈"
      on:click={() => handleClick('WAVES')} 
    />
    <Button 
      text="Settings"
      icon="⚙️"
      on:click={() => handleClick('SETTINGS')} 
    />
    <button on:click={handleTowerClick}>
      <img src="assets/basic.png" alt="Acheter Tour" />
    </button>
    <button on:click={handleWallClick}>
      <img src="assets/small_wall.png" alt="Acheter Mur" />
    </button>
  </div>
</div>

{#if activePanel}
  <Panel title={activePanel} onClose={closePanel}>
    <p>Contenu du Panneau : **{activePanel}**</p>
    <p>Ici, vous mettriez votre système de Drag and Drop Svelte.</p>
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
    gap: 5px;
    z-index: 1;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
</style>