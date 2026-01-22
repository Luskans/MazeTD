<script lang="ts">
  let { image, shortcut, active, onclick } = $props<{
    image: string,
    shortcut: string,
    active: boolean,
    onclick: () => void
  }>();
</script>

<button {onclick} class:is-active={active}>
  <p class="shortcut">{shortcut}</p>
  <img src="/icons/{image}.png" alt="{image}" />
</button>

<style>
  button {
    position: relative;
    background: var(--primary-dark);
    border: 2px solid var(--primary-dark);
    border-radius: 0 8px 8px 8px;
    padding: 12px;
    /* cursor: pointer; */
    display: flex;
    align-items: center;
    text-align: center;
    /* box-shadow: 0 4px #3d2516; */
    transition: transform 0.2s, box-shadow 0.2s;
    /* width: 60px; */
  }
  button:hover {
    /* border: 2px solid var(--secondary); */
    box-shadow: 0 0 6px 2px var(--secondary-light);
  }
  button:active {
    background: var(--primary-light);
  }
  button.is-active {
    background: var(--primary-light);
    border: 2px solid var(--primary-light);
  }
  button.is-active:hover {
    /* border: 2px solid var(--secondary); */
    box-shadow: 0 0 6px 2px var(--secondary-light);
  }
  .shortcut {
    position: absolute;
    top: 1px;
    left: 4px;
    color: var(--grey);
    font-size: 8px;
    font-weight: bold;
  }
  img {
    max-width: 40px;
    max-height: 40px;
  }
</style>
