<script lang="ts">
    import { gameStore } from "../../stores/gameStore.svelte";
</script>

{#if gameStore.me}
<div class="hud-resources">
  <div class="hud-item">
    <img src="/icons/heart.png" alt="Life" class="hud-icon" />
    <p class="hud-text" class:danger={gameStore.me.lives <= 10}>{gameStore.me.lives}</p>
  </div>
  <div class="hud-item">
    <img src="/icons/gold.png" alt="Gold" class="hud-icon" />
    <p class="hud-text">{gameStore.me.gold}</p>
  </div>
  <div class="hud-item">
    <img src="/icons/income.png" alt="Income" class="hud-icon" />
    <p class="hud-text">{gameStore.me.income}</p>
  </div>
  <div class="hud-item">
    <img src="/icons/tower.png" alt="Population" class="hud-icon" />
    <p class="hud-text" class:danger={gameStore.me.population == gameStore.me.maxPopulation}>{gameStore.me.population}/{gameStore.me.maxPopulation}</p>
  </div>
</div>
{/if}

<style>
  .hud-resources {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }
  .hud-item {
    display: flex;
    align-items: center;
  }
  .hud-icon {
    background-color: var(--secondary-light);
    padding: 3px;
    border: 2px solid var(--primary-dark);
    border-radius: 50%;
    width: 28px;
    height: 28px;
    object-fit: contain;
    z-index: 2;
  }
  .hud-text {
    width: 100%;
    font-weight: bold;
    background-color: var(--primary-dark);
    padding: 2px 12px;
    border-radius: 0 16px 16px 0;
    margin-left: -4px;
    text-align: right;
    font-size: 12px;
  }
  .hud-text.danger {
    color: var(--danger);
  }
</style>