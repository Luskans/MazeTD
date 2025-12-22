<script lang="ts">
  import { gameRoom } from '../../stores/GlobalVariables';
  import Tooltip from './Tooltip.svelte';

  let { type, data, onclick } = $props<{
    type: "tower" | "wall" | "upgrade",
    data: any,
    onclick: () => void
  }>();

  let isHovered = $state(false);

  type ShopKey = "towersConfig" | "wallsConfig" | "upgradesConfig";
  const configName = $derived.by((): ShopKey => {
    if (type === "tower") return "towersConfig";
    if (type === "wall") return "wallsConfig";
    return "upgradesConfig";;
  });

  const price = $derived(
    $gameRoom?.state.shop[configName]?.get(data.id)?.price ?? '...'
  );
</script>

<button
  {onclick}
  onmouseenter={() => isHovered = true} 
  onmouseleave={() => isHovered = false}
  onfocus={() => isHovered = true}
  onblur={() => isHovered = false}
>
  <p class="shortcut"></p>
  <div class="image-card">
    <img src="/assets/{data.id}.png" alt={data.name} class="image" />
  </div>
  <div class="price-card">
    <p class="price-text">{price} 🪙</p>
  </div>
</button>

{#if isHovered}
  <Tooltip info={data} />
{/if}

<style>
  button {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 2px solid var(--primary);
    border-radius: 0 8px 8px 8px;
    overflow: hidden;
    cursor: pointer;
    /* background: transparent; */
    background: var(--primary);
  }
  button:hover {
    border: 2px solid var(--secondary);
  }
  .shortcut {
    position: absolute;
    top: 1px;
    left: 4px;
    color: var(--grey);
    font-size: 8px;
  }
  .image-card {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 12px;
  }
  .image {
    max-width: 48px;
    max-height: 48px;
  }
  .price-card {
    background: var(--primary-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px 0;
  }
  .price-text {
    font-size: 10px;
    color: var(--white);
  }
</style>