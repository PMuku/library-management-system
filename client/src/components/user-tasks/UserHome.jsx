import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function UserHome() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [author, setAuthor] = useState('');

    const fetchBooks = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (author) queryParams.append('author', author);
            const res = await fetch(`${BACKEND_URL}/api/books?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetch books');
            const data = await res.json();
            setBooks(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => { fetchBooks(); }, []);

    const handleIssue = async (bookId) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ bookId }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Issue request failed');
            }
            alert('Issue request sent!');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchBooks(); // re-fetch with query filters
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Available Books</h2>
            {error && <p className="text-red-600">{error}</p>}

            {/* Search and Filter Form */}
            <form onSubmit={handleFilterSubmit} className="mb-6 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search by title"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full md:w-1/2"
                />
                <input
                    type="text"
                    placeholder="Filter by author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="p-2 border border-gray-300 rounded w-full md:w-1/2"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Apply Filters
                </button>
            </form>

            {/* Books List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                    <div
                        key={book._id}
                        className="relative group border border-gray-300 rounded-xl p-4 shadow hover:shadow-lg transition bg-white"
                    >
                    <h3 className="text-lg font-semibold">{book.title}</h3>
                    <p className="text-sm text-gray-600">{book.author}</p>
                    <p className="text-sm mt-1">Available Copies: {book.availableCopies}</p>
                    <button
                        onClick={() => handleIssue(book._id)}
                        className="hidden group-hover:block absolute bottom-4 right-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        Issue
                    </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserHome;
