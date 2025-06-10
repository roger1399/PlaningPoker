import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Socket } from 'socket.io-client';
import { initializeSocket } from '../lib/socket';

interface User {
  id: string;
  name: string;
  hasEstimated: boolean;
  estimate: number | null;
}

const FIBONACCI_NUMBERS = [1, 2, 3, 5, 8, 13, 21];

export default function PlanningPoker() {
  const { currentUser, users, showEstimates, setEstimate, setShowEstimates, clearEstimates, clearSession } = useStore();
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    console.log('[Client] Initializing socket connection');
    socketRef.current = initializeSocket();
    
    return () => {
      if (socketRef.current) {
        console.log('[Client] Cleaning up socket connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Handle user session
  useEffect(() => {
    if (!currentUser || !socketRef.current) {
      console.log('[Client] No current user or socket not initialized, skipping setup');
      return;
    }

    const socket = socketRef.current;
    console.log('[Client] Setting up socket events for user:', currentUser.name);

    // Function to join session
    const joinSession = () => {
      console.log('[Client] Emitting join event for user:', currentUser);
      socket.emit('join', currentUser);
    };

    // Handle socket connection
    if (socket.connected) {
      console.log('[Client] Socket already connected, joining session...');
      joinSession();
    } else {
      console.log('[Client] Socket not connected, waiting for connection...');
      socket.connect();
    }

    // Handle connection and reconnects
    socket.on('connect', () => {
      console.log('[Client] Socket connected, attempting to join...');
      joinSession();
    });

    const handleCurrentUsers = (users: User[]) => {
      console.log('[Client] Received current users from server:', users);
      
      // Filter out the current user from the received list
      const otherUsers = users.filter(user => user.id !== currentUser.id);
      console.log('[Client] Other users:', otherUsers);
      
      // Update the store
      const store = useStore.getState();
      store.clearSession();
      store.addUser(currentUser); // Add current user first
      
      // Add other users
      otherUsers.forEach(user => {
        store.addUser(user);
      });
      
      console.log('[Client] Updated store users:', useStore.getState().users);
    };

    const handleUserLeft = (userId: string) => {
      console.log('[Client] User left:', userId);
      useStore.getState().removeUser(userId);
    };

    const handleEstimateSubmitted = ({ userId, estimate }: { userId: string; estimate: number }) => {
      console.log('[Client] Estimate submitted:', { userId, estimate });
      useStore.getState().setEstimate(userId, estimate);
    };

    const handleEstimatesRevealed = () => {
      useStore.getState().setShowEstimates(true);
    };

    const handleEstimatesCleared = () => {
      useStore.getState().clearEstimates();
    };

    // Setup all event listeners
    socket.on('currentUsers', handleCurrentUsers);
    socket.on('userLeft', handleUserLeft);
    socket.on('estimateSubmitted', handleEstimateSubmitted);
    socket.on('estimatesRevealed', handleEstimatesRevealed);
    socket.on('estimatesCleared', handleEstimatesCleared);

    // Cleanup function
    return () => {
      console.log('[Client] Cleaning up socket event listeners');
      socket.off('connect');
      socket.off('currentUsers', handleCurrentUsers);
      socket.off('userLeft', handleUserLeft);
      socket.off('estimateSubmitted', handleEstimateSubmitted);
      socket.off('estimatesRevealed', handleEstimatesRevealed);
      socket.off('estimatesCleared', handleEstimatesCleared);
    };
  }, [currentUser]);
  // Event handlers
  const handleEstimateClick = (estimate: number) => {
    if (!currentUser || !socketRef.current) return;
    socketRef.current.emit('submitEstimate', { userId: currentUser.id, estimate });
  };

  const handleShowEstimates = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('revealEstimates');
  };

  const handleClearEstimates = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('clearEstimates');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-300 to-cyan-300 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white backdrop-blur-lg bg-opacity-95 rounded-xl shadow-xl p-8 mb-6 border-2 border-blue-200">
          <h1 className="text-3xl font-bold mb-6 text-blue-600 border-b pb-4 border-blue-200">Planning Poker Session</h1>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Participants ({users.length}):</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border-2 border-blue-300 shadow-sm transition-all duration-200 hover:shadow-md hover:border-blue-400">
                  <span className="font-medium text-blue-700">{user.name}{user.id === currentUser?.id ? ' (You)' : ''}</span>
                  <span className="text-sm px-3 py-1 rounded-full bg-white shadow-sm border-2 border-blue-300 text-blue-600 font-medium">
                    {user.hasEstimated && !showEstimates && user.id !== currentUser?.id && '(Estimated)'}
                    {user.hasEstimated && !showEstimates && user.id === currentUser?.id && `(Estimated: ${user.estimate})`}
                    {showEstimates && user.estimate !== null && `(${user.estimate})`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Select your estimate:</h2>
            <div className="flex flex-wrap gap-3">
              {FIBONACCI_NUMBERS.map((number) => (
                <button
                  key={number}
                  onClick={() => handleEstimateClick(number)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-lg font-medium shadow-md hover:from-blue-500 hover:to-cyan-500 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 border-2 border-transparent hover:border-blue-300"
                >
                  {number}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleShowEstimates}
              className="px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-400 text-white rounded-lg font-medium shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 border-2 border-transparent hover:border-emerald-300"
            >
              Show Estimates
            </button>
            <button
              onClick={handleClearEstimates}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-lg font-medium shadow-md hover:from-orange-500 hover:to-amber-500 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 border-2 border-transparent hover:border-orange-300"
            >
              Clear Estimates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}