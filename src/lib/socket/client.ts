'use client';

import { io, Socket } from 'socket.io-client';

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket'],
    });
  }
  return socket;
}


