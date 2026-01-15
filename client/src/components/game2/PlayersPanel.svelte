<script lang="ts">
  import { gameStore, type PlayerStore } from '../../stores/gameStore.svelte';
  import ViewButton from './ViewButton.svelte';
  import ViewCheckbox from './ViewCheckbox.svelte';

  let { players } = $props<{players: PlayerStore[]}>();
  // const playersList = $derived(Array.from(players.values() as PlayersPanel[]));
  
</script>

<div class="players-panel">
  <div class="header">
    <span class="label-text">Focus</span>
    <span class="label-text">Vision</span>
    <div></div>
    <div class="label">
      <img src="/icons/heart.png" alt="Lives" class="label-icon" />
      <span class="label-text">Lives</span>
    </div>
    <div class="label">
      <img src="/icons/kills.png" alt="Kills" class="label-icon" />
      <span class="label-text">Kills</span>
    </div>
    <div class="label">
      <img src="/icons/damage.png" alt="Damage" class="label-icon" />
      <span class="label-text">Damage</span>
    </div>
    <div class="label">
      <img src="/icons/maze.png" alt="Maze duration" class="label-icon" />
      <span class="label-text">Maze duration</span>
    </div>
    <div class="label">
      <img src="/icons/income.png" alt="Bonus income" class="label-icon" />
      <span class="label-text">Bonus gold</span>
    </div>
  </div>
  <hr>
  {#each players as player, index (player.sessionId)}
  <div class="player-line">
    <ViewButton playerIndex={index}/>
    
    {#if !(player.sessionId === gameStore.me?.sessionId) && (!player.isDisconnected)}
    <ViewCheckbox player={player} />
    {:else}
    <span></span>
    {/if}

    <div class="player-item">
      <p 
        class="player-name"
        class:disconnected={player.isDisconnected}
        class:ready={player.isReady}
      >
        <span class="player-elo" class:disconnected={player.isDisconnected}>{(player.elo)} - </span> {player.username}
      </p>
    </div>
    <div class="hud-item">
      <div class="hud-stats">
        <p class="hud-flat" class:danger={player.lives <= 10 || player.isDefeated}>{player.isDefeated ? "Lost" : player.lives}</p>
        <!-- <p class="hud-percent">%</p> -->
      </div>
      <div class="hud-bar">
        <div class="hud-progress" style="width: 10%"></div>
      </div>
    </div>
    <div class="hud-item">
      <div class="hud-stats">
        <p class="hud-flat">{player.kills}</p>
        <!-- <p class="hud-percent">%</p> -->
      </div>
      <div class="hud-bar">
        <div class="hud-progress" style="width: 10%"></div>
      </div>
    </div>
    <div class="hud-item">
      <div class="hud-stats">
        <p class="hud-flat">{player.damage}</p>
        <!-- <p class="hud-percent">%</p> -->
      </div>
      <div class="hud-bar">
        <div class="hud-progress" style="width: 60%"></div>
      </div>
    </div>
    <div class="hud-item">
      <div class="hud-stats">
        <p class="hud-flat">{player.mazeDuration}</p>
        <!-- <p class="hud-percent">%</p> -->
      </div>
      <div class="hud-bar">
        <div class="hud-progress" style="width: 20%"></div>
      </div>
    </div>
    <div class="hud-item">
      <div class="hud-stats">
        <p class="hud-flat">+{player.incomeBonus}</p>
        <!-- <p class="hud-percent">%</p> -->
      </div>
      <div class="hud-bar">
        <div class="hud-progress" style="width: 30%"></div>
      </div>
    </div>
  </div>
  {/each}
</div>

<style>
  .players-panel {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .label {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .label-text {
    font-size: 8px;
    color: var(--grey);
    font-weight: bold;
    font-style: italic;
    text-align: center;
  }
  .label-icon {
    width: 16px;
    height: 16px;
  }
  .player-line, .header {
    display: grid;
    grid-template-columns: 20px 20px 120px 64px 64px 64px 64px 64px;
    align-items: end;
    gap: 8px;
    height: 20px;
  }
  .player-item {
    max-width: 192px;
    text-wrap: nowrap;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .player-name {
    color: var(--white);
    font-size: 10px;
    font-weight: bold;   
  }
  .player-elo {
    color: var(--grey);
    font-style: italic;
    font-size: 8px;
    font-weight: bold;
  }
  .disconnected {
    color: var(--grey-dark);
  }
  .danger {
    color: var(--danger);
  }
  .ready {
    color: var(--success);
  }
  .hud-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
  .hud-stats {
    display: flex;
    justify-content: space-between;
    color: var(--white);
    font-size: 10px;
    font-weight: bold;
    width: 100%;
    padding-left: 3px;
  }
  .hud-flat {
    color: var(--white);
    font-size: 8px;
    white-space: nowrap;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hud-bar {
    position: relative;
    width: 60px;
    height: 10px;
    background: var(--primary-dark);
    overflow: hidden;
  }
  .hud-progress {
    height: 100%;
    /* background: linear-gradient(90deg, var(--secondary), var(--secondary-light)); */
    background-color: var(--secondary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: width 0.2s linear;
  }
</style>