import { useState } from 'react';

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
            const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
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
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
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
        <div className="flex items-center justify-center min-h-screen bg-blue-300">
            <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Library Login</h2>
                {error && 
                <p className="mb-4 text-sm text-red-600 text-center">{error}
                </p>}
                {message && 
                <p className="mb-4 text-sm text-green-600 text-center">{message}
                </p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Login
                        </button>
                        <button
                            onClick={handleSignUp}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            New User? Create an account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginComponent;
