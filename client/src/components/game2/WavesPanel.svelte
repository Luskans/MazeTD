<script lang="ts">
  import { ENEMIES_DATA } from '../../../../server/src/datas/enemiesData';
  import { gameStore } from '../../stores/gameStore.svelte';
  import WaveButton from './WaveButton.svelte';

  const wavesConfig = $derived.by(() => {
    const waves =  gameStore.waves ?? [];
    return waves
      .map(wave => ({
        index: wave.index,
        // enemyId: wave.enemyId,
        data: ENEMIES_DATA[wave.enemyId]
      }))
      .filter(w => w.data)
  });  
</script>

<div class="waves-panel">
  {#each wavesConfig as wave (wave.index)}
    <WaveButton 
      index={wave.index}
      data={wave.data}
    />
  {/each}
</div>

<style>
  .waves-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>