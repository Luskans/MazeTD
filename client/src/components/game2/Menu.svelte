<script lang="ts">
  import MenuButton from "./MenuButton.svelte";

  let { activePanel, onButtonClick } = $props<{
    activePanel: "menu" | "players" | "shop" | "waves" | "settings" | null,
    onButtonClick: (panel: "menu" | "players" | "shop" | "waves" | "settings") => void
  }>();
</script>

<div class="buttons">
  <MenuButton 
    image="menu"
    shortcut="Q"
    active={activePanel === 'menu'}
    onclick={() => onButtonClick('menu')} 
  />
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
  }
</style>