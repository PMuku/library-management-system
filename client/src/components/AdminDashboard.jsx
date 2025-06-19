import { useState } from "react";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function AdminDashboard({ setIsLoggedIn }) {

    const [showCreateLibForm, setShowCreateLibForm] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleLogout = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: localStorage.getItem('refresh_token'),
                }),
            });
            if (!response.ok) {
                throw new Error('Logout failed. Please try again');
            }
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('role');
            setIsLoggedIn(false);
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleLibCreate = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/makelib`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({
                    username: newUsername,
                    password: newPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create librarian. Please try again');
            }
            
            setFeedback('Librarian created successfully!');
            setNewUsername('');
            setNewPassword('');
            console.log('Librarian created successfully:', data);
        } catch (error) {
            setFeedback(error.message || 'An error occurred while creating the librarian');
        }
    };

    const menuItems = [
        { label: 'Create new Librarian', icon: 'person_add', action: () => setShowCreateLibForm(!showCreateLibForm) },
        { label: 'View Pending Requests', icon: 'pending_actions' },
        { label: 'Approve / Reject Requests', icon: 'check_circle' },
        { label: 'Mark Books as Returned', icon: 'assignment_returned' },
        { label: 'Currently Issued Books', icon: 'book' },
        { label: 'Overdue Users', icon: 'people' }
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="group relative bg-blue-800 text-white transition-all duration-300 ease-in-out w-16 hover:w-64 p-4">
                <div className="flex flex-col space-y-4">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.action}
                            className="flex items-center gap-2 p-2 text-sm hover:bg-blue-700 rounded transition w-full text-left"
                        >
                            <span className="material-icons">{item.icon}</span>
                            <span className="hidden group-hover:inline">{item.label}</span>
                        </button>
                    ))}
                    <button
                        onClick={handleLogout}
                        className="mt-auto flex items-center gap-2 p-2 text-sm bg-red-600 hover:bg-red-700 rounded transition"
                    >
                        <span className="material-icons">logout</span>
                        <span className="hidden group-hover:inline">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8">
                <h1 className="text-3xl font-semibold mb-4">Welcome, Admin!</h1>
                <p>Select an action from the sidebar to get started.</p>
                    {showCreateLibForm && (
                        <div className="mt-6 bg-white shadow p-4 rounded max-w-md">
                            <h2 className="text-xl font-semibold mb-4">Create Librarian</h2>
                            <input
                                type="text"
                                placeholder="Username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full mb-2 p-2 border rounded"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full mb-2 p-2 border rounded"
                            />
                            <button
                                onClick={handleLibCreate}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Create Librarian
                            </button>
                            {feedback && (
                                <p className={`mt-2 text-sm ${feedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {feedback}
                                </p>
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
};

export default AdminDashboard;