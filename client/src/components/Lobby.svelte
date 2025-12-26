<script lang="ts">
  import Chat from "./pages/Chat.svelte";
  import CustomerRow from "./pages/CustomerRow.svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import { network } from "../colyseus/Network";
  import { lobbyStore } from "../stores/lobbyStore.svelte";
  import { addSystemMessage } from "../stores/chatStore.svelte";

  let readyButtonText = $derived(lobbyStore.me?.isReady ? "Not Ready" : "Ready");
  let isHostAndPrivate = $derived(lobbyStore.isPrivate && lobbyStore.hostId === lobbyStore.me?.sessionId);

  function toggleReady() {
    if (lobbyStore.isLocked) return;
    network.sendCustomerReady();
  }

  function hasVotedKick(targetId: string): boolean {
    const votes = lobbyStore.kicks[targetId];
    const mySessionId = lobbyStore.me?.sessionId;
    if (!mySessionId || !votes) return false;
    return votes.includes(mySessionId);
  }

  function invite() {
    if (!lobbyStore.roomId) return;

    const inviteURL = `${window.location.origin}/${lobbyStore.roomId}`;
    navigator.clipboard
      .writeText(inviteURL)
      .then(() => {
        addSystemMessage("Room link copied to clipboard.");
      })
      .catch(() =>
        toast.push("Error to copy invite link.", { classes: ["custom"] })
      );
  }
</script>

<section class="screen lobby-screen">
  <header>
    <h2>Lobby</h2>

    {#if isHostAndPrivate}
      <button class="btn primary" onclick={invite}>
        Invite
      </button>
    {/if}
  </header>

  <div class="lobby-content">
    <div class="lobby-left">
      <div class="players-list">
        {#if lobbyStore.customers.length > 0}
          {#each lobbyStore.customers as customer (customer.sessionId)}
            <CustomerRow
              customer={customer}
              canKick={!lobbyStore.isLocked && !hasVotedKick(customer.sessionId)}
            />
          {/each}
        {:else}
          <p>Waiting for players…</p>
        {/if}
      </div>

      <div class="lobby-controls">
        <button
          class="btn primary"
          class:disabled={lobbyStore.isLocked}
          disabled={lobbyStore.isLocked}
          onclick={toggleReady}
        >
          {readyButtonText}
        </button>

        <button
          class="btn secondary"
          class:disabled={lobbyStore.isLocked}
          disabled={lobbyStore.isLocked}
          onclick={() => network.leaveRoom()}
        >
          Leave
        </button>

        {#if lobbyStore.countdown !== null}
          <div class="countdown">
            START {lobbyStore.countdown}
          </div>
        {:else}
          <div class="countdown hidden">00</div>
        {/if}
      </div>
    </div>

    <div class="lobby-right">
      <Chat />
    </div>
  </div>
</section>

<style>
  .lobby-screen {
    display: flex;
    gap: 18px;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: space-between;
  }
  .lobby-content {
    display: flex;
    gap: 18px;
  }
  .lobby-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .lobby-right {
    flex: 1;
  }
  .players-list {
    background: var(--panel);
    border-radius: 12px;
    padding: 12px;
    min-height: 220px;
    box-shadow: 0 6px 18px rgba(27, 43, 68, 0.04);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .lobby-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 6px;
  }
  .countdown {
    color: var(--success);
    margin-left: auto;
    font-weight: 800;
    padding: 8px 12px;
    border-radius: 8px;
    background: linear-gradient(90deg, #fff4f9, #f0f8ff);
  }
</style>