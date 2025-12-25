// import { writable, derived } from "svelte/store";
// import type { Room } from "colyseus.js";
// import type { CustomerState } from "../../../server/src/rooms/schema/CustomerState";
// import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";

// export type LobbyKicks = Map<string, Set<string>>;


// export const lobbyRoom = writable<Room<LobbyState> | null>(null);
// export const lobbyCustomers = writable<CustomerState[]>([]);
// export const lobbyCountdown = writable<number | null>(null);
// export const lobbyLocked = writable(false);
// export const lobbyKicks = writable<LobbyKicks>(new Map());
// export const lobbyHost = writable<string | null>(null)
// // export const myLobbyPlayer = derived(
// //   [lobbyRoom, lobbyCustomers],
// //   ([$room, $customers]) =>
// //     $customers.find(c => c.sessionId === $room?.sessionId) ?? null
// // );
// // export const isHostAndPrivate = derived(
// //   [lobbyRoom, lobbyHost],
// //   ([$room, $hostId]) => !!$room && $room.state.isPrivate && $room.sessionId === $hostId
// // );




// export type CustomerStore = {
//   sessionId: string,
//   uid: string,
//   username: string,
//   elo: number,
//   isReady: boolean
// }


// export const customerStore = $state({
//   sessionId: '',
//   uid: '',
//   username: '',
//   elo: 0,
//   isReady: false
// });