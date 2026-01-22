<script lang="ts">
  let { image, shortcut, active, onclick } = $props<{
    image: string,
    shortcut: string,
    active: boolean,
    onclick: () => void
  }>();
</script>

<button {onclick} class:is-active={active}>
  <!-- <p class="shortcut">{shortcut}</p> -->
  <!-- <img src="/icons/{image}.png" alt="{image}" /> -->
  <div class='icon' style="mask-image: url('/icons/{image}.png'); -webkit-mask-image: url('/icons/{image}.png');"></div>
</button>

<style>
  button {
    position: relative;
    color: var(--primary-dark);
    background: var(--primary-light);
    border: none;
    padding: 8px;
    /* cursor: pointer; */
    display: flex;
    align-items: center;
    text-align: center;
    transition: transform 0.2s ease, color 0.2s ease;
  }
  .icon {
    width: 20px;
    height: 20px;
    background-color: var(--primary-dark);
    /* -webkit-mask-image: url('/icons/{image}.png');
    mask-image: url('/icons/{image}.png'); */
    -webkit-mask-size: contain;
    mask-size: contain;
    mask-repeat: no-repeat;
    /* image-rendering: pixelated; */
    transition: background-color 0.2s ease;
  }
  button:hover .icon {
    transform: scale(1.1);
    background-color: var(--secondary-light);
  }
  button:active {
    transform: scale(0.95);
  }
  button.is-active .icon {
    background-color: var(--secondary-light);
  }
  /* .shortcut {
    position: absolute;
    top: 1px;
    left: 4px;
    color: var(--grey);
    font-size: 8px;
    font-weight: bold;
  } */
</style>
