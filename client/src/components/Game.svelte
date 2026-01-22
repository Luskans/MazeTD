<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { LoadingScene } from '../scenes/LoadingScene';
  import { GameScene } from '../scenes/GameScene';
  import GameUI from './GameUI.svelte';
  import { sceneStore } from '../stores/screenStore.svelte';

  let gameInstance = $state<Phaser.Game | null>(null);

  onMount(async () => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      // parent: container,
      // parent: parent,
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
{#if sceneStore.current === "gameScene"}
<GameUI />
{/if}

<style>

</style>