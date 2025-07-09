import { useState } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth'; // Ensure this utility exists

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LoginComponent({ setIsLoggedIn, setRole }) {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await fetchWithAuth(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });
        
            if (!response.ok) {
                throw new Error('Login failed. Invalid credentials');
            }
        
            const data = await response.json();
            if (data.access_token && data.refresh_token && data.role) {
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('refresh_token', data.refresh_token);
                setRole(data.role || 'user');
                setIsLoggedIn(true);
                console.log('Login successful:', data);
            } else {
                setError('Login failed. No tokens received');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during login');
        }
    };
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password to sign up.');
            return;
        }
        try {
            const response = await fetchWithAuth(`${BACKEND_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Sign Up failed. Please try again');
            }

            const data = await response.json();
            setMessage('Sign Up successful! Login to continue.');
        } catch (err) {
            setError(err.message || 'An error occurred during Sign Up');
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sky-300 to-indigo-400 dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
            <div className="w-full max-w-sm p-8 sm:p-10 bg-blue-300 dark:bg-gray-900 rounded-2xl shadow-2xl space-y-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">Library Login</h2>

                {error && (
                    <div className="relative flex items-start gap-2 rounded-md bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 text-sm animate-fade-in shadow-sm">
                        <span className="material-icons text-base">error_outline</span>
                        <div className="flex-1">{error}</div>
                        <button
                            onClick={() => setError('')}
                            className="absolute top-1 right-2 text-red-600 dark:text-red-300 hover:text-red-800"
                            aria-label="Close error"
                        >
                            <span className="material-icons text-sm">close</span>
                        </button>
                    </div>
                )}
                {message && (
                    <div className="relative flex items-start gap-2 rounded-md bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-3 text-sm animate-fade-in shadow-sm">
                        <span className="material-icons text-base">check_circle</span>
                        <div className="flex-1">{message}</div>
                        <button
                            onClick={() => setMessage('')}
                            className="absolute top-1 right-2 text-green-700 dark:text-green-300 hover:text-green-900"
                            aria-label="Close message"
                        >
                            <span className="material-icons text-sm">close</span>
                        </button>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition duration-200"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-md hover:shadow-lg transition duration-300"
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={handleSignUp}
                            className="w-full py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium shadow-sm hover:shadow transition duration-300"
                        >
                            New User? Click to Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginComponent;
