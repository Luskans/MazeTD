<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { LoadingScene } from '../scenes/LoadingScene';
  import { GameScene } from '../scenes/GameScene';
  import GameUI from './GameUI.svelte';
  import { sceneStore } from '../stores/screenStore.svelte';
    import { WaterPostPipeline } from '../shaders/WaterPostPipeline';

  let container: HTMLElement;
  let gameInstance = $state<Phaser.Game | null>(null);

  onMount(async () => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      parent: container,
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
  });

  onDestroy(() => {
    if (gameInstance) {
      gameInstance.destroy(true);
      gameInstance = null;
    }
  });
</script>

<svelte:window on:contextmenu|preventDefault />
<div class="game-screen" bind:this={container}>
  {#if sceneStore.current === 'game'}
    <GameUI />
  {/if}
</div>

<style>
  .game-screen {
    width: 100%;
    height: 100vh;
  }
</style>