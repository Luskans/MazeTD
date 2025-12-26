<script lang="ts">
  import ShopButton from './ShopButton.svelte';
  import { TOWERS_DATA } from '../../../../server/src/constants/towersData';
  import { WALLS_DATA } from '../../../../server/src/constants/wallsData';
  import { UPGRADES_DATA } from '../../../../server/src/constants/upgradesData';
  import { shopStore } from '../../stores/gameStore.svelte';
    import { WallConfig } from '../../../../server/src/rooms/schema/WallConfig';

  function handleTowerClick(tower: any) {
    (window as any).phaserGame.events.emit('choose_tower', { 
      buildingId: String(tower.id), 
      buildingType: String(tower.type), 
      buildingSize: Number(tower.size)
    });
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

  const towersWithConfig = $derived.by(() =>
    TOWERS_DATA
      .map(tower => ({
        tower,
        config: shopStore.towers.find(t => t.id === tower.id)
      }))
      .filter(entry => entry.config)
  );

  const wallsWithConfig = $derived.by(() =>
    WALLS_DATA
      .map(wall => ({
        wall,
        config: shopStore.walls.find(w => w.id === wall.id)
      }))
      .filter(entry => entry.config)
  );
  const upgradesWithConfig = $derived.by(() =>
    UPGRADES_DATA
      .map(upgrade => ({
        upgrade,
        config: shopStore.upgrades.find(u => u.id === upgrade.id)
      }))
      .filter(entry => entry.config)
  );
</script>

<div class="shop-panel">
  <div class="shop-category">
    <p class="shop-title">TOWERS</p>
    <div class="shop-grid">
      {#each towersWithConfig as { tower, config }}
      <!-- {#each TOWERS_DATA as tower} -->
        <!-- {#if shopStore.towers.find(t => t.id === tower.id) as config} -->
         {#if config}
          <ShopButton 
            type="towers"
            data={tower}
            price={config.price}
            onclick={() => handleTowerClick(tower)} 
          />
        {/if}
      {/each}
    </div>
  </div>
  <div class="shop-category">
    <p class="shop-title">WALLS</p>
    <div class="shop-grid">
      {#each wallsWithConfig as { wall, config }}
      <!-- {#each WALLS_DATA as wall} -->
        <!-- {#if shopStore.walls.find(w => w.id === wall.id) as config} -->
         {#if config}
          <ShopButton
            type="walls"
            data={wall}
            price={config.price}
            onclick={() => handleWallClick(wall)} 
          />
        {/if}
      {/each}
    </div>
  </div>
  <div class="shop-category">
    <p class="shop-title">UPGRADES</p>
    <div class="shop-grid">
      {#each upgradesWithConfig as { upgrade, config }}
      <!-- {#each UPGRADES_DATA as upgrade} -->
        <!-- {#if shopStore.upgrades.find(u => u.id === upgrade.id) as config} -->
         {#if config}
          <ShopButton
            type="upgrades"
            data={upgrade}
            price={config.price}
            multiplier={config.multiplier}
            onclick={() => handleUpgradeClick(upgrade)} 
          />
        {/if}
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