import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL //|| 'http://localhost:4000';

export function initializeSocket(): Socket {
    if (!socket) {
        console.log('Initializing socket connection to', SOCKET_URL);
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000
        });

        socket.on('connect', () => {
            console.log('Socket connected with ID:', socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
        });

        socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('Socket reconnection attempt:', attemptNumber);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    }
    return socket;
}

export function getSocket(): Socket {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
}

export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}