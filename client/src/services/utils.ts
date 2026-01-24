import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";
import { MAP_DATA } from "../../../server/src/datas/mapData";
import { COLORS } from "../styles/theme";

function getGridPixelSize(room: Room<GameState>) {
  const w = room.state.grid.col  * MAP_DATA.cellSize;
  const h = room.state.grid.row * MAP_DATA.cellSize;
  return {
    width:  w + MAP_DATA.outsideSize * 2,
    height: h + MAP_DATA.outsideSize * 2
  };
}

function computeGridPosition2x4(index: number, gridW: number, gridH: number) {
  const COLS = 4;
  const ROWS = 2;
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const x = MAP_DATA.spaceSize + col * (gridW + MAP_DATA.spaceSize);
  const y = MAP_DATA.spaceSize + row * (gridH + MAP_DATA.spaceSize);
  return { x, y };
}

// export const getOwnerOffset = (room: Room<GameState>) => {
//   const player = room.state.players.get(room.sessionId);
//   const playerIndex = Array.from(room.state.players.keys()).indexOf(room.sessionId);
//   const { width: gridW, height: gridH } = getGridPixelSize(room);
//   const pos = computeGridPosition2x4(playerIndex, gridW, gridH);
//   const x = pos.x + MAP_DATA.outsideSize;
//   const y = pos.y + MAP_DATA.outsideSize;
//   return { x, y };
// };

export const getPlayerOffset = (room: Room<GameState>, sessionId: string): { x: number, y: number } => {
  const playersKeys = Array.from(room.state.players.keys());
  const playerIndex = playersKeys.indexOf(sessionId);
  const { width: gridW, height: gridH } = getGridPixelSize(room);
  const pos = computeGridPosition2x4(playerIndex, gridW, gridH);
  const x = pos.x + MAP_DATA.outsideSize;
  const y = pos.y + MAP_DATA.outsideSize;
  return { x, y };
}

export const getColorByAreaType = (type: string): number => {
  // const colors: any = { damage: 0xd94a2a, attackSpeed: 0xf2c94c, range: 0x8e3fd6, speed: 0x2fa4c7 };
  const colors: any = { damage: COLORS.DAMAGE, attackSpeed: COLORS.ATTACK_SPEED, range: COLORS.RANGE, speed: COLORS.SPEED };
  return colors[type] || COLORS.WHITE;
}