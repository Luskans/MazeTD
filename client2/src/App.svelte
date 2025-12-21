<script lang="ts">
  import { onMount } from 'svelte';
  import { screen } from './stores/GlobalVariables';
  import Home from './components/Home.svelte';
  import Lobby from './components/Lobby.svelte';
  import { getOrCreateUID } from './services/PlayerService';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Game from './components/Game.svelte';

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
    <!-- <Game playerData={$playerData}/> -->
    <Game />
    <!-- <div class="game-screen"></div> -->
    <!-- <GameUI /> -->
  {/if}
  <!-- <SvelteToast options={{ intro: { y: -32 } }} /> -->
  <SvelteToast />
</main>