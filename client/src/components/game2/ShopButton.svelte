<script lang="ts">
  import { gameStore } from '../../stores/gameStore.svelte';
  import Tooltip from './Tooltip.svelte';

  let { type, data, price, level, cost, value, nextCost, nextValue, onclick } = $props<{
    type: "towers" | "walls" | "upgrades",
    data: any,
    price: number,
    level?: number,
    cost?: number,
    value?: number,
    nextCost?: number,
    nextValue?: number,
    onclick: () => void
  }>();

  let isHovered = $state(false);
  const notPopulation = $derived(gameStore.me!.population >= gameStore.me!.maxPopulation);
  const notGold = $derived(gameStore.me!.gold < price);
</script>

<div 
  class="button-wrapper"
  role="none"
  onmouseenter={() => isHovered = true} 
  onmouseleave={() => isHovered = false}
  onfocus={() => isHovered = true}
  onblur={() => isHovered = false}
>
  <button
    {onclick}
    disabled={notGold || notPopulation}
    class:disabled={notPopulation}
  >
    <!-- <p class="shortcut"></p> -->
    <div class="image-card">
      <img src="/assets/buildings/icons/{data.id}_icon.png" alt={data.name} class="image" />
    </div>
    <div class="price-card">
      <!-- <p class="price-text" class:disabled={notGold}>{price} 🪙</p> -->
      <p class="price-text" class:disabled={notGold}>{price}</p>
      <img src="/icons/income.png" alt="Income" class="price-image" />
    </div>
  </button>
</div>

{#if isHovered}
  <Tooltip data={data} level={level} cost={cost} value={value} nextCost={nextCost} nextValue={nextValue} />
{/if}

<style>
  button {
    position: relative;
    display: flex;
    flex-direction: column;
    border: none;
    /* border: 2px solid var(--primary); */
    border-radius: 0 8px 8px 8px;
    overflow: hidden;
    cursor: pointer;
    background: var(--primary-dark);
    /* border: 2px solid white; */
    /* box-shadow: 0px 0px 3px 0px var(--white); */
    /* transition: transform 0.2s, box-shadow 0.2s; */
    transition: transform 0.2s ease;
    width: 100%;
    height: 100%;
  }
  button:hover {
    transform: scale(1.1);
    /* box-shadow: 0 0 6px 2px var(--secondary-light); */
  }
  /* .shortcut {
    position: absolute;
    top: 1px;
    left: 4px;
    color: var(--grey);
    font-size: 8px;
    font-weight: bold;
  } */
  .image-card {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 8px;
  }
  .image {
    max-width: 48px;
    max-height: 48px;
  }
  .price-card {
    background: var(--primary-light);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px 0;
    gap: 4px;
  }
  .price-text {
    font-size: 10px;
    color: var(--white);
    font-weight: bold;
  }
  .price-image {
    width: 16px;
    height: 16px;
  }
  button.disabled:hover {
    box-shadow: 0 0 6px 2px var(--danger);
    cursor: default;
  }
  .price-card .price-text.disabled {
    color: var(--danger);
  }
</style>