<script lang="ts">
  import { network } from '../services/network';
  import { getOrCreateUID, getUsername, setUsername } from '../services/player';
  import { screen, currentRoom } from '../stores/ui';
  import Leaderboard from './Leaderboard.svelte';
  import { toast } from '@zerodevx/svelte-toast'

  let username = getUsername() ?? '';
  let usernameInput = '';
  let usernameError: string | null = null;

  async function joinPublic() {
    const pathName = window.location.pathname;
    const roomId = pathName.substring(1);
    let username = getUsername();
    const uid = getOrCreateUID();

    if (!username) {
      if (!setUsername(usernameInput)) {
        // alert('Invalid username');
        toast.push('Invalid username.', { classes: ['custom'] })
        return;
      }
      username = getUsername();
    }

    try {
      let room;
      if (roomId) {
        room = await network.joinPrivateLobbyById(roomId, { uid: uid, username: username });
        console.log(`Connection du joueur ${username} au lobby privé ${room.roomId} réussie.`);
      } else {
        room = await network.joinPublicLobby({ uid: uid, username : username, isPrivate: false });
        console.log(`Connection du joueur ${username} au lobby public ${room.roomId} réussie.`);
      }
      currentRoom.set(room);
      screen.set('lobby');

    } catch (e: any) {
      console.error("Error join public:", e);
      const errorMessage = (e.code = 4212) ? "The lobby is full." : (e.message || "Error to join the lobby.");
      toast.push({ msg: errorMessage, classes: ['custom'] });
    }
  }

  async function createPrivate() {
    let username = getUsername();
    const uid = getOrCreateUID();

    if (!username) {
      if (!setUsername(usernameInput)) {
        toast.push('Invalid username.', { classes: ['custom'] })
        return;
      }
      username = getUsername();
    }

    try {
      const room = await network.createPrivateLobby({ uid: uid, username: username, isPrivate: true });
      console.log(`Création du lobby privé ${room.roomId} par le joueur ${username} réussie.`);
      currentRoom.set(room);
      screen.set('lobby');

    } catch (e) {
      console.error("Error create private:", e);
      toast.push("Error to create a private lobby.", { classes: ['custom'] })
    }
  }
</script>

<section class="screen home-screen">
  <header>
    <h1>Tower Brawl</h1>
    <p class="subtitle">Competitive Tower Defense — play with friends or survive in solo</p>
  </header>


  <div class="home-body">
    <div class="home-actions">
      <div class="home-actions-inside">
        {#if username}
        <p>Welcome back {username}</p>
        {:else}
        <div class="input-row">
          <input bind:value={usernameInput} on:input={() => usernameError = null} class:error={usernameError}/>
          {#if usernameError}
            <p class="error-message">{usernameError}</p>
          {/if}
          <p class="input-infos">2-20 characters, letters and numbers only</p>
        </div>
        {/if}

        <button class="btn primary" on:click={joinPublic}>Play</button>
        <button class="btn secondary" on:click={createPrivate}>Create private room</button>
      </div>
    </div>

    <Leaderboard currentName={username} />
  </div>
</section>

<style>
  .home-screen header {
    text-align: center;
  }
  .home-screen .home-body {
    display: flex;
    gap: 18px;
    flex: 1;
  }
  h1 {
    margin: 0;
    font-size: 40px;
    color: var(--text);
  }
  .subtitle {
    margin: 6px 0 0;
    color: var(--muted);
  }
  .home-actions {
    display: flex;
    justify-content: center;
    flex: 1;
  }
  .home-actions-inside {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    margin-top: 8px;
    flex-wrap: wrap;
    width: 300px;
  }
  .input-row {
    width: 100%;
  }
  input { 
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid #e3e8f0;
    outline: none;
    font-size: 14px;
    width: 100%;
  }
  input:focus {
    box-shadow: 0 0 0 4px rgba(106,160,255,0.12);
  }
  button { 
    width:100% ;
  }
  .input-infos { 
    font-size: 12px;
    font-style: italic;
    color: var(--muted);
    margin: 0px;
    padding-left: 8px;
  }
</style>