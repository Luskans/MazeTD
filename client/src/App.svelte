<script lang="ts">
  import { onMount } from 'svelte';
  import { screen } from './stores/ui';
  import Home from './components/Home.svelte';
  import Lobby from './components/Lobby.svelte';
  import Game from './components/Game.svelte';
  import GameUI from './components/GameUI.svelte';
  import { getOrCreateUID } from './services/player';
  import { SvelteToast } from '@zerodevx/svelte-toast'

  onMount(() => {
    getOrCreateUID();
  });
</script>


<main>
  {#if $screen === 'home'}
    <Home />
  {:else if $screen === 'lobby'}
    <Lobby />
  {:else}
    <!-- <Game /> -->
    <div class="game-screen"></div>
    <GameUI />
  {/if}
  <!-- <SvelteToast options={{ intro: { y: -32 } }} /> -->
  <SvelteToast />
</main>