import React from 'react'

const Login = ({isOpen, onClose}) => {
  if (!isOpen) return null; // Don't render anything if not open
  
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Sign In</h2>
        
        <input
          type="text"
          placeholder="Email"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
        />
        
        <div className="flex justify-between">
          <button onClick={onClose} className="bg-gray-400 px-4 py-2 rounded">
            Cancel
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login