import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'admin' | 'instructor'>('instructor');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    navigate(userType === 'admin' ? '/admin' : '/instructor');
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="card max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center transform transition-transform duration-500 hover:scale-110">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field pl-10"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field pl-10"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6">
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="radio"
                className="sr-only peer"
                name="userType"
                value="instructor"
                checked={userType === 'instructor'}
                onChange={() => setUserType('instructor')}
              />
              <div className={`px-4 py-2 rounded-lg ${
                userType === 'instructor'
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-100 text-gray-600'
              } transition-colors duration-200`}>
                Instructor
              </div>
            </label>
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="radio"
                className="sr-only peer"
                name="userType"
                value="admin"
                checked={userType === 'admin'}
                onChange={() => setUserType('admin')}
              />
              <div className={`px-4 py-2 rounded-lg ${
                userType === 'admin'
                ? 'bg-indigo-100 text-indigo-600'
                : 'bg-gray-100 text-gray-600'
              } transition-colors duration-200`}>
                Admin
              </div>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign in
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;