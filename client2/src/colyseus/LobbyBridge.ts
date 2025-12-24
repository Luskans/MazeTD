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














import { getStateCallbacks, Room } from "colyseus.js";
import type { CustomerState } from "../../../server/src/rooms/schema/CustomerState";
import {
  lobbyRoom,
  lobbyCustomers,
  lobbyCountdown,
  lobbyLocked,
  myLobbyPlayer,
  lobbyHost
} from "../stores/lobbyStore";
import { toast } from "@zerodevx/svelte-toast";
import { network } from "../colyseus/Network";
import { sceneStore, screenStore } from "../stores/screenStore";
import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
import { get } from "svelte/store";

let cleanupFns: (() => void)[] = [];

/**
 * Connecte le lobby aux stores Svelte
 */
export function connectLobby(room: Room<LobbyState>) {
  disconnectLobby();

  lobbyRoom.set(room);

  const $ = getStateCallbacks(room);

  const updateCustomers = () => {
    lobbyCustomers.set(
      Array.from(room.state.customers.values())
    )
  };

  // ──────────────────────────────
  // LISTENERS
  // ──────────────────────────────

  cleanupFns.push(
    $(room.state).listen("customers", (customers) => {

      $(customers).onAdd((customer: CustomerState, id: string) => {
        updateCustomers();
        $(customer).listen("isReady", updateCustomers);
      });

      $(customers).onRemove((customer, id) => {
        console.log("Customer removed", id);
        updateCustomers();
      });

      updateCustomers();
    })
  );

  cleanupFns.push(
    $(room.state).listen("hostId", () => {
      lobbyHost.set(room.state.hostId);
    })
  );

  cleanupFns.push(
    room.onMessage("countdown", (sec: number) => {
      lobbyCountdown.set(sec);
      lobbyLocked.set(sec <= 3);
    })
  );

  cleanupFns.push(
    room.onMessage("countdown_stop", () => {
      lobbyCountdown.set(null);
      lobbyLocked.set(false);
    })
  );

  cleanupFns.push(
    $(room.state).listen("kicks", (kicks) => {
      $(kicks).onAdd((kick: any, id: string) => {
        updateCustomers();
      });
      updateCustomers();
    })
  );

  cleanupFns.push(
    room.onMessage("kicked", () => {
      toast.push("You were kicked from this lobby.", {
        classes: ["custom"]
      });
      leaveLobby();
    })
  );

  cleanupFns.push(
    room.onMessage("start_game", ({ roomId }) => {
      const player = get(myLobbyPlayer);
      network.leaveRoom();
      network.joinGame(roomId, {
        uid: player?.uid,
        username: player?.username,
        elo: player?.elo
      });
      screenStore.set("game");
      sceneStore.set('loadingScene');
    })
  );
}

/**
 * Nettoyage complet
 */
export function disconnectLobby() {
  cleanupFns.forEach(fn => fn());
  cleanupFns = [];

  lobbyRoom.set(null);
  lobbyCustomers.set([]);
  lobbyCountdown.set(null);
  lobbyLocked.set(false);
}

/**
 * Quitte proprement le lobby
 */
function leaveLobby() {
  network.leaveRoom();
  disconnectLobby();
  screenStore.set("home");
}
