// import type { Room } from "colyseus.js";
// import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
// import type { CustomerState } from "../../../server/src/rooms/schema/CustomerState";
// import { customersListStore } from "../stores/customersListStore";




// let unbind: (() => void) | null = null;

// export function bindLobbyRoom(room: Room<LobbyState>) {
//   unbind?.();

//   const customersMap = new Map<string, any>();

//   const updateCustomersList = (customer: CustomerState, id: string) => {
//     customersMap.set(id, {
//       sessionId: id,
//       uid: customer.uid,
//       username: customer.username,
//       elo: customer.elo,
//       isReady: customer.isReady,
//     });

//     customersListStore.set([...customersMap.values()]);
//   };

//   room.state.customers.onAdd = updateCustomersList;
//   room.state.customers.onChange = updateCustomersList;
//   room.state.customers.onRemove = (_: any, id: string) => {
//     customersMap.delete(id);
//     customersListStore.set([...customersMap.values()]);
//   };

//   // room.state.customers.onChange = (customer: CustomerState, id: string) => {
//   //   if (id !== room.sessionId) return;

//   //   playerHUDStore.set({
//   //     gold: player.gold,
//   //     income: player.income,
//   //     population: player.population,
//   //     maxPopulation: player.maxPopulation
//   //   });
//   // };

//   unbind = () => {
//     room.state.customers.onAdd = undefined;
//     room.state.customers.onChange = undefined;
//     room.state.customers.onRemove = undefined;
//   };
// }

// export function unbindGameRoom() {
//   unbind?.();
//   unbind = null;
//   customersListStore.set([]);
//   // playerHUDStore.set(null);
// }














// import { getStateCallbacks, Room } from "colyseus.js";
// import type { CustomerState } from "../../../server/src/rooms/schema/CustomerState";
// import {
//   lobbyRoom,
//   lobbyCustomers,
//   lobbyCountdown,
//   lobbyLocked,
//   myLobbyPlayer,
//   lobbyHost
// } from "../stores/lobbyStore";
// import { toast } from "@zerodevx/svelte-toast";
// import { network } from "../colyseus/Network";
// import { sceneStore, screenStore } from "../stores/screenStore";
// import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
// import { get } from "svelte/store";
// import { lobbyStore } from "../stores/lobbyStore.svelte";

// let cleanupFns: (() => void)[] = [];

// /**
//  * Connecte le lobby aux stores Svelte
//  */
// export function connectLobby(room: Room<LobbyState>) {
//   disconnectLobby();

//   lobbyRoom.set(room);

//   const $ = getStateCallbacks(room);

//   const updateCustomers = () => {
//     lobbyCustomers.set(
//       Array.from(room.state.customers.values())
//     )
//   };

//   // ──────────────────────────────
//   // LISTENERS
//   // ──────────────────────────────

//   cleanupFns.push(
//     $(room.state).listen("customers", (customers) => {

//       $(customers).onAdd((customer: CustomerState, id: string) => {
//         updateCustomers();
//         $(customer).listen("isReady", updateCustomers);
//       });

//       $(customers).onRemove((customer, id) => {
//         console.log("Customer removed", id);
//         updateCustomers();
//       });

//       updateCustomers();
//     })
//   );

//   cleanupFns.push(
//     $(room.state).listen("hostId", () => {
//       lobbyHost.set(room.state.hostId);
//     })
//   );

//   cleanupFns.push(
//     room.onMessage("countdown", (sec: number) => {
//       lobbyCountdown.set(sec);
//       lobbyLocked.set(sec <= 3);
//     })
//   );

//   cleanupFns.push(
//     room.onMessage("countdown_stop", () => {
//       lobbyCountdown.set(null);
//       lobbyLocked.set(false);
//     })
//   );

//   cleanupFns.push(
//     $(room.state).listen("kicks", (kicks) => {
//       $(kicks).onAdd((kick: any, id: string) => {
//         updateCustomers();
//       });
//       updateCustomers();
//     })
//   );

//   cleanupFns.push(
//     room.onMessage("kicked", () => {
//       toast.push("You were kicked from this lobby.", {
//         classes: ["custom"]
//       });
//       leaveLobby();
//     })
//   );

//   cleanupFns.push(
//     room.onMessage("start_game", async ({ roomId }) => {
//       const player = get(myLobbyPlayer);
//       network.leaveRoom();
//       await network.joinGame(roomId, {
//         uid: player?.uid,
//         username: player?.username,
//         elo: player?.elo
//       });
//       screenStore.set("game");
//       sceneStore.set('loadingScene');
//     })
//   );
// }

// /**
//  * Nettoyage complet
//  */
// export function disconnectLobby() {
//   cleanupFns.forEach(fn => fn());
//   cleanupFns = [];

//   lobbyRoom.set(null);
//   lobbyCustomers.set([]);
//   lobbyCountdown.set(null);
//   lobbyLocked.set(false);
// }

// /**
//  * Quitte proprement le lobby
//  */
// function leaveLobby() {
//   network.leaveRoom();
//   disconnectLobby();
//   screenStore.set("home");
// }





import { getStateCallbacks, Room } from "colyseus.js";
import type { CustomerState } from "../../../server/src/rooms/schema/CustomerState";
import { lobbyStore, type CustomerStore } from "../stores/lobbyStore.svelte";
import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
import { MapSchema } from "@colyseus/schema";
import { toast } from "@zerodevx/svelte-toast";
import { network } from "./Network";
import { addChatMessage, addSystemMessage, chat, clearChat } from "../stores/chatStore.svelte";

let cleanupFns: (() => void)[] = [];

export function connectLobby(room: Room<LobbyState>) {
  disconnectLobby();
  clearChat();
  const $ = getStateCallbacks(room);

  // cleanupFns.push(
  //   $(room.state).onChange(() => {
  //     const customers = updateCustomers(room.state.customers);

  //     // lobbyStore.customers = [...customers];
  //     lobbyStore.customers = customers.map(c => ({ ...c }));
  //     // lobbyStore.me = customers.find(p => p.sessionId === room.sessionId) ?? null;
  //     lobbyStore.me = lobbyStore.customers.find(p => p.sessionId === room.sessionId) ?? null;
  //     // lobbyStore.me = customers
  //     // .map(c => ({ ...c }))
  //     // .find(p => p.sessionId === room.sessionId) ?? null;
  //     lobbyStore.roomId = room.sessionId;
  //     lobbyStore.isPrivate = room.state.isPrivate;
  //     lobbyStore.hostId = room.state.hostId;
  //   })
  // );

  cleanupFns.push(
    $(room.state).listen("customers", (customers) => {

      $(customers).onAdd((customer, id) => {
        syncCustomers(room);

        $(customer).onChange(() => {
          syncCustomers(room);
        });
      });

      $(customers).onRemove(() => {
        syncCustomers(room);
      });

      syncCustomers(room);
    })
  );

  cleanupFns.push(
    $(room.state).listen("hostId", () => {
      lobbyStore.hostId = room.state.hostId;
    })
  );

  cleanupFns.push(
    $(room.state).listen("isPrivate", () => {
      lobbyStore.isPrivate = room.state.isPrivate;
    })
  );

  cleanupFns.push(
    $(room.state).listen("kicks", (kicks: any) => {

      $(kicks).onAdd((voters: string, targetId: string) => {
        lobbyStore.kicks = {
          ...lobbyStore.kicks,
          [targetId]: voters
        };

        $(kicks).onChange(() => {
          lobbyStore.kicks = {
            ...lobbyStore.kicks,
            [targetId]: voters
          };
        });
      });
    })
  );

  cleanupFns.push(
    room.onMessage("countdown", (sec: number) => {
      lobbyStore.countdown = sec;
      lobbyStore.isLocked = (sec <= 3);
    })
  );

  cleanupFns.push(
    room.onMessage("countdown_stop", () => {
      lobbyStore.countdown = null;
      lobbyStore.isLocked = false;
    })
  );

  cleanupFns.push(
    room.onMessage("kicked", () => {
      toast.push("You were kicked from this lobby.", { classes: ["custom"] });
      disconnectLobby();
      network.leaveRoom;
    })
  );

  cleanupFns.push(
    room.onMessage("start_game", async ({ roomId }) => {
      if (!lobbyStore.me) return;
      disconnectLobby();
      network.leaveRoom();

      await network.joinGame(roomId, {
        uid: lobbyStore.me.uid,
        username: lobbyStore.me.username,
        elo: lobbyStore.me.elo
      });
    })
  );

  cleanupFns.push(
    room.onMessage("chat", (msg: any) => {
      addChatMessage(msg.from ?? "anonymous", msg.text);
    })
  );

  cleanupFns.push(
    room.onMessage("sys", (text: string) => {
      addSystemMessage(text);
    })
  );
}

const syncCustomers = (room: Room<LobbyState>) => {
    const customers = updateCustomers(room.state.customers);

    lobbyStore.customers = customers.map(c => ({ ...c }));
    lobbyStore.me =lobbyStore.customers.find(p => p.sessionId === room.sessionId) ?? null;
  };

const updateCustomers = (customers: MapSchema<CustomerState>): CustomerStore[] => {
  const result: CustomerStore[] = [];

  customers.forEach((customer: CustomerStore, sessionId: string) => {
    result.push({
      sessionId: customer.sessionId,
      uid: customer.uid,
      username: customer.username,
      elo: customer.elo,
      isReady: customer.isReady
    });
  });

  return result;
}

export function sendChatMessage() {
  const text = chat.input.trim();
  if (!text) return;

  network.sendChat(text);
  chat.input = "";
}

export function disconnectLobby() {
  cleanupFns.forEach(fn => fn());
  cleanupFns = [];
  lobbyStore.customers = [];
  lobbyStore.isPrivate = false;
  lobbyStore.isLocked = false;
  lobbyStore.hostId = '';
  lobbyStore.countdown = null;
}