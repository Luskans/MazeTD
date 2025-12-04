<script>
  import DesktopUI from "./ui/DesktopUI.svelte";
  import MobileUI from "./ui/MobileUI.svelte";

  const isMobile = window.innerWidth < 768;
</script>

{#if isMobile}
  <MobileUI />
{:else}
  <DesktopUI />
{/if}