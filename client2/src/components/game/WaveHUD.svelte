<script lang="ts">
    import { gameRoom } from "../../stores/gameStore";


  const me = $derived($gameRoom?.state.players.get($gameRoom.sessionId));
  const isReady = $derived(me?.isReady ?? false);
  // const currentWave = $derived($gameRoom?.state.waveNumber ?? 0);

  function handleClick() {
    if ($gameRoom) {
      $gameRoom.send("player_ready");
    }
  }
</script>

<div class="wave-hud">
  {#if !isReady}
  <button onclick={handleClick}>READY</button>
  {/if}
  <div class="wave-content">
    <p class="wave-count">18</p>
    <div class="wave-bar">
      <div class="wave-progress"></div>
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
    width: 200px;
    height: 20px;
    background: var(--secondary-light);
    border: 3px solid var(--secondary-dark);
    border-radius: 0 16px 16px 0;
    border-left: none;
    margin-left: -20px;
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