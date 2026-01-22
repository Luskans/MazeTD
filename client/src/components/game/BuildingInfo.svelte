<script lang="ts">
  import { cubicIn } from "svelte/easing";
  import { slide } from "svelte/transition";
  import { onMount } from 'svelte';
  import { gameStore } from '../../stores/gameStore.svelte';
  import { buildingStore, type TowerStore } from '../../stores/buildingStore.svelte';
  import { TOWERS_DATA } from '../../../../server/src/datas/towersData';
  import { WALLS_DATA } from '../../../../server/src/datas/wallsData';
  
  let selection = $state({ isVisible: false, buildingId: '', type: '' });
  let building = $derived(
    selection.type === 'tower' 
      ? buildingStore.towers[selection.buildingId] 
      : buildingStore.walls[selection.buildingId]
  );
  let data = $derived(
    selection.type === 'tower' 
      ? TOWERS_DATA[building.dataId] 
      : WALLS_DATA[building.dataId]
  )
  let isMine = $derived(building?.ownerId === gameStore.me?.sessionId);
  const notGold = $derived(gameStore.me!.gold < (building as TowerStore).level * 4);

  onMount(() => {
    const handleSelect = (e: any) => {
      selection = e.detail;
    };
    window.addEventListener('select-building', handleSelect);
    return () => window.removeEventListener('select-building', handleSelect);
  });

  $effect(() => {
    if (selection.isVisible && !building) {
      selection.isVisible = false;
    }
  });

  $effect(() => {
    if (selection.isVisible && building?.sellingPending) {
      selection.isVisible = false;
    }
  });

  function handleAction(action: "levelup" | "sell" | "rotate") {
    if (building.sellingPending) return;
    if (action === "levelup") {
      (window as any).phaserGame.events.emit('levelup_building', { buildingId: selection.buildingId });
    } else if (action === "sell") {
      (window as any).phaserGame.events.emit('sell_building', { buildingId: selection.buildingId, buildingType: selection.type });
    } else {
      (window as any).phaserGame.events.emit('rotate_building', { buildingId: selection.buildingId });
    }
  }
</script>

{#if selection.isVisible}
<div 
  class="panel" 
  onclick={(e) => e.stopPropagation()}
  transition:slide={{ axis: "y", duration: 300, easing: cubicIn }}
  tabindex="0"
  role="dialog"
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') selection.isVisible = false;
  }}
>
  <div class="content">
    <header>
      <h3 class="header">{data.name}</h3>
    </header>
    <div class="infos">
      {#if selection.type === "tower"}
      <div class="areas">
        {#if (building as TowerStore).areasModifiers.damage}<p class="area damage">+ {(building as TowerStore).areasModifiers.damage}% damage</p>{/if}
        {#if (building as TowerStore).areasModifiers.attackSpeed}<p class="area attackSpeed">+ {(building as TowerStore).areasModifiers.attackSpeed}% attack speed</p>{/if}
        {#if (building as TowerStore).areasModifiers.range}<p class="area range">+ {(building as TowerStore).areasModifiers.range}% range</p>{/if}
      </div>
      <div class="info-line">
        <div class="item">
          <span class="value">{(building as TowerStore).level}</span>
          <p class="text">level</p>
        </div>
        <div class="item">
          <span class="value">{(building as TowerStore).totalDamage.toLocaleString('fr-FR')}</span>
          <p class="text">total damage</p>
        </div>
      </div>
      <div class="info-line">
        <div class="item">
          <span class="value">{(building as TowerStore).damage}</span>
          <p class="text">damage</p>
        </div>
        <div class="item">
          <span class="value">{(building as TowerStore).totalKills}</span>
          <p class="text">total kills</p>
        </div>
      </div>
      <div class="info-line">
        <div class="item">
          <span class="value">{(building as TowerStore).attackSpeed}</span>
          <p class="text">attack speed</p>
        </div>
        <div class="item">
          <span class="value">{(building as TowerStore).totalCost}</span>
          <p class="text">total cost</p>
        </div>
      </div>
      {:else}
      <p class="text">{data.description}</p>
      {/if}
    </div>
  </div>
  {#if isMine || !building.sellingPending}
  <div class="buttons">
      {#if selection.type === "tower"}
      <button 
        onclick={() => handleAction('levelup')}
        disabled={notGold}
        class:disabled={notGold}
      >
        <p class="shortcut">S</p>
        <div class="image-card">
          <img src="/icons/heart.png" alt="Level up" />
        </div>
        <div class="button-text">
          <p class="title">Level up</p>
          <p class="price" class:disabled={notGold}>{(building as TowerStore).level * 4} 🪙</p>
        </div>
      </button>
      {/if}

      <button onclick={() => handleAction('sell')}>
        <p class="shortcut">S</p>
        <div class="image-card">
          <img src="/icons/heart.png" alt="Sell" />
        </div>
        <div class="button-text">
          <p class="title">Sell</p>
          {#if selection.type === "tower"}
          <p class="price">+{Math.round((building as TowerStore).totalCost * data.sellPercentage / 100)} 🪙</p>
          {:else}
          <p class="price">+{Math.round(data.price * data.sellPercentage / 100)} 🪙</p>
          {/if}
        </div>
      </button>

      {#if selection.type === "tower"}
      {#if data.attack.mode !== "circle"}
      <button class="sell" onclick={() => handleAction('rotate')}>
        <p class="shortcut">S</p>
        <div class="image-card">
          <img src="/icons/heart.png" alt="Rotate" />
        </div>
        <div class="button-text">
          <p class="title">Rotate</p>
        </div>
      </button>
      {/if}
      {/if}
  </div>
  {/if}
</div>
{/if}

<style>
  .panel {
    position: absolute;
    bottom: 0;
    left: 0;
    background: transparent;
    z-index: 1;
    max-height: 90vh;
    /* min-width: 300px;  */
    /* max-width: 600px; */
    contain: layout;
    display: flex;
    gap: 8px;
  }
  .content {
    display: flex;
    flex-direction: column;
    /* min-width: 300px; */
  }
  header {
    background: var(--secondary);
    border: 3px solid var(--secondary-dark);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    padding: 2px 24px;
    width: fit-content;
    align-self: center;
    white-space: nowrap;
  }
  h3 {
    color: var(--text);
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }
  .infos {
    background: var(--primary-light);
    border: 3px solid var(--secondary-dark);
    border-radius: 8px;
    color: #3d2516;
    padding: 16px;
    /* max-height: 88vh;
    overflow-y: auto;
    overflow-x: hidden; */
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .areas {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .area {
    font-size: 10px;
    font-weight: bold;
    font-style: italic;
  }
  .damage {
    color: var(--damage);
  }
  .attackSpeed {
    color: var(--attackSpeed);
  }
  .range {
    color: var(--range);
  }
  .info-line {
    display: grid;
    grid-template-columns: 96px 96px;
    align-items: center;
    gap: 8px;
  }
  .item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .text, .value {
    white-space: nowrap;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .value {
    color: var(--white);
    font-weight: bold;
    font-size: 12px;
  }
  .text {
    color: var(--grey);
    font-size: 10px;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    justify-content: end;
    gap: 8px;
    padding-bottom: 12px;
  }
  button {
    position: relative;
    display: flex;
    align-items: center;
    /* gap: 8px; */
    border-radius: 0 8px 8px 8px;
    overflow: hidden;
    /* cursor: pointer; */
    /* padding: 4px 8px; */
    background: var(--secondary);
    border: 3px solid var(--secondary-dark);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  button:hover {
    box-shadow: 0 0 6px 2px var(--secondary-light);
  }
  .shortcut {
    position: absolute;
    top: 1px;
    left: 4px;
    color: var(--white);
    font-size: 8px;
    font-weight: bold;
  }
  .image-card {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    /* flex: 1;
    padding: 12px; */
  }
  button img {
    max-width: 12px;
    max-height: 12px;
  }
  .button-text {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .title, .price {
    font-size: 10px;
    color: var(--text);
  }
  .title {
    font-weight: bold;
    text-align: left;
    padding: 3px 8px 3px 0;
  }
  .price {
    background-color: var(--secondary-dark);
    text-align: end;
    padding: 2px 8px;
    color: var(--white);
  }
  button.disabled:hover {
    box-shadow: 0 0 6px 2px var(--danger);
    cursor: default;
  }
  .price.disabled {
    color: var(--danger);
  }
</style>