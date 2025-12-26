<script lang="ts">
  import { network } from "../../colyseus/Network";
  import { lobbyStore, type CustomerStore } from "../../stores/lobbyStore.svelte";

  const {customer, canKick} = $props<{
    customer: CustomerStore;
    canKick: boolean;
  }>();
  const isHost = $derived(customer.sessionId === lobbyStore.hostId)
  const isReady = $derived(customer.isReady);
  const isSelf = $derived(customer.sessionId === lobbyStore.me?.sessionId)

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
