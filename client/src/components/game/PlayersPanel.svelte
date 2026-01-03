<script lang="ts">
  import { PlayerState } from '../../../../server/src/rooms/schema/PlayerState';
  import { getGameRoom } from '../../colyseus/gameRoomService';
  import { gameStore, type PlayerStore } from '../../stores/gameStore.svelte';
  import ViewButton from './ViewButton.svelte';
  import ViewCheckbox from './ViewCheckbox.svelte';

  let { players } = $props<{players: PlayerStore[]}>();
  // const playersList = $derived(Array.from(players.values() as PlayersPanel[]));
  
</script>

<div class="players-panel">
  <div class="header">
    <span class="label">Focus</span>
    <span class="label">Vision</span>
    <div></div>
    <span class="label">Lives</span>
    <span class="label">Kills</span>
    <span class="label">Damage</span>
    <span class="label">Maze duration</span>
    <span class="label">Bonus gold</span>
  </div>
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
      <img src="/icons/heart.png" alt="Player life" class="hud-icon" />
      <p class="hud-text" class:danger={player.lives <= 10 || player.isDefeated}>{player.isDefeated ? "Lost" : player.lives}</p>
    </div>
    <div class="hud-item">
      <img src="/icons/waves.png" alt="Enemies killed during the wave" class="hud-icon" />
      <p class="hud-text">{player.kills}</p>
    </div>
    <div class="hud-item">
      <img src="/icons/settings.png" alt="Damages to enemies during the wave" class="hud-icon" />
      <p class="hud-text">{player.damage}</p>
    </div>
    <div class="hud-item">
      <img src="/icons/settings.png" alt="Time made by enemies during the wave" class="hud-icon" />
      <p class="hud-text">{player.mazeDuration}</p>
    </div>
    <div class="hud-item">
      <img src="/icons/settings.png" alt="Gold bonus for this wave" class="hud-icon" />
      <p class="hud-text">+{player.incomeBonus}</p>
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
    font-size: 8px;
    color: var(--grey);
    font-weight: bold;
    font-style: italic;
    text-align: center;
  }
  .player-line, .header {
    display: grid;
    grid-template-columns: 20px 20px 150px 56px 64px 92px 78px 56px;
    align-items: center;
    gap: 8px;
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
    font-size: 12px;
    font-weight: bold;   
  }
  .player-elo {
    color: var(--grey);
    font-style: italic;
    font-size: 10px;
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
    align-items: center;
    width: 100%;
  }
  .hud-icon {
    background-color: var(--secondary-light);
    padding: 2px;
    border: 2px solid var(--primary-dark);
    border-radius: 50%;
    width: 22px;
    height: 22px;
    object-fit: contain;
    z-index: 2;
  }
  .hud-text {
    flex: 1;
    width: 100%;
    font-weight: bold;
    background-color: var(--primary-dark);
    padding: 2px 8px;
    border-radius: 0 16px 16px 0;
    margin-left: -4px;
    text-align: right;
    font-size: 10px;
    color: var(--white);
    white-space: nowrap;
    text-wrap: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hud-text.danger {
    color: var(--danger);
  }
</style>