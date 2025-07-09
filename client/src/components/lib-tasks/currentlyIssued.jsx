import { useEffect, useState } from 'react';
import fetchWithAuth from '../../utils/fetchWithAuth.js'; // Ensure this utility exists
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LibrarianCurrentIssues() {
    const [issues, setIssues] = useState([]);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    const fetchIssues = async () => {
        try {
            const endpoint = filter === 'overdue' ? 'overdue-users' : 'current-issues';
            
            const res = await fetchWithAuth(`${BACKEND_URL}/api/librarian/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) {
                const errorMsg = filter === 'overdue' ? 'Failed to fetchWithAuth overdue books' : 'Failed to fetchWithAuth current issued books';
                throw new Error(errorMsg);
            }
            const data = await res.json();
            setIssues(data);
            setError(''); // clear any previous errors
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, [filter]);

    const handleMarkReturned = async (id) => {
        if (!confirm("Confirm that the book has been returned?")) return;

        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/api/librarian/mark-returned/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to mark as returned');
            }

            alert('Book marked as returned');
            fetchIssues(); // refresh list
        } catch (err) {
            alert(err.message);
        }
    };

    const renderOverdueInfo = (req) => {
        const issueDate = new Date(req.issueDate);
        const dueDate = new Date(issueDate.getTime() + req.duration * 24 * 60 * 60 * 1000);
        const now = new Date();
        const daysLate = Math.max(0, Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)));
        const fine = daysLate > 0 ? daysLate * req.finePerDay : 0;

        if (daysLate > 0) {
            return (
                <div className="mt-3 space-y-1">
                    <p className={req.finePaid ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                        {req.finePaid ? "Fine Paid" : "Overdue"}
                    </p>
                    <p><strong>Expected Return:</strong> {dueDate.toLocaleDateString()}</p>
                    <p><strong>Days Late:</strong> {daysLate}</p>
                    <p><strong>Total Fine:</strong> ₹{fine}</p>
                </div>
            );
        }

        return null;
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Currently Issued Books
            </h2>

            {error && (
                <div className="relative flex items-start gap-2 rounded-md bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 text-sm animate-fade-in shadow-sm mb-4">
                    <span className="material-icons text-base">error_outline</span>
                    <div className="flex-1">{error}</div>
                    <button
                        onClick={() => setError('')}
                        className="absolute top-1 right-2 text-red-600 dark:text-red-300 hover:text-red-800"
                    >
                        <span className="material-icons text-sm">close</span>
                    </button>
                </div>
            )}

            <div className="mb-6">
                <label className="mr-2 font-medium text-gray-700 dark:text-gray-300">Filter:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                >
                    <option value="all">All</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((req) => (
                    <div
                        key={req._id}
                        className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 shadow bg-white dark:bg-gray-900 text-gray-800 dark:text-white"
                    >
                        <p><strong>Book:</strong> {req.bookId.title}</p>
                        <p><strong>Author:</strong> {req.bookId.author}</p>
                        <p><strong>Issued By:</strong> {req.user.username}</p>
                        <p><strong>User ID:</strong> {req.user._id}</p>
                        <p><strong>Issued On:</strong> {new Date(req.issueDate).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> {req.duration} days</p>
                        <p><strong>Copy ID:</strong> {req.bookcpyId}</p>

                        {renderOverdueInfo(req)}

                        <button
                            onClick={() => handleMarkReturned(req._id)}
                            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                            Mark Returned
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

}

export default LibrarianCurrentIssues;
