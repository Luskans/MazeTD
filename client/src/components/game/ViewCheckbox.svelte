<script lang="ts">
  import { network } from '../../colyseus/Network';
  import { gameStore, type PlayerStore } from '../../stores/gameStore.svelte';

  let { player } = $props<{ player: PlayerStore }>();
  // const myId = $derived($gameRoom?.sessionId);
  // const me = $derived($gameRoom?.state.players.get(myId));
  // const hasVision = $derived(me?.viewers.has(player.sessionId));

  // const me = $derived($gameRoom?.state.players.get($gameRoom.sessionId));
  // const hasVision = $derived(me.viewers.has(player.sessionId));
  // const hasVision = $derived(me?.viewers?.get(player.sessionId) === true);
  const hasVision = $derived(gameStore.me?.viewers.includes(player.sessionId));

  function toggleVision(targetId: string) {
    const action = hasVision ? "remove_vision" : "grant_vision";
    // $gameRoom?.send(action, { targetId: player.sessionId });
    network.sendVisionToTarget(action, targetId);
  }
</script>

<button onclick={() => toggleVision(player.sessionId)}>
  <img 
    class:granted={hasVision}
    src="/icons/{hasVision ? "eye" : "eye-crossed"}.png"
    alt="Vision granted"      
  />
</button>

<style>
  button {
    background: transparent;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    /* cursor: pointer; */
  }
  button:hover {
    box-shadow: 0 0 6px 2px var(--secondary-light);
    /* filter: drop-shadow(0 0 4px var(--secondary)); */
  }
  img {
    width: 20px;
    height: 20px;
  }
  .granted {
    filter: drop-shadow(0 0 2px var(--secondary-light));
    /* box-shadow: 0 0 6px 2px var(--secondary-light); */
  }
</style>






<!-- <label class="vision-toggle"> -->
  <!-- <input 
    type="checkbox" 
    checked={hasVision} 
    onclick={(e) => {
      e.preventDefault();
      toggleVision();
    }}
  />
  <span class="checkmark">
    {#if hasVision}
    <img class="icon granted" src="/icons/eye.png" alt="Vision granted" />
    {:else}
    <img class="icon removed" src="/icons/eye-crossed.png" alt="Vision not granted" />
    {/if}
  </span> -->

  <!-- <button onclick={toggleVision}>
    <img 
      class="icon class:granted={hasVision}"
      src="/icons/{hasVision ? "eye" : "eye-crossed"}.png"
      alt="Vision granted"      
    />
  </button>
</label> -->

<!-- <style>
  .vision-toggle {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
  .vision-toggle input {
    display: none;
  }
  .checkmark {
    display: flex;
    align-items: center;
  }
  .checkmark {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-dark);
    border: 2px solid var(--secondary);
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.2s ease;
  }
  .vision-toggle input:checked + .checkmark {
    background: var(--secondary);
    border-color: var(--white);
    filter: drop-shadow(0 0 4px var(--secondary));
  }
  .vision-toggle:hover .checkmark {
    transform: scale(1.1);
    border-color: var(--white);
  }
  .icon {
    width: 20px;
    height: 20px;
  }
  .granted {
    filter: drop-shadow(0 0 4px var(--secondary));
    box-shadow: 0 0 6px 2px var(--secondary-light);
  }
  .removed {

  }
</style> -->