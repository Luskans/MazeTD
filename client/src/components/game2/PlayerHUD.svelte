<script lang="ts">
    import { gameStore } from "../../stores/gameStore.svelte";
</script>

{#if gameStore.me}
<div class="hud-resources">
  <!-- <div class="hud-item">
    <img src="/icons/heart.png" alt="Life" class="hud-icon" />
    <p class="hud-text" class:danger={gameStore.me.lives <= 10}>{gameStore.me.lives}</p>
  </div> -->
  <div class="hud-item">
    <img src="/icons/gold.png" alt="Gold" class="hud-icon" />
    <p class="hud-text">{gameStore.me.gold}</p>
  </div>
  <div class="hud-item">
    <img src="/icons/income.png" alt="Income" class="hud-icon" />
    <p class="hud-text">{gameStore.me.income}</p>
  </div>
  <div class="hud-item">
    <img src="/icons/population.png" alt="Population" class="hud-icon" />
    <p class="hud-text" class:danger={gameStore.me.population == gameStore.me.maxPopulation}>{gameStore.me.population}/{gameStore.me.maxPopulation}</p>
  </div>
</div>
{/if}

<style>
  .hud-resources {
    display: flex;
    justify-content: space-between;
    background: var(--primary);
    padding: 0px 8px;
    gap: 8px;
  }
  .hud-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 0px;
    gap: 6px;
  }
  .hud-icon {
    width: 16px;
    height: 16px;
  }
  .hud-text {
    color: var(--white);
    font-weight: bold;
    font-size: 0.6rem;
  }
  .hud-text.danger {
    color: var(--danger);
  }
</style>