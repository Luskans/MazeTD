import { Client, Room } from 'colyseus.js';

class NetworkService {
  client: Client;
  room: Room | null = null;

  constructor(url = 'ws://localhost:2567') {
    this.client = new Client(url);
  }

  async joinPublicLobby(options?: any) {
    this.room = await this.client.joinOrCreate('lobby', options);
    return this.room;
  }

  async createPrivateLobby(options?: any) {
    this.room = await this.client.create('lobby', options);
    return this.room;
  }

  async joinPrivateLobbyById(roomId: string, options?: any) {
    this.room = await this.client.joinById(roomId, options);
    return this.room;
  }

  async joinGame(roomId: string, options?: any) {
    this.room = await this.client.joinById(roomId, options);
    return this.room;
  }

  toggleReady() { this.room?.send('toggle_ready'); }
  sendChat(text: string) { this.room?.send('chat', text); }
  voteKick(id: string) { this.room?.send('vote_kick', id); }
  leaveRoom() { this.room?.leave(); this.room = null; }
}

export const network = new NetworkService();