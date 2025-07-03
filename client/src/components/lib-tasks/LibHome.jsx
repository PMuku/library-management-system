import { useEffect, useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LibHome() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [author, setAuthor] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');

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

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleDelete = async (bookId) => {
        if (!confirm("Are you sure you want to delete this book?")) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/books/${bookId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to delete book');
            fetchBooks();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddCopy = async (bookId) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/books/add-copy/${bookId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });
            if (!res.ok) throw new Error('Failed to add copy');
            fetchBooks();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddBook = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BACKEND_URL}/api/books`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: JSON.stringify({ title: newTitle, author: newAuthor }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to add book');
            }

            setNewTitle('');
            setNewAuthor('');
            setShowForm(false);
            fetchBooks();
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
            <h2 className="text-2xl font-semibold mb-4">Manage Books</h2>
            {error && <p className="text-red-600">{error}</p>}

            <div className="mb-4">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    + Add New Book
                </button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleAddBook}
                    className="mb-6 flex flex-col md:flex-row gap-4 items-start"
                >
                    <input
                        type="text"
                        placeholder="Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="p-2 border border-gray-300 rounded w-full md:w-1/3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Author"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="p-2 border border-gray-300 rounded w-full md:w-1/3"
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Submit
                    </button>
                </form>
            )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                    <div
                        key={book._id}
                        className="relative group border border-gray-300 rounded-xl p-4 shadow hover:shadow-lg transition bg-white"
                    >
                        {book.coverImage && (
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-48 object-contain mb-3 rounded"
                            />
                        )}
                        <h3 className="text-lg font-semibold">{book.title}</h3>
                        <p className="text-sm text-gray-600">{book.author}</p>
                        <p className="text-sm mt-1">Available Copies: {book.availableCopies}</p>

                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={() => handleAddCopy(book._id)}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                                + Add Copy
                            </button>
                            <button
                                onClick={() => handleDelete(book._id)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LibHome;
