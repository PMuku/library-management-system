import { useState } from 'react';
import LibHome from './lib-tasks/LibHome';
import PendingRequests from './lib-tasks/PendingRequests';
import LibrarianCurrentIssues from './lib-tasks/currentlyIssued';
import fetchWithAuth from '../utils/fetchWithAuth.js';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LibrarianDashboard({ setIsLoggedIn, setRole }) {

    const [activeTab, setActiveTab] = useState('');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'home':
                return <LibHome />;
            case 'requests':
                return <PendingRequests />;
            case 'issued':
                return <LibrarianCurrentIssues />;
            default:
                return (
                <>
                    <h1 className="text-3xl font-semibold mb-4">Welcome, Librarian!</h1>
                    <p>Select an action from the sidebar to continue.</p>
                </>
                );
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetchWithAuth(`${BACKEND_URL}/api/auth/logout`, {
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
            setIsLoggedIn(false);
            setRole('');
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        { label: 'Home', icon: 'home', tab: 'home' },
        { label: 'View Pending Requests', icon: 'pending_actions', tab: 'requests' },
        { label: 'Currently Issued Books', icon: 'book', tab: 'issued' },
    ];

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-950 dark:to-gray-900 transition-colors duration-300">
            {/* Sidebar */}
            <div className="group relative bg-blue-800 dark:bg-gray-800 text-white transition-all duration-300 ease-in-out w-16 hover:w-64 p-4 shadow-md">
                <div className="flex flex-col space-y-4 h-full">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(item.tab)}
                            className="flex items-center gap-2 p-2 text-sm hover:bg-blue-700 dark:hover:bg-gray-700 rounded-lg transition w-full text-left"
                        >
                            <span className="material-icons">{item.icon}</span>
                            <span className="hidden group-hover:inline">{item.label}</span>
                        </button>
                    ))}

                    <div className="border-t border-blue-600 dark:border-gray-600 pt-4 mt-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 p-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition w-full"
                        >
                            <span className="material-icons">logout</span>
                            <span className="hidden group-hover:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 md:p-10">
                <div className="w-full h-full p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl shadow-xl border border-gray-300 dark:border-gray-700 transition-all duration-300">
                    {renderActiveTab()}
                </div>
            </div>
        </div>
    );
};

export default LibrarianDashboard;