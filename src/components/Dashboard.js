import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-6" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}>
      <h1 className="text-3xl font-bold text-white mb-6 text-center">MythicLens Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Link to="/upload" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Upload Image</h2>
          <p className="text-gray-600 mt-2">Explore mythological insights from your images.</p>
        </Link>
        <Link to="/profile" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
          <p className="text-gray-600 mt-2">View and manage your account details.</p>
        </Link>
        <Link to="/user-engagement" className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-2 text-center">
          <h2 className="text-xl font-semibold text-gray-800">User Engagement</h2>
          <p className="text-gray-600 mt-2">View your upload history and stats.</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;