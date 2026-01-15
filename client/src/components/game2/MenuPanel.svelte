<script lang="ts">
  import { network } from "../../colyseus/Network";

  let showConfirm = $state(false);

  function handleQuit() {
    showConfirm = true;
  }
  function cancelQuit() {
    showConfirm = false;
  }
  function confirmQuit() {
    network.leaveRoom();
  }
</script>

<div class="menu-panel">
  {#if !showConfirm}
    <button class="quit-btn" onclick={handleQuit}>Quit game</button>
  {:else}
    <div class="confirm-box">
      <p class="confirm-text">Are you sure you want to leave?</p>
      <div class="confirm-actions">
        <button class="confirm-btn" onclick={confirmQuit}>Yes, Quit</button>
        <button class="cancel-btn" onclick={cancelQuit}>No, Stay</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .menu-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-wrap: nowrap;
  }
  button {
    width: fit-content;
    background-color: var(--primary-light);
    color: var(--white);
    /* border: 1px solid var(--primary); */
    border: none;
    border-radius: 4px;
    padding: 6px 10px;
    cursor: pointer;
    font-weight: bold;
    font-size: 10px;
    transition: transform 0.2s ease;
  }
  button:hover {
    /* background-color: var(--primary-light); */
    /* color: var(--primary-dark); */
    transform: scale(1.1);
  }
  button:active {
    transform: scale(1.4);
  }
  .confirm-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  .confirm-text {
    color: var(--white);
    font-size: 10px;
    /* font-weight: bold; */
    margin: 0;
    text-align: center;
  }
  .confirm-actions {
    display: flex;
    gap: 10px;
  }
</style>