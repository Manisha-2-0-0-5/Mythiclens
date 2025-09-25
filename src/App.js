import React, { useState, useEffect } from 'react';
// ✅ Import useLocation to track navigation changes
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useLocation } from 'react-router-dom';
import ImageUpload from './components/ImageUpload';
import ResultCard from './components/ResultCard';
import LoadingSpinner from './components/LoadingSpinner';
import EngagementChart from './components/EngagementChart';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import MythLibrary from './components/MythLibrary';

// Best Practice: This hook could be moved to its own file, e.g., 'src/hooks/useAuth.js'
const useAuthPersistence = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedAuth === 'true' && savedUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
  };

  return { isAuthenticated, currentUser, isLoading, login, logout };
};

// Best Practice: This component could be moved to its own file, e.g., 'src/components/Navigation.js'
const Navigation = ({ isAuthenticated, currentUser, onLogout }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const linkClasses = (path) => `
    px-4 py-2 rounded-md transition-all duration-200 font-medium
    ${isActive(path) 
      ? 'bg-white bg-opacity-20 text-yellow-300' 
      : 'hover:bg-white hover:bg-opacity-10 hover:text-yellow-300'
    }
  `;

  return (
    <nav className="bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-yellow-300">
              MythDetector
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className={linkClasses('/login')}>Login</Link>
                <Link to="/register" className={linkClasses('/register')}>Register</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={linkClasses('/dashboard')}>Dashboard</Link>
                <Link to="/upload" className={linkClasses('/upload')}>Upload</Link>
                <Link to="/myth-library" className={linkClasses('/myth-library')}>Myth Library</Link>
                <Link to="/user-engagement" className={linkClasses('/user-engagement')}>Analytics</Link>
                <Link to="/profile" className={linkClasses('/profile')}>Profile</Link>
                
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-white border-opacity-30">
                  <span className="text-sm text-yellow-200">
                    Welcome, {currentUser?.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={onLogout}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Best Practice: This component could be moved to its own file, e.g., 'src/components/ProtectedRoute.js'
const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// A small component to handle clearing errors on navigation
const ErrorClearer = ({ clearError }) => {
  const location = useLocation();
  useEffect(() => {
    clearError();
  }, [location.pathname, clearError]);
  return null; // This component doesn't render anything
};

function App() {
  const { isAuthenticated, currentUser, isLoading, login, logout } = useAuthPersistence();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : [];
  });
  
  const [uploadHistory, setUploadHistory] = useState(() => {
    const savedHistory = localStorage.getItem('uploadHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  const handleLogin = async (email, password) => {
    try {
      const user = users.find(u => 
        u.email === email.toLowerCase().trim() && 
        u.password === password
      );
      if (user) {
        login({ email: user.email, loginTime: new Date().toISOString() });
        return Promise.resolve();
      } else {
        throw new Error('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleRegister = async (email, password, confirmPassword) => {
    try {
      const trimmedEmail = email.toLowerCase().trim();
      if (!trimmedEmail || !password) throw new Error('Please fill in all fields.');
      if (password !== confirmPassword) throw new Error('Passwords do not match.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters long.');
      if (users.some(u => u.email === trimmedEmail)) throw new Error('This email is already registered.');

      const newUser = { 
        email: trimmedEmail, 
        password, 
        registeredAt: new Date().toISOString() 
      };
      setUsers(prev => [...prev, newUser]);
      login({ email: trimmedEmail, loginTime: new Date().toISOString() });
      return Promise.resolve();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const handleLogout = () => {
    logout();
    setResult(null);
    setError('');
  };

  const addToUploadHistory = (objectName) => {
    const newEntry = {
      objectName,
      date: new Date().toISOString(),
      userEmail: currentUser?.email
    };
    setUploadHistory(prev => [...prev, newEntry]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Navigation 
          isAuthenticated={isAuthenticated} 
          currentUser={currentUser}
          onLogout={handleLogout} 
        />
        {/* ✅ This component now handles clearing errors on route change */}
        <ErrorClearer clearError={() => setError('')} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mx-4 mt-4 rounded relative">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              ×
            </button>
          </div>
        )}

        <main className="container mx-auto px-4 py-6">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} error={error} /> : <Navigate to="/dashboard" replace />} />
            <Route path="/register" element={!isAuthenticated ? <Register onRegister={handleRegister} error={error} /> : <Navigate to="/dashboard" replace />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard currentUser={currentUser} /></ProtectedRoute>} />
            <Route path="/upload" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <div className="w-full max-w-4xl mx-auto p-6 bg-white bg-opacity-95 rounded-xl shadow-2xl">
                  <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Image Analysis</h1>
                  <ImageUpload setResult={setResult} setLoading={setLoading} setError={setError} addToUploadHistory={addToUploadHistory} />
                  {loading && <div className="mt-6 flex justify-center"><LoadingSpinner /></div>}
                  {result && <div className="mt-6"><ResultCard result={result} /></div>}
                </div>
              </ProtectedRoute>
            }/>
            <Route path="/profile" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                {/* ✅ FIX: Pass the 'userEmail' prop correctly */}
                <Profile userEmail={currentUser?.email} />
              </ProtectedRoute>
            }/>
            <Route path="/myth-library" element={<ProtectedRoute isAuthenticated={isAuthenticated}><MythLibrary /></ProtectedRoute>} />
            <Route path="/user-engagement" element={<ProtectedRoute isAuthenticated={isAuthenticated}><EngagementChart uploadHistory={uploadHistory} currentUser={currentUser} /></ProtectedRoute>} />

            {/* Default redirect & 404 handler */}
            <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
            <Route path="*" element={
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">404 - Page Not Found</h2>
                <Link to="/" className="text-blue-600 hover:underline">Go back home</Link>
              </div>
            }/>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;