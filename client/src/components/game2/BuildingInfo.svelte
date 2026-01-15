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
  transition:slide={{ axis: "x", duration: 300, easing: cubicIn }}
  tabindex="0"
  role="dialog"
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') selection.isVisible = false;
  }}
>
  <header>
    <h3 class="header">{data.name}</h3>
  </header>
  <div class="content">
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

    {#if isMine || !building.sellingPending}
    <div class="buttons">
      {#if selection.type === "tower"}
      <button 
        onclick={() => handleAction('levelup')}
        disabled={notGold}
        class:disabled={notGold}
      >
        <!-- <p class="shortcut">S</p> -->
        <!-- <img class="button-icon" src="/icons/heart.png" alt="Level up" /> -->
        <div class="button-icon-wrapper levelup">
          <div class='button-icon levelup' style="mask-image: url('/icons/levelup.png'); -webkit-mask-image: url('/icons/levelup.png');"></div>
        </div>
        <div class="button-content">
          <p class="button-text">Level up</p>
          <div class="button-price-wrapper">
            <span class="button-price" class:disabled={notGold}>{(building as TowerStore).level * 4}</span>
            <img src="/icons/income.png" alt="Gold" class="button-price-icon" />
          </div>
        </div>
      </button>
      {/if}

      <button onclick={() => handleAction('sell')}>
        <!-- <p class="shortcut">S</p> -->
        <!-- <img class="button-icon" src="/icons/heart.png" alt="Sell" /> -->
        <div class="button-icon-wrapper">
          <div class='button-icon' style="mask-image: url('/icons/sell.png'); -webkit-mask-image: url('/icons/sell.png');"></div>
        </div>
        <div class="button-content">
          <p class="button-text">Sell</p>
          {#if selection.type === "tower"}
          <div class="button-price-wrapper">
            <p class="button-price">+{Math.round((building as TowerStore).totalCost * data.sellPercentage / 100)}</p>
            <img src="/icons/income.png" alt="Gold" class="button-price-icon" />
          </div>
          {:else}
          <div class="button-price-wrapper">
            <p class="button-price">+{Math.round(data.price * data.sellPercentage / 100)}</p>
            <img src="/icons/income.png" alt="Gold" class="button-price-icon" />
          </div>
          {/if}
        </div>
      </button>

      {#if selection.type === "tower"}
      {#if data.attack.mode !== "circle"}
      <button class="sell" onclick={() => handleAction('rotate')}>
        <!-- <p class="shortcut">S</p> -->
        <!-- <img class="button-icon" src="/icons/heart.png" alt="Rotate" /> -->
        <div class="button-icon-wrapper">
          <div class='button-icon' style="mask-image: url('/icons/rotate.png'); -webkit-mask-image: url('/icons/rotate.png');"></div>
        </div>
        <div class="button-content">
          <p class="button-text">Rotate</p>
        </div>
      </button>
      {/if}
      {/if}
    </div>
    {/if}
  </div>
</div>
{/if}

<style>
  .panel {
    position: absolute;
    top: 60px;
    left: 0;
    background: transparent;
    z-index: 1;
    contain: layout;
    display: flex;
    flex-direction: column;
  }
  .content {
    display: flex;
    gap: 8px;
  }
  header {
    background: var(--primary);
    padding: 2px 0px;
    width: 180px;
    text-align: center;
    white-space: nowrap;
  }
  h3 {
    color: var(--secondary-light);
    font-size: 16px;
    font-weight: bold;
  }
  .infos {
    background: var(--primary);
    border-radius: 0 4px 4px 0;
    padding: 16px;
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
    font-size: 10px;
  }
  .text {
    color: var(--grey);
    font-size: 10px;
  }
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  button {
    display: flex;
    align-items: center;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    background: var(--primary);
    transition: transform 0.2s ease;
    color: var(--white);
    font-size: 10px;
    font-weight: bold;
    width: 100%;
    border: none;
  }
  button:hover {
    transform: scale(1.05);
  }
  .button-icon-wrapper {
    padding: 6px;
  }
  .button-icon-wrapper.levelup {
    padding: 4px;
  }
  .button-icon {
    width: 18px;
    height: 18px;
    align-self: center;
    background-color: var(--secondary-light);
    -webkit-mask-size: contain;
    mask-size: contain;
    mask-repeat: no-repeat;
    transition: background-color 0.2s ease;
  }
  .button-icon.levelup {
    width: 22px;
    height: 22px;
  }
  .button-content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .button-text {
    text-align: left;
    padding: 4px 8px 4px 0;
  }
  .button-price-wrapper {
    display: flex;
    align-items: center;
    justify-content: end;
    background-color: var(--primary-light);
    padding: 3px 8px;
    gap: 4px;
  }
  .button-price-icon {
    width: 16px;
    height: 16px;
  }
  button.disabled:hover {
    box-shadow: 0 0 6px 2px var(--danger);
    cursor: default;
  }
  .button-price.disabled {
    color: var(--danger);
  }
  /* .shortcut {
    position: absolute;
    top: 1px;
    left: 4px;
    color: var(--white);
    font-size: 8px;
    font-weight: bold;
  } */
</style>