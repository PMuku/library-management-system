// CurrentIssues.jsx
import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function CurrentIssues() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchIssuedBooks = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/users/view-issued-current`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    },
                });
                if (!res.ok) throw new Error('Failed to fetch issued books');
                const data = await res.json();
                setBooks(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchIssuedBooks();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Issued Books</h2>
            {error && <p className="text-red-600">{error}</p>}
            <div className="space-y-4">
                {books.map((req) => (
                    <div key={req._id} className="p-4 border rounded shadow">
                        <p>Title: {req.book?.title}</p>
                        <p>Author: {req.book?.author}</p>
                        <p>Issued On:{new Date(req.issueDate).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CurrentIssues;