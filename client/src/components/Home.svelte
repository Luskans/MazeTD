<script lang="ts">
  import { network } from '../colyseus/Network';
  import { getOrCreateUID, getUsername, isUsernameValid, setUsername } from '../colyseus/Customer';
  import Leaderboard from './pages/Leaderboard.svelte';
  import { toast } from '@zerodevx/svelte-toast'
    import { AudioService } from '../services/AudioService';

  let username = $state<string | null>(getUsername());
  let usernameInput = $state('');
  let usernameError = $state<string | null>(null);
  let isJoining = $state(false);
  let canPlay = $derived(() => !!username || usernameInput.length > 0);

  function ensureUsername(): string | null {
    if (username) return username;

    if (!isUsernameValid(usernameInput)) {
      usernameError = 'Invalid username';
      toast.push('Invalid username.', { classes: ['custom'] });
      return null;
    }

    setUsername(usernameInput)
    return getUsername();
  }

  async function joinLobby(isPrivate: boolean) {
    if (isJoining) return;
    isJoining = true;

    const uid = getOrCreateUID();
    const username = ensureUsername();

    if (!username) {
      isJoining = false;
      return;
    }

    // AudioService.getInstance().playSFX('connect')

    try {
      const roomIdFromUrl = window.location.pathname.slice(1);
      (isPrivate)
        ? await network.createPrivateLobby({ uid: uid, username: username, isPrivate: true })
        : roomIdFromUrl
          ? await network.joinPrivateLobbyById(roomIdFromUrl, { uid: uid, username: username })
          : await network.joinPublicLobby({ uid: uid, username: username, isPrivate: false });

    } catch (e: any) {
      const errorMessage = (e.code = 4212) ? "The lobby is full." : (e.message || "Error joining lobby.");
      toast.push({ msg: errorMessage, classes: ['custom'] });
    } finally {
      isJoining = false;
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
          <input
            value={usernameInput}
            oninput={(e) => {
              usernameInput = (e.target as HTMLInputElement).value;
              usernameError = null;
            }}
            class:error={!!usernameError}
            placeholder="Username"
          />
          {#if usernameError}
          <p class="error-message">{usernameError}</p>
          {/if}
          <p class="input-infos">2-20 characters, letters and numbers only</p>
        </div>
        {/if}

        <button
          class="btn primary"
          disabled={!canPlay || isJoining}
          onclick={() => joinLobby(false)}
          onmouseenter={() => AudioService.getInstance().playSFX('hover')}
        >
          {isJoining ? 'Joining...' : 'Play'}
        </button>

        <button
          class="btn secondary"
          disabled={!canPlay || isJoining}
          onclick={() => joinLobby(true)}
          onmouseenter={() => AudioService.getInstance().playSFX('hover')}
        >
          {isJoining ? 'Joining...' : 'Create private room'}
        </button>
      </div>
    </div>

    <Leaderboard currentName={username ?? ''} />
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