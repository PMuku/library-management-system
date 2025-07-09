import { useEffect, useState } from 'react';
import fetchWithAuth from '../../utils/fetchWithAuth.js'; // Ensure this utility exists
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function PendingRequests() {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth(`${BACKEND_URL}/api/librarian/pending-requests`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetchWithAuth pending requests');
            const data = await res.json();
            setRequests(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/api/librarian/approve-request/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({}),
            });
            if (!res.ok) throw new Error('Failed to approve request');
            fetchRequests();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter reason for rejection:');
        if (!reason) return;
        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/api/librarian/reject-request/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ reason }),
            });
            if (!res.ok) throw new Error('Failed to reject request');
            fetchRequests();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Pending Issue Requests</h2>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}
            <div className="space-y-4">
                {requests.length === 0 ? (
                    <p>No pending requests</p>
                ) : (
                    requests.map((req) => (
                        <div
                            key={req._id}
                            className="border p-4 rounded-lg shadow bg-white flex flex-col gap-2"
                        >
                            <h3 className="text-lg font-bold">{req.bookId?.title || "Unknown Book"}</h3>
                            <p>Author: {req.bookId?.author || "Unknown"}</p>
                            <p>Requested by: {req.user?.username || "Unknown"}</p>
                            <p>User ID: {req.user?._id || "N/A"}</p>
                            <p>Duration: {req.duration} days</p>
                            <p>Requested On: {new Date(req.issueDate).toLocaleDateString()}</p>
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => handleApprove(req._id)}
                                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleReject(req._id)}
                                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default PendingRequests;
