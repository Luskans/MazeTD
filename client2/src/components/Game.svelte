<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { LoadingScene } from '../scenes/LoadingScene';
  import { GameScene } from '../scenes/GameScene';
  import GameUI from './GameUI.svelte';
  import { sceneStore } from '../stores/screenStore';

  let container: HTMLElement;
  let gameInstance: Phaser.Game | null = null;

  onMount(async () => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      parent: ".game-screen",
      backgroundColor: "#d7899eff",
      physics: { default: "arcade" },
      pixelArt: false,
      scale: {
        // mode: Phaser.Scale.FIT,
        mode: Phaser.Scale.RESIZE,
        // autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [LoadingScene, GameScene],
    };

    gameInstance = new Phaser.Game(config);
    (window as any).phaserGame = gameInstance;
    gameInstance.scene.start("LoadingScene");
    
    // 2. On passe la session Colyseus à la scène Phaser
    // On attend que la scène soit prête ou on utilise les données d'initialisation
    // gameInstance.scene.start('LoadingScene', { room });
    // if ($playerData) {
    //   gameInstance.scene.start("LoadingScene", {
    //     roomId: $playerData.roomId, 
    //     options: { uid: $playerData.uid, username: $playerData.username, elo: $playerData.elo } 
    //   });
    // }
  });

  onDestroy(() => {
    if (gameInstance) {
      gameInstance.destroy(true);
      // $playerData = null;
      // Optionnel : remettre la variable globale du singleton à null 
      // pour permettre une re-création propre plus tard.
    }
  });
</script>

<svelte:window on:contextmenu|preventDefault />
<div bind:this={container} class="game-screen">
  <!-- <GameUI /> -->
  {#if $sceneStore === 'gameScene'}
    <GameUI />
  {/if}
</div>

<style>
  .game-screen {
    width: 100%;
    height: 100vh;
  }
</style>