<!-- <script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Phaser from "phaser";
  import { GameScene } from "../game/scenes/GameScene";
  import { LoadingScene } from "../game/scenes/LoadingScene";

  let container: HTMLDivElement;
  export let phaserGame: Phaser.Game | null = null;

  onMount(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1280,
      height: 720,
      backgroundColor: '#b6d53c',
      parent: container,
      physics: { default: "arcade" },
      pixelArt: true,
      scene: [LoadingScene, GameScene],
    };
    phaserGame = new Phaser.Game(config);
  });

  onDestroy(() => {
    phaserGame?.destroy(true);
    phaserGame = null;
  });
</script>

<div bind:this={container} class="game-screen"></div> -->


<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createGame, getGame } from "../game/phaser";

  let container: HTMLDivElement;

  onMount(() => {
    createGame(container);
  });

  onDestroy(() => {
    getGame()?.destroy(true);
  });
</script>

<div bind:this={container} class="game-screen"></div>
