import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function PayFines () {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLate = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/users/view-issued-current`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                if (!res.ok) throw new Error('Failed to fetch issued books');
                const data = await res.json();
                // filter by overdue books
                const overdue = data.filter(req => {
                    const dueDate = new Date(req.issueDate);
                    dueDate.setDate(dueDate.getDate() + req.duration);
                    return new Date() > dueDate && !req.finePaid;
                });
                setBooks(overdue);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchLate();
    }, []);

    const handlePayFine = async (requestId) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/pay-fine`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ requestId }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to pay fine');
            }
            alert('Fine paid successfully');
            setBooks(prev => prev.filter(req => req._id !== requestId));            
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            {books.length === 0 ? <h2 className="text-2xl font-semibold mb-4">No Pending Fines!</h2>
                                : <h2 className="text-2xl font-semibold mb-4">Overdue Books</h2>}
            {error && <p className="text-red-600">{error}</p>}
            <div className="space-y-4">
                {books.map((req) => {
                    const issueDate = new Date(req.issueDate);
                    const dueDate = new Date(issueDate);
                    dueDate.setDate(dueDate.getDate() + req.duration);
                    const daysLate = Math.ceil((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    const fine = req.fineAmount;

                    return (
                        <div key={req._id} className="p-4 border rounded shadow bg-white">
                            <p><strong>Title:</strong> {req.bookId.title}</p>
                            <p><strong>Author:</strong> {req.bookId.author}</p>
                            <p><strong>Issued On:</strong> {issueDate.toLocaleDateString()}</p>
                            <p><strong>Expected Return:</strong> {dueDate.toLocaleDateString()}</p>
                            <p><strong>Days Late:</strong> {daysLate}</p>
                            <p><strong>Total Fine:</strong> ₹{fine}</p>
                            <button
                                onClick={() => handlePayFine(req._id)}
                                className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Pay Fine
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PayFines;