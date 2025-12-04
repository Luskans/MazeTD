<script lang="ts">
  export let currentName: string | undefined;
  let list = [
    { rank: 1, name: 'Aster', elo: 1620 },
    { rank: 2, name: 'Blossom', elo: 1590 },
    { rank: 3, name: 'Clover', elo: 1555 },
    { rank: 4, name: 'You', elo: 1500 },
    { rank: 5, name: "Dune", elo: 1420 },
    { rank: 6, name: "Echo", elo: 1390 }
  ];
  $: personnalData = list.find(item => item.name === "You");
</script>

<div class="home-leaderboard">
  <div class="leaderboard-panel">
    <h3>Leaderboard</h3>
    <div class="leaderboard">
      {#each list as item}
        <div class="leader-row {item.name === "You" ? 'self' : ''}">
          <div>#{item.rank} {item.name}</div>
          <div>{item.elo}</div>
        </div>
      {/each}
    </div>
  </div>
  <div class="leaderboard-panel">
    {#if personnalData}
      <div class="leader-row self">
        <div>#{personnalData.rank} {personnalData.name}</div>
        <div>{personnalData.elo}</div>
      </div>
    {/if}
  </div>
</div>

<style>
  .home-leaderboard {
    flex: 1;
  }
  .leaderboard-panel {
    margin-top: 10px;
    background: var(--panel);
    border-radius: var(--radius);
    padding: 12px;
    box-shadow: 0 6px 18px rgba(27,43,68,0.06);
  }
  .leaderboard {
    max-height: 220px;
    overflow: auto;
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .leader-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px;
    border-radius: 8px;
  }
  .leader-row.self {
    background: linear-gradient(90deg, rgba(106,160,255,0.08), rgba(255,159,207,0.04));
  }
</style>