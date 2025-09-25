import React, { useState } from "react";

const avatarOptions = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=2",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=4",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=6",
];

function Profile({ userEmail }) {
  const [profileImage, setProfileImage] = useState(avatarOptions[0]);
  const [showAvatars, setShowAvatars] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-purple-900 flex items-center justify-center p-6">
      <div className="bg-white bg-opacity-95 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center text-white relative">
          <img
            src={profileImage}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-full border-4 border-white mx-auto shadow-lg object-cover"
          />
          <h1 className="text-2xl font-bold mt-4">User Profile</h1>
          <p className="text-sm opacity-90">{userEmail || "Not available"}</p>

          {/* Button to toggle avatar selection */}
          <button
            onClick={() => setShowAvatars(!showAvatars)}
            className="absolute top-6 right-6 bg-white text-blue-600 px-3 py-1 text-sm rounded-lg shadow hover:bg-gray-100 transition"
          >
            {showAvatars ? "Close" : "Change Avatar"}
          </button>
        </div>

        {/* Avatar selection grid */}
        {showAvatars && (
          <div className="p-4 grid grid-cols-3 gap-3">
            {avatarOptions.map((avatar, index) => (
              <img
                key={index}
                src={avatar}
                alt={`Avatar ${index + 1}`}
                onClick={() => {
                  setProfileImage(avatar);
                  setShowAvatars(false);
                }}
                className={`w-16 h-16 rounded-full cursor-pointer border-2 ${
                  profileImage === avatar ? "border-blue-600" : "border-transparent"
                } hover:scale-105 transition`}
              />
            ))}
          </div>
        )}

        {/* Details */}
        <div className="p-6 text-gray-800 space-y-4">
          <div className="flex justify-between">
            <p className="font-semibold">Email:</p>
            <p>{userEmail || "Not available"}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-semibold">Joined:</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
