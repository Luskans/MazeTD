<script lang="ts">
  import { keybinds } from "../stores/settingsStore.svelte";
  import DesktopUI from "./game2/DesktopUI.svelte";
  // import MobileUI from "./ui/MobileUI.svelte";

  const isMobile = $derived(window.innerWidth < 768);

  function handleKeyPress(event: any) {
    if (document.activeElement?.tagName === 'INPUT') return;

    // const key = event.key.toLowerCase();
    // const currentBinds = $keybinds;

    // switch (key) {
    //   case currentBinds.BUILD_TOWER:
    //     triggerAction('build_tower');
    //     break;
    //   case currentBinds.START_WAVE:
    //     triggerAction('start_wave');
    //     break;
    //   // ...
    // }
  }
</script>

<svelte:window on:keydown={handleKeyPress} />
{#if isMobile}
  <!-- <MobileUI /> -->
  <p>mobile</p>
{:else}
  <DesktopUI />
{/if}