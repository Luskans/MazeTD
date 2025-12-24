<!-- <script lang="ts">
  type CustomerState = any; // Remplacez par le type réel

  export let c: CustomerState;
  export let id: string;
  export let room: any;
  export let isLocked: boolean;

  import { network } from "../../colyseus/Network";

  $: isKickVoted = room.state.kicks.has(id) && room.state.kicks.get(id)?.includes(room.sessionId);
  $: isDisabled = isKickVoted || isLocked;

  function kick() {
    network.voteKick(id);
  }
</script>

<div class="player-entry" class:host={id === room.sessionId}>
  <div>
    <div style="font-weight:700">
      {#if id === room.state.hostId}👑{/if}
      {c.username ?? "Guest"}
    </div>
    <div class="meta">ELO: {c.elo ?? 1200}</div>
  </div>

  <div class="right" style="display: flex; gap: 8px;">
    <div style="color: {c.isReady ? 'var(--success)' : 'var(--muted)'}">
      {c.isReady ? "✔ READY" : "⏳"}
    </div>

    {#if id !== room.sessionId}
      <button class="btn mini kick" on:click={kick} disabled={isDisabled} class:disabled={isDisabled}>
        Kick
      </button>
    {/if}
  </div>
</div>

<style>
  .player-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #f1f4f9;
  }
  .player-entry .meta {
    color: var(--muted);
    font-size: 13px;
  }
  /* .player-entry.host{ outline: 2px solid rgba(255,159,207,0.12); } */
  .player-entry.host {
    color: var(--primary);
  }
</style> -->







<script lang="ts">
  import { get } from "svelte/store";
  import type { CustomerState } from "../../../../server/src/rooms/schema/CustomerState";
  import { lobbyLocked, lobbyRoom } from "../../stores/lobbyStore";
  import { network } from "../../colyseus/Network";

  const {customer, canKick} = $props<{
    customer: CustomerState;
    canKick: boolean;
  }>();
  const isHost = $derived(customer.sessionId === get(lobbyRoom)?.state.hostId)
  const isReady = $derived(customer.isReady);
  const isSelf = $derived(customer.sessionId === get(lobbyRoom)?.sessionId)
  // const isKickVoted = $derived(get(lobbyRoom)?.state.kicks.has(customer.sessionId) && get(lobbyRoom)?.state.kicks.get(customer.sessionId)?.includes(get(lobbyRoom)?.sessionId));
  // const isLocked = $derived(customer.sessionId === get(lobbyRoom)?.sessionId)
  
  // const isDisabled = $derived(isKickVoted || $lobbyLocked);

  function kick() {
    network.voteKick(customer.sessionId);
  }
</script>

<div class="player-entry" class:host={isHost}>
  <div>
    <div class="username">
      {#if isHost}👑{/if}
      {customer.username ?? "Guest"}
    </div>
    <div class="elo">ELO: {customer.elo ?? 1000}</div>
  </div>

  <div class="right">
    <div class:ready={isReady} class:not-ready={!isReady}>
      {isReady ? "✔ READY" : "⏳"}
    </div>

    {#if !isSelf}
      <button
        class="btn mini kick"
        class:disabled={!canKick}
        onclick={kick}
        disabled={!canKick}
      >
        Kick
      </button>
    {/if}
  </div>
</div>

<style>
  .player-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #f1f4f9;
  }
  .player-entry.host {
    color: var(--primary);
  }
  .username {
    font-weight: bold;
  }
  .elo {
    font-size: 12px;
    color: var(--muted);
  }
  .right {
    display: flex;
    gap: 8px;
  }
  .ready {
    color: var(--success);
  }
  .not-ready {
    color: var(--muted);
  }
</style>
