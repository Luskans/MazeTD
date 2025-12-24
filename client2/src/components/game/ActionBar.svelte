<script lang="ts">
  import type { PlayerState } from "../../../../server/src/rooms/schema/PlayerState";
  import Button from "./Button.svelte";

  let { player, activePanel, onButtonClick } = $props<{
    player: PlayerState,
    activePanel: "players" | "shop" | "waves" | "settings" | null,
    onButtonClick: (panel: "players" | "shop" | "waves" | "settings") => void
  }>();
  $inspect(player.gold);
</script>

{#if player}
<div class="hud-resources">
  <div class="hud-item">
    <img src="/icons/heart.png" alt="Life" class="hud-icon" />
    <p class="hud-text" class:danger={player.life <= 10}>{player.life}</p>
  </div>
  <div class="hud-item">
    <img src="/icons/gold.png" alt="Gold" class="hud-icon" />
    <p class="hud-text">{player.gold}</p>
  </div>
  <div class="hud-item">
    <img src="/icons/income.png" alt="Income" class="hud-icon" />
    <p class="hud-text">{player.income}</p>
  </div>
  <div class="hud-item">
    <img src="/icons/tower.png" alt="Population" class="hud-icon" />
    <p class="hud-text" class:danger={player.population == player.maxPopulation}>{player.population}/{player.maxPopulation}</p>
  </div>
</div>
{/if}
<div class="buttons">
  <Button 
    image="players"
    shortcut="Q"
    active={activePanel === 'players'}
    onclick={() => onButtonClick('players')} 
  />
  <Button 
    image="shop"
    shortcut="W"
    active={activePanel === 'shop'}
    onclick={() => onButtonClick('shop')}
  />
  <Button 
    image="waves"
    shortcut="E"
    active={activePanel === 'waves'}
    onclick={() => onButtonClick('waves')} 
  />
  <Button 
    image="settings"
    shortcut=""
    active={activePanel === 'settings'}
    onclick={() => onButtonClick('settings')} 
  />
</div>

<style>
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .hud-resources {
    display: flex;
    flex-direction: column;
    gap: 8px;
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