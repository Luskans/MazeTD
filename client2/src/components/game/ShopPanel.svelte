<script lang="ts">
  import ShopButton from './ShopButton.svelte';
  import { TOWERS_DATA } from '../../../../server/src/constants/towersData';
  import { WALLS_DATA } from '../../../../server/src/constants/wallsData';
  import { UPGRADES_DATA } from '../../../../server/src/constants/upgradesData';

  function handleTowerClick(tower: any) {
    (window as any).phaserGame.events.emit('choose_tower', { 
      buildingId: String(tower.id), 
      buildingType: String(tower.type), 
      buildingSize: Number(tower.size)
    });
    console.log("clic sur tour", tower);
    // (window as any).phaserGame.events.emit('choose_tower', { buildingId: 'basic', buildingType: "tower", buildingSize: 2 })
  }

  function handleWallClick(wall: any) {
    (window as any).phaserGame.events.emit('choose_wall', { 
      buildingId: wall.id, 
      buildingType: wall.type, 
      buildingSize: wall.size 
    });
  }

  function handleUpgradeClick(upgrade: any) {
    (window as any).phaserGame.events.emit('choose_upgrade', { 
      buildingId: upgrade.id, 
      buildingType: upgrade.type, 
      buildingSize: upgrade.size 
    });
  }
</script>

<div class="shop-panel">
  <div class="shop-category">
    <p class="shop-title">TOWERS</p>
    <div class="shop-grid">
      {#each TOWERS_DATA as tower}
        <ShopButton 
          type="tower"
          data={tower} 
          onclick={() => handleTowerClick(tower)} 
        />
      {/each}
    </div>
  </div>
  <div class="shop-category">
    <p class="shop-title">WALLS</p>
    <div class="shop-grid">
      {#each WALLS_DATA as wall}
        <ShopButton
          type="wall"
          data={wall} 
          onclick={() => handleWallClick(wall)} 
        />
      {/each}
    </div>
  </div>
  <div class="shop-category">
    <p class="shop-title">UPGRADES</p>
    <div class="shop-grid">
      {#each UPGRADES_DATA as upgrade}
        <ShopButton
          type="upgrade"
          data={upgrade} 
          onclick={() => handleUpgradeClick(upgrade)} 
        />
      {/each}
    </div>
  </div>
</div>

<style>
  .shop-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .shop-category {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .shop-title {
    color: var(--white);
    font-weight: bold;
  }
  .shop-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
</style>