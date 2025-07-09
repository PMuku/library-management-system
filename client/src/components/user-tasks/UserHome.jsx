import { useEffect, useState } from 'react';
import fetchWithAuth from '../../utils/fetchWithAuth.js'; // Ensure this utility exists

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
            const res = await fetchWithAuth(`${BACKEND_URL}/api/books?${queryParams.toString()}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to fetchWithAuth books');
            const data = await res.json();
            setBooks(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleIssue = async (bookId) => {
        const duration = prompt("Enter duration in days:");
        if (!duration || isNaN(duration) || duration <= 0) {
            alert("Please enter a valid duration.");
            return;
        }

        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/api/users/issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ bookId, duration: Number(duration) }),
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
        fetchBooks();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Available Books
            </h2>

            {error && (
                <div className="relative flex items-start gap-2 rounded-md bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-4 py-3 text-sm animate-fade-in shadow-sm mb-4">
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

            <form
                onSubmit={handleFilterSubmit}
                className="mb-8 flex flex-col md:flex-row gap-4"
            >
                <input
                    type="text"
                    placeholder="Search by title"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-1/2 transition"
                />
                <input
                    type="text"
                    placeholder="Filter by author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-1/2 transition"
                />
                <button
                    type="submit"
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow transition duration-300"
                >
                    Apply Filters
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                    <div
                        key={book._id}
                        className="relative group border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
                    >
                        {book.coverImage && (
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-48 object-contain mb-3 rounded-lg"
                            />
                        )}

                        <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{book.author}</p>
                        <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                            Available Copies: {book.availableCopies}
                        </p>

                        {book.pdf && (
                            <button
                                onClick={() => window.open(book.pdf, "_blank")}
                                className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md shadow transition"
                            >
                                View PDF
                            </button>
                        )}

                        <button
                            onClick={() => handleIssue(book._id)}
                            className="hidden group-hover:block absolute bottom-4 right-4 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm rounded-md shadow transition"
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
