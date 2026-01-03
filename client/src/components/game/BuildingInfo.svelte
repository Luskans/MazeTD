<script lang="ts">
  import { onMount } from 'svelte';
  import { gameStore } from '../../stores/gameStore.svelte';
  import { buildingStore } from '../../stores/buildingStore.svelte';
    import { TOWERS_DATA } from '../../../../server/src/datas/towersData';
    import { WALLS_DATA } from '../../../../server/src/datas/wallsData';

  // let selectedBuildingDetail: {isVisible: boolean, buildingId?: string, ownerId?: string, type?: string} | null = null;
  // if (selectedBuildingDetail?.ownerId) const player = gameStore.players.get(ownerId);
  // if (selectedBuildingDetail?.type) const category = player[type];
  // if (selectedBuildingDetail?.buildingId) const building = category.get(buildingId);


  // let detail = $state({ isVisible: false, buildingId: '', ownerId: '', type: '' });
  // let player = $derived(gameStore.players.get(detail.ownerId));
  // let building = $derived(
  //   player && detail.buildingId && detail.type 
  //     ? player[detail.type === 'tower' ? 'towers' : 'walls'].get(detail.buildingId)
  //     : null
  // );
  // let isMine = $derived(detail.ownerId === gameStore.me?.sessionId);
  
  let selection = $state({ isVisible: false, buildingId: '', type: '' });

  // On récupère les données directement par l'ID
  let building = $derived(
    selection.type === 'tower' 
      ? buildingStore.towers[selection.buildingId] 
      : buildingStore.walls[selection.buildingId]
  );
  let data = $derived(
    selection.type === 'tower' 
      ? TOWERS_DATA[building.dataId] 
      : WALLS_DATA[building.dataId]
  )

  let isMine = $derived(building?.ownerId === gameStore.me?.sessionId);

  onMount(() => {
    const handleSelect = (e: any) => {
      console.log("event recu dans building info", e.detail)
      selection = e.detail;
    };
    window.addEventListener('select-building', handleSelect);
    return () => window.removeEventListener('select-building', handleSelect);
  });

  function handleAction(action: any) {
    // On renvoie l'ordre à Phaser/Colyseus
    // Exemple : room.send("buildingAction", { id: selectedBuilding.id, action });
    console.log("Action sur le bâtiment :", action);
  }
</script>

{#if selection.isVisible}
  <div class="ui-panel">
    <h3>{data.name}</h3>
    {#if building.level}<span>Lvl {building.level}</span>{/if}
    
    {#if isMine}
    <div class="buttons">
      <button onclick={() => handleAction('upgrade')}>Upgrade</button>
      <button onclick={() => handleAction('rotate')}>Rotate</button>
      <button class="sell" onclick={() => handleAction('sell')}>Sell</button>
    </div>
    {/if}

    <button class="close" onclick={() => selection.isVisible = false}>X</button>
  </div>
{/if}

<style>
  .ui-panel {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    border: 2px solid #00ffff;
  }
  .sell { background: #ff4444; }
</style>