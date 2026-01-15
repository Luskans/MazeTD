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
  
  <div class="content" class:isMenu={title === "menu"}>
    <!-- <slot></slot> -->
    {@render children()}
  </div>
</div>

<style>
  .panel {
    position: absolute;
    top: 60px;
    left: 0;
    background: transparent;
    /* max-height: 90vh; */
    display: flex;
    flex-direction: column;
    z-index: 1;
    /* min-width: 300px;  */
    /* max-width: 600px; */
    contain: layout;
  }
  header {
    /* display: flex;
    justify-content: center;
    align-items: center; */
    background: var(--primary);
    /* background: rgba(0, 0, 0, 0.4); */
    padding: 2px 0px;
    width: 180px;
    text-align: center;
    white-space: nowrap;
  }
  h2 {
    color: var(--secondary-light);
    font-size: 16px;
    font-weight: bold;
  }
  .content {
    background: var(--primary);
    /* background: rgba(0, 0, 0, 0.4); */
    border-radius: 0 4px 4px 0;
    padding: 16px;
    max-height: 88vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .content.isMenu {
    border-radius: 0 0 4px 0;
  }
</style>