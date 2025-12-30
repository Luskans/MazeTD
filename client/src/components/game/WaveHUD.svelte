<script lang="ts">
  import { network } from "../../colyseus/Network";
  import { gameStore } from "../../stores/gameStore.svelte";

  const progress = $derived(Math.max(0, Math.min(1, (gameStore.countdown ?? 0) / (gameStore.countdownMax ?? 1))) * 100);
  // $: progress = Math.max(0,Math.min(1,(gameStore.countdown ?? 0) / (gameStore.countdownMax ?? 1))) * 100;

  function handleClick() {
    network.sendPlayerReady();
  }
</script>

<div class="wave-hud">
  {#if !gameStore.me?.isReady && gameStore.wavePhase === "countdown"}
  <button onclick={handleClick}>READY</button>
  {/if}
  <div class="wave-content">
    <p class="wave-count">{gameStore.waveCount}</p>
    <div class="wave-bar">
      <div class="wave-progress" style="width: {progress}%">
      </div>
      <span class="countdown-text">{gameStore.wavePhase === "running" ? "WAVE IN PROGRESS" : gameStore.countdown}</span>
    </div>
  </div>
</div>

<style>
  .wave-hud {
    display: flex;
    /* flex-direction: column; */
    justify-content: center;
    align-items: center;
    background: transparent;
    gap: 12px;
  }
  .wave-content {
    display: flex;
    align-items: center;
  }
  .wave-count {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--primary-light);
    border: 3px solid var(--secondary-dark);
    border-radius: 50%;
    z-index: 1;
    color: var(--white);
    font-size: 16px;
    font-weight: bold;
    width: 38px;
    height: 38px;
  }
  .wave-bar {
    position: relative;
    width: 200px;
    height: 20px;
    background: var(--primary);
    border: 3px solid var(--secondary-dark);
    border-radius: 0 16px 16px 0;
    border-left: none;
    margin-left: -20px;
    overflow: hidden;
  }
  .wave-progress {
    height: 100%;
    background: linear-gradient(90deg, var(--secondary), var(--secondary-light));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 0.2s linear;
  }
  .countdown-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--white);
    font-size: 10px;
    font-weight: bold;
    text-shadow: 1px 1px 2px black;
  }
  button {
    width: fit-content;
    background: var(--primary-light);
    color: var(--white);
    border: 3px solid var(--primary-dark);
    border-radius: 8px;
    padding: 6px 10px;
    cursor: pointer;
    font-weight: bold;
    font-size: 12px;
    transition: transform 0.2s, background-color 0.2s;
  }
  button:hover {
    background: var(--primary-dark);
  }
</style>