export class ZoneService {

  static getPositionForIndex(index: number, totalPlayers: number) {
    const zoneWidth = 1024;
    const zoneHeight = 1024;

    const col = index % 2;
    const row = Math.floor(index / 2);

    return {
      x: col * zoneWidth + zoneWidth / 2,
      y: row * zoneHeight + zoneHeight / 2
    };
  }
}
