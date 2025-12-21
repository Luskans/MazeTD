<script lang="ts">
  import { slide } from "svelte/transition";

  export let title = 'Panel';
  export let onClose = () => {};
</script>

<div 
  class="panel" 
  on:click|stopPropagation
  transition:slide={{ axis: "x" }}
  tabindex="0"
  role="dialog"
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') onClose();
  }}
>
  <header>
    <h2>{title}</h2>
  </header>
  
  <div class="content">
    <slot></slot>
  </div>
</div>

<style>
  .panel {
    position: absolute;
    top: 80px;
    left: 100px;
    background: transparent;
    max-width: 600px;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    z-index: 1;
  }

  header {
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--grey);
    border: 3px solid var(--secondary);
    border-radius: 8px 8px 0 0;
    padding: 8px 64px;
    width: fit-content;
    align-self: center;
  }

  h2 {
    color: var(--text);
    margin: 0;
    font-size: 12px;
    font-weight: bold;
  }

  .content {
    /* flex-grow: 1; */
    background: var(--primary-light);
    border: 3px solid var(--secondary);
    border-radius: 8px;
    color: #3d2516;
    padding: 12px;
  }
</style>