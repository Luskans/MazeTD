<script lang="ts">
  import DesktopUI from "./game/DesktopUI.svelte";
  // import MobileUI from "./ui/MobileUI.svelte";

  const isMobile = window.innerWidth < 768;
</script>

{#if isMobile}
  <!-- <MobileUI /> -->
  <p>mobile</p>
{:else}
  <DesktopUI />
{/if}