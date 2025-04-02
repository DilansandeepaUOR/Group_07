import React from "react";

function Profile() {
  // Hardcoded user details (no session management)
  const user = {
    name: "John Doe",
    email: "john@example.com",
    pet: {
      name: "Buddy",
      age: "3 years",
      type: "Dog",
      profilePic: "https://via.placeholder.com/150"
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
        <ul>
          <li className="mb-2 text-gray-700 hover:text-blue-500 cursor-pointer">Edit Profile</li>
          <li className="mb-2 text-gray-700 hover:text-blue-500 cursor-pointer">Change Password</li>
          <li className="mb-2 text-gray-700 hover:text-blue-500 cursor-pointer">Privacy Settings</li>
          <li className="mb-2 text-gray-700 hover:text-red-500 cursor-pointer">Logout</li>
        </ul>
      </aside>

      {/* Main Profile Section */}
      <main className="flex-1 p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">User Profile</h1>

          {/* User Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <p className="text-gray-700"><strong>Name:</strong> {user.name}</p>
            <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
          </div>

          {/* Pet Info */}
          <div>
            <h2 className="text-lg font-semibold">Pet Information</h2>
            <div className="flex items-center gap-4 mt-4">
              <img src={user.pet.profilePic} alt="Pet" className="w-24 h-24 rounded-full border" />
              <div>
                <p className="text-gray-700"><strong>Pet Name:</strong> {user.pet.name}</p>
                <p className="text-gray-700"><strong>Age:</strong> {user.pet.age}</p>
                <p className="text-gray-700"><strong>Type:</strong> {user.pet.type}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;
