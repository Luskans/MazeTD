import { Client, Room } from 'colyseus.js';
import { connectGame, disconnectGame } from './GameBridge';
import { screenStore } from '../stores/screenStore.svelte';
// import { connectLobby, disconnectLobby } from './LobbyBridge';
// import { lobbyRoom } from '../stores/lobbyStore';
import { gameRoom } from '../stores/gameStore';
import { LobbyState } from '../../../server/src/rooms/schema/LobbyState';
import type { GameState } from '../../../server/src/rooms/schema/GameState';
import { connectLobby, disconnectLobby } from './LobbyBridge2';

class Network {
  client: Client;
  room: Room<LobbyState | GameState> | null = null;

  constructor(url = 'ws://localhost:2567') {
    this.client = new Client(url);
  }

  public async joinPublicLobby(options?: any) {
    this.room = await this.client.joinOrCreate('lobby', options);
    console.log(`Connection du joueur ${options?.username} au lobby public ${this.room?.roomId} réussie.`);
    // lobbyRoom.set(this.room);
    connectLobby(this.room as Room<LobbyState>);
    // screenStore.set('lobby');
    screenStore.current = "lobby";
    return this.room;
  }

  public async createPrivateLobby(options?: any) {
    this.room = await this.client.create('lobby', options);
    console.log(`Création du lobby privé ${this.room?.roomId} par le joueur ${options?.username} réussie.`);
    // lobbyRoomStore.set(this.room);
    connectLobby(this.room as Room<LobbyState>);
    // screenStore.set('lobby');
    screenStore.current = "lobby";
    return this.room;
  }

  public async joinPrivateLobbyById(roomId: string, options?: any) {
    this.room = await this.client.joinById(roomId, options);
    console.log(`Connection du joueur ${options?.username} au lobby privé ${this.room?.roomId} réussie.`);
    // lobbyRoomStore.set(this.room);
    connectLobby(this.room as Room<LobbyState>);
    // screenStore.set('lobby');
    screenStore.current = "lobby";
    return this.room;
  }

  public async joinGame(roomId: string, options?: any) {
    this.room = await this.client.joinById(roomId, options);
    console.log(`Connection du joueur ${options?.username} à la game room ${this.room?.roomId} réussie.`);
    // gameRoom.set(this.room);
    connectGame(this.room as Room<GameState>);
    // screenStore.set("game");
    screenStore.current = "game";
    return this.room;
  }

  public toggleReady() { 
    this.room?.send('toggle_ready');
  }

  public sendChat(text: string) {
    this.room?.send('chat', text);
  }

  public voteKick(id: string) {
    this.room?.send('vote_kick', id);
  }

  public leaveRoom() {
    // this.room?.leave();
    this.room = null;
    disconnectLobby();
    disconnectGame();
    screenStore.current = "home";
  }
}

export const network = new Network();