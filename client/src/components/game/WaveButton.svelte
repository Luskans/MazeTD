<script lang="ts">
  import { gameStore } from '../../stores/gameStore.svelte';
  import Tooltip from './Tooltip.svelte';

  let { index, data } = $props<{
    index: number,
    data: any
  }>();

  let isHovered = $state(false);
  const isActive = $derived(gameStore.currentWaveIndex === index);
</script>

<div 
  class="button-wrapper"
  role="none"
  onmouseenter={() => isHovered = true} 
  onmouseleave={() => isHovered = false}
  onfocus={() => isHovered = true}
  onblur={() => isHovered = false}
>
  <button class:active={isActive} >
    <div class="header">
      <p class="header-text">{data.name}</p>
    </div>
    <div class="body">
      <p>{data.count}</p>
      <div class="image-card">
        <img src="/assets/enemies/{data.id}.png" alt={data.name} class="image" />
      </div>
      <div class="content">
        <div class="tags"></div>
        <p class="description">{data.description}</p>
      </div>
    </div>
  </button>
</div>

{#if isHovered}
  <Tooltip data={data} />
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
    background: var(--primary);
    transition: transform 0.2s, box-shadow 0.2s;
    width: 100%;
  }
  button:hover {
    box-shadow: 0 0 6px 2px var(--secondary-light);
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
  .header {
    background: var(--primary-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px 0;
  }
  .header-text {
    font-size: 10px;
    color: var(--white);
  }
  button.active:hover {
    box-shadow: 0 0 6px 2px var(--danger);
    cursor: default;
  }
</style>