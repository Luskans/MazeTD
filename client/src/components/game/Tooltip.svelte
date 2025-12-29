<script lang="ts">
  import type { TowerType } from "../../../../server/src/types/towersType";
  let { data, level, cost, value, nextCost, nextValue } = $props<{
    data: TowerType,
    level?: number,
    cost?: number,
    value?: number,
    nextCost?: number,
    nextValue?: number
  }>();
  let mousePos = $state({ x: 0, y: 0 });

  function handleMouseMove(e: MouseEvent) {
    // mousePos = { x: e.clientX + 15, y: e.clientY + 15 };
    mousePos = { x: e.clientX - 85, y: e.clientY };
  }

  // const colorMap: Record<string, string> = {
  //   'very low': 'very-low',
  //   'low': 'low',
  //   'medium': 'medium',
  //   'high': 'high',
  //   'very high': 'very-high'
  // };
  // const getIndiceColor = (indice: string) => colorMap[indice] ?? 'grey';

  // const indiceToScore = (info: string | number): number => {
  //   if (typeof info === 'number') return info;
  //   const map: Record<string, number> = {
  //     'very low': 1,
  //     'low': 2,
  //     'medium': 3,
  //     'high': 4,
  //     'very high': 5
  //   };
  //   return map[info.toLowerCase()] ?? 0;
  // };
</script>

<svelte:window onmousemove={handleMouseMove} />

{#snippet statBar(label: string, info: number)}
  <!-- {@const score = indiceToScore(info)} -->
  <div class="stat-row">
    <span class="stat-label">{label} :</span>
    <div class="bar-container">
      {#each Array(5) as _, i}
        <span class="segment" class:active={i < info}></span>
      {/each}
    </div>
  </div>
{/snippet}

<div class="tooltip" style="left: {mousePos.x}px; top: {mousePos.y}px;">
  <h4>{data.name}</h4>
  <div class="tags">
    {#if level}<p class="level">Level: <span class="value">{level}</span></p>{/if}
    {#if data.targeting?.mode}<span class="tag grey">{data.targeting.mode}</span>{/if}
    {#if data.targeting?.canTargetGround}<span class="tag grey">ground</span>{/if}
    {#if data.targeting?.canTargetAir}<span class="tag grey">air</span>{/if}
  </div>
  <hr />
  <div class="descriptions">
    <p class="description">{data.description || 'A building.'}</p>
    {#if data.description2}<p class="description">{data.description2}</p>{/if}
  </div>
  <div class="stats">
    <!-- {#if data.stats?.damageInfo}<p class="stat">Damage: <span class="tag {getIndiceColor(data.stats.damageInfo)}">{data.stats.damageInfo}</span></p>{/if}
    {#if data.stats?.attackSpeedInfo}<p class="stat">Attack speed: <span class="tag {getIndiceColor(data.stats.attackSpeedInfo)}">{data.stats.attackSpeedInfo}</span></p>{/if}
    {#if data.stats?.rangeInfo}<p class="stat">Range: <span class="tag {getIndiceColor(data.stats.rangeInfo)}">{data.stats.rangeInfo}</span></p>{/if}
    {#if data.splash?.enabled}<p class="stat">Splash: <span class="tag {getIndiceColor(data.splash.info)}">{data.splash.info}</span></p>{/if}
    {#if data.chain?.enabled}<p class="stat">Chain: <span class="tag {getIndiceColor(data.chain.info)}">{data.chain.info}</span></p>{/if}
    {#if data.pierce?.enabled}<p class="stat">Pierce: <span class="tag {getIndiceColor(data.pierce.info)}">{data.pierce.info}</span></p>{/if} -->
  
    {#if data.stats?.damageInfo}{@render statBar("Damage", data.stats.damageInfo)}{/if}
    {#if data.stats?.attackSpeedInfo}{@render statBar("Attack Speed", data.stats.attackSpeedInfo)}{/if}
    {#if data.stats?.rangeInfo}{@render statBar("Range", data.stats.rangeInfo)}{/if}
    {#if data.splash?.enabled}{@render statBar("Splash", data.splash.info)}{/if}
    {#if data.chain?.enabled}{@render statBar("Chain", data.chain.info)}{/if}
    {#if data.pierce?.enabled}{@render statBar("Pierce", data.pierce.info)}{/if}
  </div>
  {#if value || value === 0}<p class="stat">Current value : <span class="value">+{value}</span></p>{/if}
  <!-- {#if cost}<p class="stat">Current price: <span class="value">{cost}</span></p>{/if}
  {#if nextValue}<p class="stat">Next value: <span class="value">{nextValue}</span></p>{/if}
  {#if nextCost}<p class="stat">Next cost: <span class="value">{nextCost}</span></p>{/if} -->
</div>

<style>
  /* .tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 10px;
    border: 2px solid #444;
    border-radius: 4px;
    pointer-events: none;
    z-index: 9999;
    min-width: 150px;
  } */
  .tooltip {
    position: fixed;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: var(--primary-dark);
    padding: 10px;
    border: 2px solid var(--primary-light);
    border-radius: 4px;
    pointer-events: none;
    z-index: 9999;
    width: 280px;
    /* min-width: 150px;
    max-width: 300px; */
  }
  h4 {
    color: var(--white);
    font-size: 14px;
  }
  .level {
    color: var(--white);
    font-size: 12px;
  }
  .description {
    color: var(--grey);
    font-size: 12px;
    font-style: italic;
  }
  .stats, .descriptions {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .stat {
    color: var(--white);
    font-size: 12px;
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
  }
  .value {
    font-weight: bold;
  }
  .grey {
    background: var(--grey);
  }
  .stat-row {
    display: grid;
    grid-template-columns: 70px 156px;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 10px;
  }
  .stat-label {
    color: var(--white);
  }
  .bar-container {
    display: flex;
    gap: 4px;
  }
  .segment {
    width: 12px;
    height: 6px;
    /* background: #333; */
    background: var(--primary);
    border-radius: 2px;
  }
  .segment.active {
    background: var(--grey);
  }
</style>