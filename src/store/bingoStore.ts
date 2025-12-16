'use client';

import { create } from 'zustand';
import { getSocket } from '../lib/socket/client';

export type GameState = 'waiting' | 'playing' | 'finished';

export interface BingoNumber {
  letter: 'B' | 'I' | 'N' | 'G' | 'O';
  value: number;
  drawnAt: string;
}

export interface PublicPlayerView {
  id: string;
  name: string;
  isHost: boolean;
}

export interface PublicRoomState {
  id: string;
  hostName: string | null;
  players: PublicPlayerView[];
  state: GameState;
  drawnNumbers: BingoNumber[];
  winnerId?: string;
}

export interface MyCard {
  id: string;
  numbers: (number | null)[][];
  marked: boolean[][];
}

type Role = 'host' | 'player' | null;

interface BingoStoreState {
  connectionState: 'disconnected' | 'connecting' | 'connected';
  role: Role;
  playerName: string;
  playerId: string | null;
  roomState: PublicRoomState | null;
  lastNumber: BingoNumber | null;
  bingoResult: {
    valid: boolean;
    winnerId?: string;
    playerId?: string;
    playerName?: string;
  } | null;
  error: string | null;
  myCard: MyCard | null;
  hasJoined: boolean;
  isWinner: boolean;

  setPlayerName: (name: string) => void;
  connectAsHost: (name: string) => void;
  connectAsPlayer: (name: string) => void;
  startGame: () => void;
  drawNumber: () => void;
  claimBingo: () => void;
  restartGame: () => void;
  resetBingoResult: () => void;
  markCell: (row: number, col: number) => void;
  endGame: () => void;
}
export const useBingoStore = create<BingoStoreState>((set, get) => {
  const setupSocketListeners = () => {
    const socket = getSocket();

    if ((socket as any)._bingoListenersSet) return;
    (socket as any)._bingoListenersSet = true;

    socket.on('connect', () => {
      set({ connectionState: 'connected' });
    });

    socket.on('disconnect', () => {
      set({ connectionState: 'disconnected' });
    });

    socket.on('roomState', (room: PublicRoomState) => {
      set({ roomState: room });
    });

    socket.on(
      'hostCreated',
      (payload: { room: PublicRoomState; hostSecret: string }) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'bingo_host_secret',
            payload.hostSecret,
          );
        }
        set({ roomState: payload.room, role: 'host', connectionState: 'connected' });
      },
    );

    socket.on(
      'playerJoined',
      (payload: {
        room: PublicRoomState;
        playerSecret: string;
        playerId: string;
      }) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            'bingo_player_secret',
            payload.playerSecret,
          );
        }
        const me = payload.room.players.find(
          (p) => p.id === payload.playerId,
        );
        set({
          roomState: payload.room,
          hasJoined: true,
          role: 'player',
          connectionState: 'connected',
          playerId: payload.playerId,
          playerName: me?.name ?? '',
        });
      },
    );

    socket.on('gameStarted', (room: PublicRoomState) => {
      set({ roomState: room, bingoResult: null, lastNumber: null });
    });

    socket.on('numberDrawn', (num: BingoNumber) => {
      set({ lastNumber: num });
    });

    socket.on('myCard', (card: MyCard) => {
      set({ myCard: card });
    });

    socket.on('gameRestarted', (room: PublicRoomState) => {
      set({
        roomState: room,
        lastNumber: null,
        bingoResult: null,
        myCard: null,
        isWinner: false,
      });
    });
    socket.on('gameEnded', (room: PublicRoomState) => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('bingo_host_secret');
        window.localStorage.removeItem('bingo_player_secret');
      }
      set({
        connectionState: 'connected',
        role: null,
        playerName: '',
        playerId: null,
        roomState: room,
        lastNumber: null,
        bingoResult: null,
        error: null,
        myCard: null,
        hasJoined: false,
        isWinner: false,
      });
    });
    socket.on('hostReclaimed', (room: PublicRoomState) => {
      set({
        roomState: room,
        role: 'host',
        connectionState: 'connected',
      });
    });
    socket.on(
      'playerReclaimed',
      (payload: { room: PublicRoomState; playerId: string }) => {
        const me = payload.room.players.find(
          (p) => p.id === payload.playerId,
        );
        set({
          roomState: payload.room,
          role: 'player',
          hasJoined: true,
          connectionState: 'connected',
          playerId: payload.playerId,
          playerName: me?.name ?? '',
        });
      },
    );

    socket.on(
      'bingoResult',
      (payload: {
        valid: boolean;
        winnerId?: string;
        playerId?: string;
        playerName?: string;
      }) => {
        const state = get();
        const isWinner =
          !!payload.valid &&
          !!payload.winnerId &&
          payload.winnerId === state.playerId;

        set({ bingoResult: payload, isWinner });
      },
    );

    socket.on('error', (payload: { message: string }) => {
      set({ error: payload.message });
    });
  };

  // conectar socket y listeners en cuanto se use el store
  setupSocketListeners();

  // intentar reclamos de host/player desde localStorage (solo en cliente)
  if (typeof window !== 'undefined') {
    const socket = getSocket();
    const hostSecret = window.localStorage.getItem('bingo_host_secret');
    const playerSecret = window.localStorage.getItem('bingo_player_secret');
    if (hostSecret) {
      socket.emit('reclaimHost', { hostSecret });
    } else if (playerSecret) {
      socket.emit('reclaimPlayer', { playerSecret });
    }
  }

  return {
    connectionState: 'disconnected',
    role: null,
    playerName: '',
    playerId: null,
    roomState: null,
    lastNumber: null,
    bingoResult: null,
    error: null,
    myCard: null,
    hasJoined: false,
    isWinner: false,

    setPlayerName: (name: string) => set({ playerName: name }),

    connectAsHost: (name: string) => {
      set({ connectionState: 'connecting', role: 'host', playerName: name });
      const socket = getSocket();
      setupSocketListeners();
      socket.emit('createHost', { name });
    },

    connectAsPlayer: (name: string) => {
      set({ connectionState: 'connecting', role: 'player', playerName: name });
      const socket = getSocket();
      setupSocketListeners();
      socket.emit('joinAsPlayer', { name });
    },

    startGame: () => {
      const socket = getSocket();
      socket.emit('startGame');
    },

    drawNumber: () => {
      const socket = getSocket();
      socket.emit('drawNumber');
    },

    claimBingo: () => {
      const socket = getSocket();
      socket.emit('claimBingo', {});
    },

    restartGame: () => {
      const socket = getSocket();
      socket.emit('restartGame');
    },

    endGame: () => {
      const socket = getSocket();
      socket.emit('endGame');
    },

    markCell: (row: number, col: number) => {
      set((state) => {
        if (!state.myCard) return state;
        const nextMarked = state.myCard.marked.map((r) => [...r]);
        nextMarked[row][col] = !nextMarked[row][col];
        const socket = getSocket();
        socket.emit('markCell', { row, col });
        return {
          ...state,
          myCard: {
            ...state.myCard,
            marked: nextMarked,
          },
        };
      });
    },

    resetBingoResult: () => set({ bingoResult: null }),
  };
});


