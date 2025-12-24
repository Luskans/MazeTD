<!-- <script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { currentRoom, playerData, screen } from "../stores/GlobalVariables";
  import { network } from "../colyseus/Network";
  import Chat from "./pages/Chat.svelte";
  import CustomerRow from "./pages/CustomerRow.svelte";
  import { getStateCallbacks } from "colyseus.js";
  import { toast } from '@zerodevx/svelte-toast';
  import { createGame, getGame } from "../services/PhaserService";
  import type { CustomerState } from "../../../server/src/rooms/schema/CustomerState";

  $: room = $currentRoom;

  let customersEntries: [string, CustomerState][] = [];
  let isLocked: boolean = false;
  let countdown: number | null = null;
  let chatComponent: any;

  $: myPlayer = customersEntries.find(([id, p]) => id === room?.sessionId)?.[1];
  $: readyButtonText = myPlayer?.isReady ? "Not Ready" : "Ready";
  $: isHostAndPrivate = room && room.state.isPrivate && room.sessionId === room.state.hostId;

  function leave() {
    network.leaveRoom();
    screen.set("home");
  }

  function toggleReady() {
    if (isLocked) return;
    network.toggleReady();
  }

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

    const _ = getStateCallbacks(room);
    // let listeners: Function[] = [];

    // listeners.push(
    //   stateCallback(room.state.customers).onAdd((p: CustomerState, id: string) => {
    //     stateCallback(p).onChange(() => updateCustomersList());
    //     updateCustomersList();
    //   }),
    // );
    

    // listeners.push(
    //   stateCallback(room.state.customers).onRemove((p: CustomerState, id: string) => {
    //     updateCustomersList();
    //     if (room?.sessionId === id) {
    //       console.log("Déconnexion ou kick détecté.");
    //       leave();
    //     }
    //   }),
    // );

    // listeners.push(room.onMessage("countdown", onCountdown));
    // listeners.push(room.onMessage("countdown_stop", onCountdown_stop));

    // listeners.push(
    //   room.onMessage("kicked", (msg: string) => {
    //     toast.push("You were kicked from this lobby.", { classes: ['custom'] })
    //     network.leaveRoom();
    //     screen.set("home");
    //   }),
    // );

    // listeners.push(
    //   room.onMessage("start_game", async ({ roomId }: any) => {
    //     network.leaveRoom();

    //     await createGame();
    //     const game = getGame();
    //     if (!game) return;
        
    //     game.scene.start("LoadingScene", { 
    //         roomId, 
    //         options: { uid: myPlayer!.uid, username: myPlayer!.username, elo: myPlayer!.elo } 
    //     });
    //     screen.set("game");
    //   }),
    // );

    // listeners.push(room.onStateChange(() => {
    //   room = room;
    //   updateCustomersList();
    // }));

    _(room.state.customers).onAdd((p: CustomerState, id: string) => {
       _(p).onChange(() => {
        updateCustomersList()
      });
      updateCustomersList()
    });
    _(room.state.customers).onRemove((p: CustomerState, id: string) => {
      updateCustomersList();
    });
    room.onStateChange(() => {
      room = room;
      updateCustomersList();
    });
    room.onMessage("countdown", onCountdown);
    room.onMessage("countdown_stop", onCountdown_stop);
    room.onMessage("kicked", () => {
      toast.push("You were kicked from this lobby.", { classes: ['custom'] })
      leave();
    });
    room.onMessage("start_game", ({ roomId }: any) => {
      network.leaveRoom();
      screen.set("game");
      // createGame();
      // let game = getGame();
      // if (!game) return;
      playerData.set({
        roomId: roomId,
        uid: myPlayer!.uid,
        username: myPlayer!.username,
        elo: myPlayer!.elo
      });
      
      // game.scene.start("LoadingScene", { 
      //     roomId, 
      //     options: { uid: myPlayer!.uid, username: myPlayer!.username, elo: myPlayer!.elo } 
      // });
    });


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
</style> -->
















<script lang="ts">
  import Chat from "./pages/Chat.svelte";
  import CustomerRow from "./pages/CustomerRow.svelte";
  import { toast } from "@zerodevx/svelte-toast";
  import {
    lobbyRoom,
    lobbyCustomers,
    lobbyCountdown,
    lobbyLocked,
    myLobbyPlayer,
    isHostAndPrivate
  } from "../stores/lobbyStore";
  import { network } from "../colyseus/Network";
  import { screenStore } from "../stores/screenStore";
  import { get } from "svelte/store";

  let chatComponent = $state<any>(null);
  let readyButtonText = $derived($myLobbyPlayer?.isReady ? "Not Ready" : "Ready");
  let test = $derived($isHostAndPrivate);
  function leave() {
    network.leaveRoom();
    screenStore.set("home");
  }

  function toggleReady() {
    if ($lobbyLocked) return;
    network.toggleReady();
  }

  function hasVotedKick(id: string): boolean {
    const votes = get(lobbyRoom)?.state?.kicks?.get(id);
    return votes?.includes(get(myLobbyPlayer)?.sessionId) ?? false;
  }

  function invite() {
    if (!$lobbyRoom) return;

    const inviteURL = `${window.location.origin}/${$lobbyRoom.roomId}`;
    navigator.clipboard
      .writeText(inviteURL)
      .then(() => {
        chatComponent?.appendSys?.("Room link copied to clipboard.");
      })
      .catch(() =>
        toast.push("Error to copy invite link.", { classes: ["custom"] })
      );
  }
</script>

<section class="screen lobby-screen">
  <header>
    <h2>Lobby</h2>

    {#if test}
      <button class="btn primary" onclick={invite}>
        Invite
      </button>
    {/if}
  </header>

  <div class="lobby-content">
    <div class="lobby-left">
      <div class="players-list">
        {#if $lobbyCustomers.length > 0}
          {#each $lobbyCustomers as customer (customer.sessionId)}
            <CustomerRow
              customer={customer}
              canKick={!$lobbyLocked && !hasVotedKick(customer.sessionId)}
            />
          {/each}
        {:else}
          <p>Waiting for players…</p>
        {/if}
      </div>

      <div class="lobby-controls">
        <button
          class="btn primary"
          class:disabled={$lobbyLocked}
          disabled={$lobbyLocked}
          onclick={toggleReady}
        >
          {readyButtonText}
        </button>

        <button
          class="btn secondary"
          class:disabled={$lobbyLocked}
          disabled={$lobbyLocked}
          onclick={leave}
        >
          Leave
        </button>

        {#if $lobbyCountdown !== null}
          <div class="countdown">
            START {$lobbyCountdown}
          </div>
        {:else}
          <div class="countdown hidden">00</div>
        {/if}
      </div>
    </div>

    <div class="lobby-right">
      <Chat room={$lobbyRoom} bind:this={chatComponent} />
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