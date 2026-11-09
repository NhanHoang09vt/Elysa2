import { io, Socket } from 'socket.io-client';

export interface RemotePlayer {
  socketId: string;
  characterId: string;
  name: string;
  classId: string;
  gender: string;
  level: number;
  regionId: string;
  x: number;
  y: number;
  animState: string;
  direction: string;
  hp: number;
  maxHp: number;
}

export interface ChatMessagePayload {
  sender: string;
  characterId?: string;
  channel: 'global' | 'region' | 'party' | 'whisper';
  message: string;
  timestamp: string;
}

export class NetworkService {
  private socket: Socket | null = null;
  private isConnected = false;

  public onWorldPlayers?: (players: RemotePlayer[]) => void;
  public onPlayerJoined?: (player: RemotePlayer) => void;
  public onPlayerMoved?: (data: { socketId: string; characterId: string; x: number; y: number; animState: string; direction: string }) => void;
  public onPlayerLeft?: (data: { socketId: string; characterId: string }) => void;
  public onPlayerAction?: (data: { socketId: string; characterId: string; actionType: string; skillId?: string; targetId?: string }) => void;
  public onChatReceived?: (msg: ChatMessagePayload) => void;

  public connect(url: string = import.meta.env.VITE_WS_URL || 'http://localhost:4000') {
    if (this.socket) return;

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`[NetworkService] Connected to game server with ID: ${this.socket?.id}`);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('[NetworkService] Disconnected from game server');
    });

    this.socket.on('world:players', (players: RemotePlayer[]) => {
      if (this.onWorldPlayers) this.onWorldPlayers(players);
    });

    this.socket.on('player:joined', (player: RemotePlayer) => {
      if (this.onPlayerJoined) this.onPlayerJoined(player);
    });

    this.socket.on('player:moved', (data: any) => {
      if (this.onPlayerMoved) this.onPlayerMoved(data);
    });

    this.socket.on('player:left', (data: any) => {
      if (this.onPlayerLeft) this.onPlayerLeft(data);
    });

    this.socket.on('player:performed_action', (data: any) => {
      if (this.onPlayerAction) this.onPlayerAction(data);
    });

    this.socket.on('chat:broadcast', (msg: ChatMessagePayload) => {
      if (this.onChatReceived) this.onChatReceived(msg);
    });
  }

  public joinGame(charData: { characterId: string; name: string; classId: string; gender: string; level: number; regionId?: string; x?: number; y?: number }) {
    if (!this.socket) return;
    this.socket.emit('player:join', charData);
  }

  public sendMovement(x: number, y: number, animState: string, direction: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:move', { x, y, animState, direction });
  }

  public sendCombatAction(actionType: string, skillId?: string, targetId?: string, x?: number, y?: number) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:combat_action', { actionType, skillId, targetId, x, y });
  }

  public sendChatMessage(channel: 'global' | 'region' | 'party' | 'whisper', message: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('chat:message', { channel, message });
  }

  public changeRegion(targetRegionId: string, spawnX: number, spawnY: number) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('player:change_region', { targetRegionId, spawnX, spawnY });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export const networkService = new NetworkService();
