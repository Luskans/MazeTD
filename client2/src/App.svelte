<script lang="ts">
  import { onMount } from 'svelte';
  import Home from './components/Home.svelte';
  import Lobby from './components/Lobby.svelte';
  import { getOrCreateUID } from './colyseus/Customer';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Game from './components/Game.svelte';
  import { screenStore } from './stores/screenStore';

  onMount(() => {
    getOrCreateUID();
  });
</script>


<main>
  {#if $screenStore === 'home'}
    <Home />
  {:else if $screenStore === 'lobby'}
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