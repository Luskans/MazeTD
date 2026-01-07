<script lang="ts">
  import ShopButton from './ShopButton.svelte';
  import { TOWERS_DATA } from '../../../../server/src/datas/towersData';
  import { WALLS_DATA } from '../../../../server/src/datas/wallsData';
  import { UPGRADES_DATA } from '../../../../server/src/datas/upgradesData';
  import { gameStore } from '../../stores/gameStore.svelte';
  import { WallConfig } from '../../../../server/src/rooms/schema/WallConfig';
    import { shopStore } from '../../stores/shopStore.svelte';

  function handleTowerClick(tower: any) {
    console.log("data", tower);
    (window as any).phaserGame.events.emit('choose_tower', { 
      buildingId: tower.id, 
      buildingType: tower.type, 
      buildingSize: tower.size
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
      // buildingSize: upgrade.size 
    });
  }

  // const towersWithConfig = $derived.by(() =>
  //   TOWERS_DATA
  //     .map((tower: any) => ({
  //       tower,
  //       config: shopStore.towers.find(t => t.id === tower.id)
  //     }))
  //     .filter((entry: any) => entry.config)
  // );
  const towersWithConfig = $derived.by(() =>
    shopStore.towers
      .map(tower => ({
        id: tower.id,
        price: tower.price,
        data: TOWERS_DATA[tower.id]
      }))
      .filter(t => t.data)
  );

  // const wallsWithConfig = $derived.by(() =>
  //   WALLS_DATA
  //     .map(wall => ({
  //       wall,
  //       config: shopStore.walls.find(w => w.id === wall.id)
  //     }))
  //     .filter(entry => entry.config)
  // );
  const wallsWithConfig = $derived.by(() =>
    shopStore.walls
      .map(wall => ({
        id: wall.id,
        price: wall.price,
        data: WALLS_DATA[wall.id]
      }))
      .filter(w => w.data)
  );

  // const upgradesWithConfig = $derived.by(() =>
  //   UPGRADES_DATA
  //     .map(upgrade => ({
  //       upgrade,
  //       config: shopStore.upgrades.find(u => u.id === upgrade.id)
  //     }))
  //     .filter(entry => entry.config)
  // );
  // const upgradesWithConfig = $derived.by(() =>
  //   shopStore.upgrades
  //     .map(upgrade => ({
  //       id: upgrade.id,
  //       price: upgrade.price,
  //       // multiplier: upgrade.multiplier,
  //       data: UPGRADES_DATA[upgrade.id]
  //     }))
  //     .filter(u => u.data)
  // );
  const upgradesWithConfig = $derived.by(() => {
    const upgrades = gameStore.me?.upgrades ?? [];
    return upgrades
      .map(upgrade => ({
        id: upgrade.id,
        level: upgrade.level,
        price: upgrade.currentCost,
        cost: upgrade.currentCost,
        value: upgrade.currentValue,
        nextValue: upgrade.nextValue,
        nextCost: upgrade.nextCost,
        data: UPGRADES_DATA[upgrade.id]
      }))
      .filter(u => u.data)
      // .filter((u): u is NonNullable<typeof u> => u !== null);
  });
</script>

<div class="shop-panel">
  <div class="shop-category">
    <p class="shop-title">TOWERS</p>
    <div class="shop-grid">
      {#each towersWithConfig as tower (tower.id)}
        <ShopButton 
          type="towers"
          data={tower.data}
          price={tower.price}
          onclick={() => handleTowerClick(tower.data)}
        />
      {/each}
    </div>
  </div>
  <div class="shop-category">
    <p class="shop-title">WALLS</p>
    <div class="shop-grid">
      {#each wallsWithConfig as wall (wall.id)}
        <ShopButton
          type="walls"
          data={wall.data}
          price={wall.price}
          onclick={() => handleWallClick(wall.data)} 
        />
      {/each}
    </div>
  </div>
  <div class="shop-category">
    <p class="shop-title">UPGRADES</p>
    <div class="shop-grid">
      {#each upgradesWithConfig as upgrade (upgrade.id)}
        <ShopButton
          type="upgrades"
          data={upgrade.data}
          level={upgrade.level}
          price={upgrade.price}
          cost={upgrade.cost}
          value={upgrade.value}
          nextCost={upgrade.nextCost}
          nextValue={upgrade.nextValue}
          onclick={() => handleUpgradeClick(upgrade.data)} 
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