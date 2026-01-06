<script lang="ts">
  import MenuButton from "./MenuButton.svelte";
  import PlayerHUD from "./PlayerHUD.svelte";

  let { activePanel, onButtonClick } = $props<{
    activePanel: "players" | "shop" | "waves" | "settings" | null,
    onButtonClick: (panel: "players" | "shop" | "waves" | "settings") => void
  }>();
</script>

<PlayerHUD />

<div class="buttons">
  <MenuButton 
    image="players"
    shortcut="Q"
    active={activePanel === 'players'}
    onclick={() => onButtonClick('players')} 
  />
  <MenuButton 
    image="shop"
    shortcut="W"
    active={activePanel === 'shop'}
    onclick={() => onButtonClick('shop')}
  />
  <MenuButton 
    image="waves"
    shortcut="E"
    active={activePanel === 'waves'}
    onclick={() => onButtonClick('waves')} 
  />
  <MenuButton 
    image="settings"
    shortcut=""
    active={activePanel === 'settings'}
    onclick={() => onButtonClick('settings')} 
  />
</div>

<style>
  .buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
</style>