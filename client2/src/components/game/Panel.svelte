<script lang="ts">
  import { cubicIn } from "svelte/easing";
  import { slide } from "svelte/transition";

  let { title = 'Panel', onClose, children } = $props<{
    title?: string,
    onClose: () => void,
    children: any
  }>();
</script>

<div 
  class="panel" 
  onclick={(e) => e.stopPropagation()}
  transition:slide={{ axis: "x", duration: 300, easing: cubicIn }}
  tabindex="0"
  role="dialog"
  onkeydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') onClose();
  }}
>
  <header>
    <h2>{title.toUpperCase()}</h2>
  </header>
  
  <div class="content">
    <!-- <slot></slot> -->
    {@render children()}
  </div>
</div>

<style>
  .panel {
    position: absolute;
    top: 24px;
    left: 106px;
    background: transparent;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    z-index: 1;
    min-width: 300px; 
    /* max-width: 600px; */
    contain: layout;
  }
  header {
    /* display: flex;
    justify-content: center;
    align-items: center; */
    background: var(--secondary);
    border: 3px solid var(--secondary-dark);
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    padding: 2px 64px;
    width: fit-content;
    align-self: center;
    white-space: nowrap;
  }
  h2 {
    color: var(--text);
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }
  .content {
    background: var(--primary-light);
    border: 3px solid var(--secondary-dark);
    border-radius: 8px;
    color: #3d2516;
    padding: 16px;
    max-height: 88vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>