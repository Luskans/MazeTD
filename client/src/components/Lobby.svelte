<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { currentRoom, screen } from "../stores/ui";
  import { network } from "../services/network";
  import Chat from "./Chat.svelte";
  import CustomerRow from "./CustomerRow.svelte";
  import { getStateCallbacks } from "colyseus.js";
  import { toast } from '@zerodevx/svelte-toast';
  import { createGame, getGame } from "../game/phaser";


  type LobbyState = any;
  type CustomerState = any;

  $: room = $currentRoom;

  let customersEntries: [string, CustomerState][] = [];
  let isLocked: boolean = false;
  let countdown: number | null = null;
  let chatComponent: any;

  $: myPlayer = customersEntries.find(([id, p]) => id === room?.sessionId)?.[1];
  $: readyButtonText = myPlayer?.isReady ? "Not Ready" : "Ready";

  $: isHostAndPrivate = room && room.state.isPrivate && room.sessionId === room.state.hostId;

  // --- Fonctions de Contrôle ---

  function leave() {
    network.leaveRoom();
    screen.set("home");
  }

  function toggleReady() {
    if (isLocked) return;
    network.toggleReady();
  }

  // --- Logique d'État Colyseus (listenStates) ---

  function updateCustomersList() {
    if (room?.state?.customers) {
      customersEntries = Array.from(room.state.customers.entries());
    }
  }

  function handleInviteClick() {
    if (!room) return;
    const inviteURL = `${window.location.origin}/${room.roomId}`;
    navigator.clipboard
      .writeText(inviteURL)
      .then(() => {
        if (chatComponent) {
          chatComponent.appendSys(`Room link copied to clipboard.`);
        }
      })
      .catch(() => toast.push("Error to copy the invite link.", { classes: ['custom'] }));
  }

  function onCountdown(sec: number) {
    countdown = sec;
    isLocked = sec <= 3;
  }

  function onCountdown_stop() {
    countdown = null;
    isLocked = false;
  }

  onMount(() => {
    if (!room) return;

    const stateCallback = getStateCallbacks(room);
    let listeners: Function[] = [];

    listeners.push(
      stateCallback(room.state.customers).onAdd((p: CustomerState, id: string) => {
        stateCallback(p).onChange(() => updateCustomersList());
        updateCustomersList();
      }),
    );

    listeners.push(
      stateCallback(room.state.customers).onRemove((p: CustomerState, id: string) => {
        updateCustomersList();
        if (room?.sessionId === id) {
          console.log("Déconnexion ou kick détecté.");
          leave();
        }
      }),
    );

    listeners.push(room.onMessage("countdown", onCountdown));
    listeners.push(room.onMessage("countdown_stop", onCountdown_stop));

    listeners.push(
      room.onMessage("kicked", (msg: string) => {
        toast.push("You were kicked from this lobby.", { classes: ['custom'] })
        network.leaveRoom();
        screen.set("home");
      }),
    );

    listeners.push(
      room.onMessage("start_game", async ({ roomId }: any) => {
        network.leaveRoom();

        await createGame();
        const game = getGame();
        if (!game) return;
        
        game.scene.start("LoadingScene", { 
            roomId, 
            options: { uid: myPlayer.uid, username: myPlayer.username, elo: myPlayer.elo } 
        });
        screen.set("game");
      }),
    );

    listeners.push(room.onStateChange(() => {
      room = room;
      updateCustomersList();
    }));

    updateCustomersList();

    // return () => {
    //   listeners.forEach((unsubscribe) => unsubscribe());
    // };
  });
  
</script>

<section class="screen lobby-screen">
  <header>
    <h2>Lobby</h2>
    <div id="invite-container">
      {#if isHostAndPrivate}
        <button class="btn primary" on:click={handleInviteClick}>Invite</button>
      {/if}
    </div>
  </header>

  <div class="lobby-content">
    <div class="lobby-left">
      <div class="players-list">
        {#if customersEntries.length > 0} 
          {#each customersEntries as [id, c] (id)}
            <CustomerRow c={c} id={id} room={room} isLocked={isLocked} />
          {/each}
        {:else}
          <p>Waiting for players...</p> 
        {/if}
      </div>

      <div class="lobby-controls">
        <button class="btn primary" on:click={toggleReady} disabled={isLocked}>
          {readyButtonText}
        </button>
        <button class="btn secondary" on:click={leave} disabled={isLocked}>
          Leave
        </button>

        {#if countdown}
          <div class="countdown">START {countdown}</div>
        {:else}
          <div class="countdown hidden">00</div>
        {/if}
      </div>
    </div>

    <div class="lobby-right">
      <Chat {room} bind:this={chatComponent} />
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
