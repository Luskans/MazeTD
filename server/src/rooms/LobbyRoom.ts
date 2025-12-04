import { Room, Client } from "@colyseus/core";
import { CustomerState } from "./schema/CustomerState";
import { LobbyState } from "./schema/LobbyState";
import { matchMaker } from "colyseus";

export class LobbyRoom extends Room<LobbyState> {
  maxClients: number = 8;
  minClients: number = 2;
  countdownDefault: number = 4;
  countdownRemaining: number = 4;
  countdownInterval: any;

  onCreate(options: any) {
    this.state = new LobbyState();

    if (options?.isPrivate) {
      this.state.isPrivate = true;
    }

    this.setPrivate(options?.isPrivate === true)

    this.onMessage("toggle_ready", (client: Client) => {
      const c = this.state.customers.get(client.sessionId);
      if (!c) return;

      c.isReady = !c.isReady;

      if (this.countdownInterval && !c.isReady && this.countdownRemaining > 3) {
        this._stopCountdown("Countdown annulé — un joueur n'est plus ready.");
      }

      this._checkStartGame();
    });

    this.onMessage("chat", (client: Client, message: string) => {
      const c = this.state.customers.get(client.sessionId);
      const from = (c && c.username) ? c.username : client.sessionId;
      this.broadcast("chat", { from, text: String(message) });
    });

    this.onMessage("vote_kick", (client: Client, targetId: string) => {
      const voters = this._getKickVotes(client.sessionId, targetId);
      if (!voters) return;

      const totalCustomers = this.state.customers.size;
      const votes = voters.length;
      const required = Math.floor(totalCustomers / 2) + 1;

      this.broadcast("sys", `${this.state.customers.get(client.sessionId)?.username} voted to kick ${this.state.customers.get(targetId)?.username} out. (${votes}/${required})`);
      console.log(`[KickVote] ${votes}/${required} contre ${targetId}`);

      if (votes >= required) {
        const targetClient = this.clients.find(c => c.sessionId === targetId);
        this.broadcast("sys", `${this.state.customers.get(targetId)?.username} has been kicked!`);
        this.state.bannedUids.set(this.state.customers.get(targetId).uid, true);
        this.state.customers.delete(targetId);
        targetClient.send("kicked", "You have been kicked from the room!");

        if (this.state.hostId === targetId) {
          const firstSessionId = this.state.customers.keys().next().value;

          if (firstSessionId) {
            this.state.hostId = firstSessionId;
            const newHost = this.state.customers.get(firstSessionId);
            this.broadcast("sys", `${newHost.username} is the new room owner.`);
          }
        }
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(`[Lobby ${this.roomId}] Client ${client.sessionId} rejoint. Clients actuels: ${this.clients.length}`);

    if (this.countdownInterval) {
      this._stopCountdown("Countdown annulé — nouveau joueur a rejoint.");
    }

    const uid = options?.uid;
    if (uid && this.state.bannedUids.has(uid)) {
      console.warn(`Tentative de reconnexion bloquée pour l'UID: ${uid}. Il est banni.`);
      throw new Error("Banned from this room.");
    }

    const customer = new CustomerState();
    customer.sessionId = client.sessionId;
    customer.uid = options?.uid;
    customer.username = options?.username;
    customer.elo = typeof options?.elo === "number" ? options.elo : 1500;
    customer.isReady = false;

    if (this.state.customers.size === 0) {
      this.state.hostId = customer.sessionId;
    }

    this.state.customers.set(client.sessionId, customer);
    this.broadcast("sys", `${customer.username} has joined the room.`);
  }

  onLeave(client: Client, consented: boolean) {
    const customer = this.state.customers.get(client.sessionId);
    if (customer) {
      this.state.customers.delete(client.sessionId);
      this.broadcast("sys", `${customer.username} has left the room.`);

      if (this.state.hostId === customer.sessionId) {
        const firstSessionId = this.state.customers.keys().next().value;

        if (firstSessionId) {
          this.state.hostId = firstSessionId;
          const newHost = this.state.customers.get(firstSessionId);
          this.broadcast("sys", `${newHost.username} is the new room owner.`);
        }
      }
    }
  }

  onDispose() {
    console.log("Disposing lobby", this.roomId);
  }

  // ---------- helper functions ----------

  _checkStartGame() {
    if (this.countdownInterval) return;
    const customers = Array.from(this.state.customers.values());
    if (customers.length >= this.minClients && customers.every(p => p.isReady === true)) {
      this._startCountdown(this.countdownDefault);
    }
  }

  _startCountdown(seconds: number) {
    if (this.countdownInterval) return;
    this.countdownRemaining = seconds;
    this.broadcast("countdown", this.countdownRemaining);

    this.countdownInterval = this.clock.setInterval(() => {
      this.countdownRemaining!--;
      this.broadcast("countdown", this.countdownRemaining);

      if (this.countdownRemaining <= 3) {
        this.lock();
      }

      if (this.countdownRemaining <= 0) {
        this._launchGame();
      }
    }, 1000);
  }

  _stopCountdown(reason: string) {
    if (this.countdownInterval) {
      this.countdownInterval.clear();
      this.countdownInterval = null;
    }
    this.unlock();
    this.countdownRemaining = this.countdownDefault;
    this.broadcast("countdown_stop");
    console.log("Compte à rebourd arrêté : " + reason);
  }

  async _launchGame() {
    this._stopCountdown("Lancement de la partie.");

    const lobbyCustomers = Array.from(this.state.customers.entries()).map(([sessionId, customer]) => ({
      sessionId: sessionId,
      uid: customer.uid,
      username: customer.username,
      elo: customer.elo
    }));

    const gameRoom = await matchMaker.createRoom("game", {
      customers: lobbyCustomers
    });

    for (const client of this.clients) {
      client.send("start_game", { roomId: gameRoom.roomId });
    }

    this.disconnect();
    this._dispose();
    console.log(`🚀 Partie lancée, lobby ${this.roomId} fermé et game room ${gameRoom.roomId} ouvert !`);
  }

  _getKickVotes(voter: string, target: string): string[] | null {
    if (voter === target) return null;
    if (!this.state.customers.has(target)) return null;
    if (!this.state.customers.has(voter)) return null;

    let voters: string[] = [];
    const currentVoters = this.state.kicks.get(target);
    if (currentVoters) voters = JSON.parse(currentVoters);

    if (voters.includes(voter)) return null;

    voters.push(voter);
    this.state.kicks.set(target, JSON.stringify(voters));
    return voters;
  }
}