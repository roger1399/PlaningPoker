'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { initializeSocket } from '../lib/socket'

// Dynamically import components to avoid hydration issues
const Login = dynamic(() => import('../components/Login'), { ssr: false })
const PlanningPoker = dynamic(() => import('../components/PlanningPoker'), { ssr: false })

export default function Home() {
  // Initialize socket connection early
  useEffect(() => {
    const socket = initializeSocket();
    return () => {
      if (socket) {
        console.log('[Socket] Cleaning up socket connection');
        socket.disconnect();
      }
    };
  }, []);

  return (
    <main>
      <ClientComponent />
    </main>
  )
}

// Separate client component to handle Zustand store
function ClientComponent() {
  const { currentUser } = useStore();
  return !currentUser ? <Login /> : <PlanningPoker />;
}
