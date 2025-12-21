<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let text = "";
  export let icon = "⭐";
  export let isDisabled = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    if (!isDisabled) {
      dispatch("click");
    }
  }
</script>

<button on:click={handleClick} disabled={isDisabled}>
  <span class="icon">{icon}</span>
  <span class="text">{text}</span>
</button>

<style>
  button {
    background: var(--primary-dark);
    color: var(--white);
    border: 3px solid var(--secondary);
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    /* box-shadow: 0 4px #3d2516; */
    /* transition: transform 0.1s, box-shadow 0.1s; */
    width: 60px;
  }

  button:hover:not([disabled]) {
    background: var(--primary-light);
  }

  button:active:not([disabled]) {
    /* transform: translateY(2px);
    box-shadow: 0 2px #3d2516; */
    background: var(--primary-light);
  }

  button[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    /* transform: none;
    box-shadow: none; */
  }

  .icon {
    font-size: 24px;
    line-height: 1;
    margin-bottom: 4px;
  }

  .text {
    font-size: 8px;
    font-weight: bold;
    text-transform: uppercase;
  }
</style>
