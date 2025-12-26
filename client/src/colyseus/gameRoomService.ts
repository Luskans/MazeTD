import type { Room } from "colyseus.js";
import type { GameState } from "../../../server/src/rooms/schema/GameState";


let room: Room<GameState> | null = null;

export function setGameRoom(r: Room<GameState>) {
  room = r;
}

export function getGameRoom(): Room<GameState> {
  if (!room) throw new Error("Game room not set");
  return room;
}

export function clearGameRoom() {
  room = null;
}
