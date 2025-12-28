import { Client, Room } from 'colyseus.js';
import { screenStore } from '../stores/screenStore.svelte';
import { LobbyState } from '../../../server/src/rooms/schema/LobbyState';
import type { GameState } from '../../../server/src/rooms/schema/GameState';
import { connectLobby } from './LobbyBridge';
import { connectGame } from './GameBridge';
import { setGameRoom } from './gameRoomService';

class Network {
  client: Client;
  room: Room<LobbyState | GameState> | null = null;

  constructor(url = 'ws://localhost:2567') {
    this.client = new Client(url);
  }

  public async joinPublicLobby(options?: any) {
    const room = await this.client.joinOrCreate('lobby', options);
    this.room = room;
    console.log(`Connection du joueur ${options?.username} au lobby public ${this.room?.roomId} réussie.`);
    connectLobby(room);
    screenStore.current = "lobby";
    return room;
  }

  public async createPrivateLobby(options?: any) {
    const room = await this.client.create('lobby', options);
    this.room = room;
    console.log(`Création du lobby privé ${this.room?.roomId} par le joueur ${options?.username} réussie.`);
    connectLobby(room);
    screenStore.current = "lobby";
    return room;
  }

  public async joinPrivateLobbyById(roomId: string, options?: any) {
    const room = await this.client.joinById(roomId, options);
    this.room = room;
    console.log(`Connection du joueur ${options?.username} au lobby privé ${this.room?.roomId} réussie.`);
    connectLobby(room);
    screenStore.current = "lobby";
    return room;
  }

  public async joinGame(roomId: string, options?: any) {
    const room = await this.client.joinById(roomId, options);
    this.room = room;
    console.log(`Connection du joueur ${options?.username} à la game room ${room.roomId} réussie.`);
    connectGame(room);
    setGameRoom(room);
    screenStore.current = "game";
    return room;
  }

  public sendCustomerReady() { 
    this.room?.send('customer_ready');
  }

  public sendChat(text: string) {
    this.room?.send('chat', text);
  }

  public voteKick(id: string) {
    this.room?.send('vote_kick', id);
  }

  public leaveRoom() {
    this.room?.leave();
    this.room = null;
    // disconnectLobby();
    // disconnectGame();
    screenStore.current = "home";
  }

  public sendPlayerReady() {
    this.room?.send("player_ready");
  }

  public sendVisionToTarget(action: string, targetId: string) {
    this.room?.send(action, { targetId: targetId })
  }
}

export const network = new Network();