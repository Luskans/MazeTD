<script lang="ts">
  import { onMount } from 'svelte';
  import Home from './components/Home.svelte';
  import Lobby from './components/Lobby.svelte';
  import { getOrCreateUID } from './colyseus/Customer';
  import { SvelteToast } from '@zerodevx/svelte-toast';
  import Game from './components/Game.svelte';
  import { screenStore } from './stores/screenStore.svelte';

  onMount(() => {
    getOrCreateUID();
  });
</script>


<main>
  {#if screenStore.current === 'home'}
    <Home />
  {:else if screenStore.current === 'lobby'}
    <Lobby />
  {:else}
    <Game />
  {/if}
  <!-- <SvelteToast options={{ intro: { y: -32 } }} /> -->
  <SvelteToast />
</main>

<style>
  main {
    overflow: hidden;
  }
</style>