<script lang="ts">
  import Button from './Button.svelte';
  import Panel from './Panel.svelte';
  
  let activePanel: string | null = null;

  const closePanel = () => {
      activePanel = null;
  };

</script>

{#if activePanel}
  <div 
    class="panel-overlay"
    on:click={closePanel}
    tabindex="0"
    role="dialog"
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') closePanel();
    }}
  >
    <Panel title={activePanel} onClose={closePanel}>
      <p>Contenu du Panneau : **{activePanel}**</p>
      <p>Ici, vous mettriez votre système de Drag and Drop Svelte.</p>
    </Panel>
  </div>
{/if}

<div class="hud-top-left">
  <div class="hud-item">
    <span class="icon">❤️</span>
    <span class="text">Vie de la Tour: 100%</span>
  </div>
  <div class="hud-item">
    <span class="icon">💰</span>
    <span class="text">Or: 1250</span>
  </div>
</div>

<div class="top-right-buttons">
  <Button 
    text="" 
    icon="⚙️" 
    on:click={() => activePanel = 'settings'} 
    isDisabled={!!activePanel}
  />
  <Button 
    text="" 
    icon="📍" 
    on:click={() => activePanel = 'map'} 
    isDisabled={!!activePanel}
  />
</div>

<div class="bottom-action-bar">
  <Button 
    text="" 
    icon="👨" 
    on:click={() => activePanel = 'players'} 
    isDisabled={!!activePanel}
  />
  <Button 
    text="" 
    icon="🗼" 
    on:click={() => activePanel = 'stats'} 
    isDisabled={!!activePanel}
  />
  <Button 
    text="" 
    icon="🛒" 
    on:click={() => activePanel = 'shop'} 
    isDisabled={!!activePanel}
  />
  <Button 
    text="" 
    icon="📈" 
    on:click={() => activePanel = 'upgrades'} 
    isDisabled={!!activePanel}
  />
  <Button 
    text="" 
    icon="💬" 
    on:click={() => activePanel = 'chat'} 
    isDisabled={!!activePanel}
  />
</div>

<style>
  /* --------------------------------- */
  /* Mise en page générale */
  /* --------------------------------- */

  :global(body) {
    margin: 0;
    font-family: sans-serif;
    background-color: #2c2c2c; /* Couleur d'arrière-plan du "jeu" */
  }

  /* Le calque de fond du panneau, prend toute la place */
  .panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7); /* Effet d'assombrissement du jeu */
    z-index: 1000; /* Assurez-vous qu'il est au-dessus de tout */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* --------------------------------- */
  /* HUD Haut Gauche */
  /* --------------------------------- */

  .hud-top-left {
    position: fixed;
    top: 10px;
    left: 10px;
    color: white;
    background: rgba(0, 0, 0, 0.5);
    padding: 5px 10px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    z-index: 10;
  }

  .hud-item {
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  .hud-item .icon {
    margin-right: 5px;
    font-size: 16px;
  }

  /* --------------------------------- */
  /* Boutons Haut Droit */
  /* --------------------------------- */

  .top-right-buttons {
    position: fixed;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    /* z-index: 10; */
  }

  /* --------------------------------- */
  /* Boutons Bas (Action Bar) */
  /* --------------------------------- */
  
  .bottom-action-bar {
    position: fixed;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%); /* Centrage horizontal parfait */
    display: flex;
    gap: 10px; /* Espace entre les 5 boutons */
    padding: 10px;
    /* background: rgba(0, 0, 0, 0.7);
    border-radius: 10px;
    z-index: 10; */
  }
</style>