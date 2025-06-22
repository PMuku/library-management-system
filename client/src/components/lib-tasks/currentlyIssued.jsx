import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LibrarianCurrentIssues() {
    const [issues, setIssues] = useState([]);
    const [error, setError] = useState('');

    const fetchIssues = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/librarian/current-issues`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch current issued books');
            const data = await res.json();
            setIssues(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchIssues();
    }, []);

    const handleMarkReturned = async (id) => {
        if (!confirm("Confirm that the book has been returned?")) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/librarian/mark-returned/${id}`, {
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

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Currently Issued Books</h2>
            {error && <p className="text-red-600">{error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((req) => (
                    <div
                        key={req._id}
                        className="border border-gray-300 rounded-xl p-4 shadow bg-white"
                    >
                        
                        <p><strong>Book:</strong> {req.bookId.title}</p>
                        <p><strong>Author:</strong> {req.bookId.author}</p>
                        <p><strong>Issued By:</strong> {req.user.username}</p>
                        <p><strong>User ID:</strong> {req.user._id}</p>
                        <p><strong>Issued On:</strong> {new Date(req.issueDate).toLocaleDateString()}</p>
                        <p><strong>Duration:</strong> {req.duration} days</p>
                        <p><strong>Copy ID:</strong> {req.bookcpyId}</p>
                        <button
                            onClick={() => handleMarkReturned(req._id)}
                            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
