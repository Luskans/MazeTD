export type LobbyStore = {
  roomId: string,
  customers: CustomerStore[],
  me: CustomerStore | null,
  isPrivate: boolean,
  isLocked: boolean,
  hostId: string,
  countdown: number | null,
  kicks: Record<string, string>
}
export type CustomerStore = {
  sessionId: string,
  uid: string,
  username: string,
  elo: number,
  isReady: boolean
}

export const lobbyStore: LobbyStore = $state({
  roomId: '',
  customers: [],
  me: null,
  isPrivate: false,
  isLocked: false,
  hostId: '',
  countdown: null,
  kicks: {}
});
// export const customerStore: CustomerStore = $state({
//   sessionId: '',
//   uid: '',
//   username: '',
//   elo: 0,
//   isReady: false,
// });