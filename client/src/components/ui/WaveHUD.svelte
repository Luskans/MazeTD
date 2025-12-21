<script lang="ts">
  function handleClick() {

  }
</script>

<div class="wave-hud">
  <div class="wave-content">
    <div class="wave-count">
      <p class="text">18</p>
    </div>
    <div class="wave-bar">
  
    </div>
  </div>
  <button on:click={handleClick}>READY</button>
</div>

<style>
  .wave-hud {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: transparent;
    gap: 12px;
  }
  .wave-content {
    display: flex;
    align-items: center;
  }
  .wave-count {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px;
    background: var(--primary);
    border: 3px solid var(--secondary);
    border-radius: 50%;
    z-index: 1;
  }
  .text {
    color: var(--white);
    font-size: 16px;
    font-weight: bold;
  }
  .wave-bar {
    width: 200px;
    height: 40px;
    background: var(--secondary-light);
    border: 3px solid var(--secondary-dark);
    border-left: none;
    margin-left: -20px;
  }
  button {
    width: fit-content;
    background: var(--primary-dark);
    color: var(--white);
    border: 3px solid var(--secondary);
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
  }
  button:hover {
    background: var(--primary-light);
  }
</style>