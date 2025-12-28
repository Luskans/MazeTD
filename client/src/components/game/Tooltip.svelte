<script lang="ts">
  let { info } = $props<{ info: any }>();
  
  let mousePos = $state({ x: 0, y: 0 });

  function handleMouseMove(e: MouseEvent) {
    // mousePos = { x: e.clientX + 15, y: e.clientY + 15 };
    mousePos = { x: e.clientX - 85, y: e.clientY };
  }
</script>

<svelte:window onmousemove={handleMouseMove} />

<div class="tooltip" style="left: {mousePos.x}px; top: {mousePos.y}px;">
  <h4>{info.name}</h4>
  <hr />
  {#if info.damage} <p>Dégâts: {info.damage}</p> {/if}
  {#if info.hp} <p>Points de vie: {info.hp}</p> {/if}
  <p class="desc">{info.description || 'Un bâtiment défensif.'}</p>
</div>

<style>
  .tooltip {
    position: fixed; /* Fixed pour sortir des containers de panel */
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 10px;
    border: 2px solid #444;
    border-radius: 4px;
    pointer-events: none; /* Important: ne pas bloquer la souris */
    z-index: 9999;
    min-width: 150px;
  }
</style>