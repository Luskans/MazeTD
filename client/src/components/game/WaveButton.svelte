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
    <div class="left">
      <p class="name">{data.name}</p>
      <div class="count-image">
        <span class="count">{data.count}</span>
        <div class="image-card">
          <img src="/assets/enemies/{data.id}.png" alt={data.name} class="image" />
        </div>
      </div>
    </div>
    <div class="right">
      <div class="tags">
        <span class="tag">{data.environment}</span>
        {#if data.tough.enabled}<span class="tag">{data.tough.name}</span>{/if}
        {#if data.regenerative.enabled}<span class="tag">{data.regenerative.name}</span>{/if}
        {#if data.armored.enabled}<span class="tag">{data.armored.name}</span>{/if}
        {#if data.agile.enabled}<span class="tag">{data.agile.name}</span>{/if}
        {#if data.saboteur.enabled}<span class="tag">{data.saboteur.name}</span>{/if}
        {#if data.invisible.enabled}<span class="tag">{data.invisible.name}</span>{/if}
        {#if data.thief.enabled}<span class="tag">{data.thief.name}</span>{/if}
        {#if data.duplicative.enabled}<span class="tag">{data.duplicative.name}</span>{/if}
      </div>
      <p class="description">{data.description}</p>
    </div>
  </button>
</div>






    <!-- <div class="header">
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
</div> -->

{#if isHovered}
  <Tooltip data={data} />
{/if}

<style>
  button {
    display: flex;
    border: 2px solid var(--primary);
    border-radius: 0 8px 8px 8px;
    overflow: hidden;
    cursor: pointer;
    background: var(--primary);
    transition: transform 0.2s, box-shadow 0.2s;
    width: 280px;
    height: 100%;
  }
  button:hover {
    box-shadow: 0 0 6px 2px var(--secondary-light);
  }
  .left {
    display: flex;
    flex-direction: column;
  }
  .name {
    background: var(--primary-dark);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px 0;
    border-radius: 0 0 8px 0;
    font-size: 12px;
    font-weight: bold;
    color: var(--white);
  }
  .count-image {
    display: flex;
    align-items: center;
  }
  .count {
    font-size: 14px;
    font-weight: bold;
    color: var(--white);
    width: 36px;
    padding-left: 12px;
    justify-self: right;
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
  .right {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 6px 12px;
  }
  .tags {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .tag {
    font-size: 10px;
    color: var(--text);
    padding: 0 4px 1px 4px;
    border-radius: 7px;
    background: var(--grey);
  }
  .description {
    color: var(--grey);
    font-size: 12px;
    font-style: italic;
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  button.active {
    border: 3px solid var(--secondary-light);
  }
  /* button.active:hover {
    box-shadow: 0 0 6px 2px var(--danger);
    cursor: default;
  } */
</style>