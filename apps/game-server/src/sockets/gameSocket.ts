import { Server, Socket } from 'socket.io';

export interface PlayerState {
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

const activePlayers = new Map<string, PlayerState>();

export function setupGameSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Player connected: ${socket.id}`);

    // 1. Join Game World
    socket.on('player:join', (data: { characterId: string; name: string; classId: string; gender: string; level: number; regionId?: string; x?: number; y?: number }) => {
      const regionId = data.regionId || 'VIL_STARTER';
      const player: PlayerState = {
        socketId: socket.id,
        characterId: data.characterId,
        name: data.name,
        classId: data.classId,
        gender: data.gender,
        level: data.level || 1,
        regionId,
        x: data.x || 1000,
        y: data.y || 1000,
        animState: 'idle',
        direction: 'south',
        hp: 100,
        maxHp: 100,
      };

      activePlayers.set(socket.id, player);
      socket.join(regionId);

      // Send existing players in this region to the newcomer
      const regionPlayers = Array.from(activePlayers.values()).filter(
        (p) => p.regionId === regionId && p.socketId !== socket.id
      );
      socket.emit('world:players', regionPlayers);

      // Broadcast new player to others in the same region
      socket.to(regionId).emit('player:joined', player);
      console.log(`[Socket] ${player.name} (${player.classId}) joined region ${regionId}`);
    });

    // 2. Real-time Movement & Animation Sync
    socket.on('player:move', (data: { x: number; y: number; animState: string; direction: string }) => {
      const player = activePlayers.get(socket.id);
      if (!player) return;

      player.x = data.x;
      player.y = data.y;
      player.animState = data.animState || 'walk';
      player.direction = data.direction || 'south';

      socket.to(player.regionId).emit('player:moved', {
        socketId: socket.id,
        characterId: player.characterId,
        x: player.x,
        y: player.y,
        animState: player.animState,
        direction: player.direction,
      });
    });

    // 3. Combat Action Sync (Attack / Skill Casting)
    socket.on('player:combat_action', (data: { actionType: string; skillId?: string; targetId?: string; x?: number; y?: number }) => {
      const player = activePlayers.get(socket.id);
      if (!player) return;

      socket.to(player.regionId).emit('player:performed_action', {
        socketId: socket.id,
        characterId: player.characterId,
        ...data,
      });
    });

    // 4. Chat System
    socket.on('chat:message', (data: { channel: 'global' | 'region' | 'party' | 'whisper'; message: string; targetPlayer?: string }) => {
      const player = activePlayers.get(socket.id);
      const senderName = player ? player.name : 'Unknown';

      const payload = {
        sender: senderName,
        characterId: player?.characterId,
        channel: data.channel,
        message: data.message,
        timestamp: new Date().toISOString(),
      };

      if (data.channel === 'global') {
        io.emit('chat:broadcast', payload);
      } else if (player) {
        io.to(player.regionId).emit('chat:broadcast', payload);
      }
    });

    // 5. Region Map Transition
    socket.on('player:change_region', (data: { targetRegionId: string; spawnX: number; spawnY: number }) => {
      const player = activePlayers.get(socket.id);
      if (!player) return;

      const oldRegion = player.regionId;
      socket.leave(oldRegion);
      socket.to(oldRegion).emit('player:left', { socketId: socket.id, characterId: player.characterId });

      player.regionId = data.targetRegionId;
      player.x = data.spawnX;
      player.y = data.spawnY;

      socket.join(player.regionId);
      const newRegionPlayers = Array.from(activePlayers.values()).filter(
        (p) => p.regionId === player.regionId && p.socketId !== socket.id
      );
      socket.emit('world:players', newRegionPlayers);
      socket.to(player.regionId).emit('player:joined', player);
    });

    // 6. Disconnect
    socket.on('disconnect', () => {
      const player = activePlayers.get(socket.id);
      if (player) {
        socket.to(player.regionId).emit('player:left', {
          socketId: socket.id,
          characterId: player.characterId,
        });
        activePlayers.delete(socket.id);
        console.log(`[Socket] Player disconnected: ${player.name}`);
      }
    });
  });
}
