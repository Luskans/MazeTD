<script lang="ts">
  let { playerIndex } = $props<{ playerIndex: number }>();

  function handleClick() {
    if ((window as any).phaserGame) {
      (window as any).phaserGame.events.emit('focus_on_player', playerIndex);
    }
  }
</script>

<button onclick={handleClick}>
  <!-- <img src="/icons/target.png" alt="Focus" /> -->
  <p class="shortcut">{playerIndex + 1}</p>
</button>

<style>
  button {
    position: relative;
    cursor: pointer;
    background: var(--primary-dark);
    border-radius: 0 4px 4px 4px;
    transition: all 0.2s ease;
    overflow: hidden;
    border: 1px solid var(--primary-dark);
    width: 22px;
    height: 22px;
  }
  button:hover {
    box-shadow: 0 0 6px 2px var(--secondary-light);
  }
  .shortcut {
    position: absolute;
    top: 1px;
    left: 4px;
    color: var(--grey);
    font-size: 8px;
    font-weight: bold;
  }
</style>