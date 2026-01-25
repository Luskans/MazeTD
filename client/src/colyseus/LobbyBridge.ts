import { getStateCallbacks, Room } from "colyseus.js";
import type { CustomerState } from "../../../server/src/rooms/schema/CustomerState";
import { lobbyStore, type CustomerStore } from "../stores/lobbyStore.svelte";
import type { LobbyState } from "../../../server/src/rooms/schema/LobbyState";
import { MapSchema } from "@colyseus/schema";
import { toast } from "@zerodevx/svelte-toast";
import { network } from "./Network";
import { addChatMessage, addSystemMessage, chat, clearChat } from "../stores/chatStore.svelte";
import { AudioService } from "../services/AudioService";

let cleanupFns: (() => void)[] = [];

export function connectLobby(room: Room<LobbyState>) {
  disconnectLobby();
  clearChat();
  const $ = getStateCallbacks(room);
  lobbyStore.roomId = room.roomId;

  cleanupFns.push(
    $(room.state).listen("customers", (customers) => {

      $(customers).onAdd((customer, id) => {
        syncCustomers(room);
        AudioService.getInstance().playSFX('connect');

        $(customer).onChange(() => {
          syncCustomers(room);
        });
      });

      $(customers).onRemove(() => {
        syncCustomers(room);
        AudioService.getInstance().playSFX('disconnect');
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
        AudioService.getInstance().playSFX('back');

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
    room.onMessage("lobby_countdown", (sec: number) => {
      lobbyStore.countdown = sec;
      lobbyStore.isLocked = (sec <= 3);
      AudioService.getInstance().playSFX('countdown')
    })
  );

  cleanupFns.push(
    room.onMessage("lobby_countdown_stop", () => {
      lobbyStore.countdown = null;
      lobbyStore.isLocked = false;
    })
  );

  cleanupFns.push(
    room.onMessage("kicked", () => {
      AudioService.getInstance().playSFX('disconnect');
      toast.push("You were kicked from this lobby.", { classes: ["custom"] });
      disconnectLobby();
      network.leaveRoom();
    })
  );

  cleanupFns.push(
    // room.onMessage("start_game", async ({ roomId }) => {
    //   if (!lobbyStore.me) return;
    //   network.leaveRoom();
    //   await network.joinGame(roomId, {
    //     uid: lobbyStore.me.uid,
    //     username: lobbyStore.me.username,
    //     elo: lobbyStore.me.elo
    //   });
    //   disconnectLobby();
    // })
    room.onMessage("start_game", async (data) => {    
      network.leaveRoom();  
      await network.joinGame(data.roomId, {
        uid: data.customerData.uid,
        username: data.customerData.username,
        elo: data.customerData.elo
      });
      disconnectLobby();
    })
  );

  cleanupFns.push(
    room.onMessage("chat", (msg: any) => {
      addChatMessage(msg.from ?? "anonymous", msg.text);
      AudioService.getInstance().playSFX('chat')
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
    lobbyStore.me = lobbyStore.customers.find(p => p.sessionId === room.sessionId) ?? null;
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
  lobbyStore.roomId = '';
  lobbyStore.customers = [];
  lobbyStore.me = null;
  lobbyStore.isPrivate = false;
  lobbyStore.isLocked = false;
  lobbyStore.hostId = '';
  lobbyStore.countdown = null;
  lobbyStore.kicks = {};
}