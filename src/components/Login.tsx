import { useState } from 'react'
import { useStore } from '../store/useStore'
import { v4 as uuidv4 } from 'uuid'

export default function Login() {
  const [name, setName] = useState('')
  const { setCurrentUser } = useStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const user = {
        id: uuidv4(),
        name: name.trim(),
        hasEstimated: false,
        estimate: null
      }
      setCurrentUser(user)
      // We don't need to emit join here as PlanningPoker component handles it
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Planning Poker</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Enter your name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Join Session
          </button>
        </form>
      </div>
    </div>
  )
}
