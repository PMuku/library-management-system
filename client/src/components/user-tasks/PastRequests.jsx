// PastRequests.jsx
import { useEffect, useState } from 'react';
import { getStatusStyle, getFineStyle } from '../../utils/Styles';
import fetchWithAuth from '../../utils/fetchWithAuth.js'; // Ensure this utility exists

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function PastRequests() {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPastRequests = async () => {
            try {
                const res = await fetchWithAuth(`${BACKEND_URL}/api/users/view-issued-past`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                if (!res.ok) throw new Error('Failed to fetchWithAuth past requests');
                const data = await res.json();
                setRequests(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchPastRequests();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Past Requests</h2>
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
            <div className="space-y-4">
                {requests.map((req) => (
                    <div key={req._id} className="p-4 border rounded shadow">
                        <p><strong>Title:</strong> {req.bookId?.title}</p>
                        <p><strong>Author:</strong> {req.bookId?.author}</p>
                        <p><strong>Requested On:</strong> {new Date(req.issueDate).toLocaleDateString()}</p>
                        <p><strong>Status:</strong> <span className={getStatusStyle(req.status)}>{req.status}</span></p>
                        {req.status === 'rejected' && <p><strong>Reason:</strong> {req.rejectionReason}</p>}
                        {req.status === 'returned' && (
                            <>
                                <p><strong>Returned:</strong> {new Date(req.actualReturnDate).toLocaleDateString()}</p>
                                <p>
                                    <strong>Fine:</strong>{' '}
                                    {req.fineAmount > 0 ? (
                                        <>
                                            {req.fineAmount}{' '}
                                            <span className={`inline-block px-2 py-0.5 text-sm rounded-full font-medium ${getFineStyle(req.fineAmount, req.finePaid)}`}>
                                                {req.finePaid ? 'Paid' : 'Unpaid'}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="inline-block px-2 py-0.5 text-sm rounded-full bg-gray-200 text-gray-700 font-medium">
                                            None
                                        </span>
                                    )}
                                </p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PastRequests;