<script lang="ts">
  let { playerIndex } = $props<{ playerIndex: number }>();

  function handleClick() {
    if ((window as any).phaserGame) {
      (window as any).phaserGame.events.emit('focus_on_player', playerIndex);
    }
  }
</script>

<button onclick={handleClick}>
  <p class="shortcut">{playerIndex + 1}</p>
</button>

<style>
  button {
    position: relative;
    /* cursor: pointer; */
    background: var(--grey);
    border-radius: 4px;
    transition: all 0.2s ease;
    overflow: hidden;
    border: 1px solid var(--black);
    box-shadow: 1px 1px var(--grey-dark);
    width: 16px;
    height: 16px;
  }
  .shortcut {
    color: var(--black);
    font-size: 8px;
    font-weight: bold;
  }
</style>