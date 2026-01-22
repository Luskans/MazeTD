<script lang="ts">
  import { network } from "../../colyseus/Network";
  import { gameStore } from "../../stores/gameStore.svelte";

  const progress = $derived(Math.max(0, Math.min(1, (gameStore.countdown ?? 0) / (gameStore.countdownMax ?? 1))) * 100);

  function handleClick() {
    network.sendPlayerReady();
  }
</script>

<div class="wave-hud">
  <div class="wave-content">
    <p class="wave-count">{gameStore.waveCount}</p>
    <div class="wave-bar">
      <div class="wave-progress" style="width: {progress}%"></div>
      <span class="countdown-text">{gameStore.wavePhase === "running" ? "WAVE IN PROGRESS" : gameStore.countdown}</span>
    </div>
  </div>
  {#if !gameStore.me?.isReady && gameStore.wavePhase === "countdown"}
  <button onclick={handleClick}>Ready</button>
  {/if}
</div>

<style>
  .wave-hud {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: transparent;
    gap: 8px;
  }
  .wave-content {
    display: flex;
    align-items: center;
  }
  .wave-count {
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(90deg, var(--primary), var(--primary-light));
    /* border: 3px solid var(--primary); */
    border: 1px solid var(--primary);
    border-radius: 50%;
    z-index: 1;
    color: var(--white);
    font-size: 16px;
    font-weight: bold;
    width: 32px;
    height: 32px;
    padding-bottom: 2px;
  }
  .wave-bar {
    position: relative;
    width: 200px;
    height: 20px;
    background: var(--primary);
    border: 3px solid var(--primary);
    border-radius: 0 4px 4px 0;
    border-left: none;
    margin-left: -20px;
    padding-left: 18px;
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
    /* text-shadow: 1px 1px 2px black; */
  }
  button {
    width: fit-content;
    background-color: var(--primary);
    color: var(--white);
    /* border: 1px solid var(--primary); */
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    /* cursor: pointer; */
    font-weight: bold;
    font-size: 10px;
    transition: transform 0.2s ease, background-color 0.2s ease;
  }
  button:hover {
    /* background-color: var(--primary-light); */
    /* background: linear-gradient(180deg, var(--primary), var(--primary-light)); */
    /* color: var(--primary-dark); */
    transform: scale(1.1);
  }
  button:active {
    transform: scale(1.4);
  }
</style>