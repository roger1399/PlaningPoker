import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

const socketPort = 4000;
const server = createServer();

// Set up basic request handler
server.on('request', (req, res) => {
  res.writeHead(200);
  res.end('Planning Poker WebSocket server is running!\n');
});

interface User {
  id: string;
  name: string;
  hasEstimated: boolean;
  estimate: number | null;
}

// Keep track of all connected users
const connectedUsers = new Map<string, User>();

const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000, // Increase ping timeout
  pingInterval: 25000, // Increase ping interval
  transports: ['websocket']
});

io.on('connection', (socket) => {
  console.log('[Server] New client connected:', socket.id);

  // Log current state
  const currentUsers = Array.from(connectedUsers.values());
  console.log('[Server] Current users in session:', currentUsers);

  // Send current users list to newly connected client
  console.log('[Server] Sending current users to new client:', currentUsers);
  socket.emit('currentUsers', currentUsers);
  
  socket.on('join', (user: User) => {
    console.log('[Server] Join request received:', { user, socketId: socket.id });
    
    // Store the user with their socket ID
    connectedUsers.set(socket.id, user);
    
    // Get updated users list
    const updatedUsers = Array.from(connectedUsers.values());
    console.log('[Server] Updated users after join:', updatedUsers);
    
    // Send the complete users list to all clients
    console.log('[Server] Broadcasting updated user list to all clients');
    io.emit('currentUsers', updatedUsers);
  });
  socket.on('disconnect', (reason) => {
    console.log('[Server] Client disconnected:', socket.id, 'Reason:', reason);
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log('[Server] User left:', user.name);
      connectedUsers.delete(socket.id);
      
      // Get updated users list
      const updatedUsers = Array.from(connectedUsers.values());
      console.log('[Server] Updated users after disconnect:', updatedUsers);
      
      // Only emit userLeft if this was a real disconnection
      if (reason !== 'client namespace disconnect') {
        io.emit('userLeft', user.id);
        io.emit('currentUsers', updatedUsers); // Send updated user list to all clients
      }
    }
  });
  socket.on('submitEstimate', ({ userId, estimate }) => {
    console.log('[Server] Estimate submitted:', { userId, estimate });
    io.emit('estimateSubmitted', { userId, estimate });
  });

  socket.on('revealEstimates', () => {
    console.log('[Server] Estimates revealed');
    io.emit('estimatesRevealed');
  });

  socket.on('clearEstimates', () => {
    console.log('[Server] Estimates cleared');
    io.emit('estimatesCleared');
  });

  socket.on('clearSession', () => {
    console.log('[Server] Session cleared');
    connectedUsers.clear();
    io.emit('sessionCleared');
    io.emit('currentUsers', []);
  });
});

// Start the server
server.listen(socketPort, () => {
  console.log(`Server running on port ${socketPort} 🚀`);
  console.log(`WebSocket server is ready for connections`);
});