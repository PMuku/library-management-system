import { useEffect, useState } from 'react';
import fetchWithAuth from '../../utils/fetchWithAuth.js'; // Ensure this utility exists
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function LibHome() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [author, setAuthor] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedPDF, setSelectedPDF] = useState(null);
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    const fetchBooks = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (author) queryParams.append('author', author);
            queryParams.append('isDeleted', 'false');
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

    const handleDelete = async (bookId) => {
        if (!confirm("Are you sure you want to delete this book?")) return;
        try {
            const res = await fetchWithAuth(`${BACKEND_URL}/api/books/${bookId}`, {
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
            const res = await fetchWithAuth(`${BACKEND_URL}/api/books/add-copy/${bookId}`, {
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

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        setShowUploadDialog(true);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        console.log("💡 Final Submit Called");
        console.log("Cover File:", selectedFile);
        console.log("PDF File:", selectedPDF);

        if (!selectedFile) {
            alert('Please upload a cover image.');
            return;
        }

        if (!selectedPDF) {
            alert('Please upload a PDF.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newTitle);
            formData.append('author', newAuthor);
            formData.append('coverImage', selectedFile);  // ✅ must be "coverImage"
            formData.append('pdf', selectedPDF);          // ✅ must be "pdf"

            const res = await fetchWithAuth(`${BACKEND_URL}/api/books`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                console.log(errData.message);
                throw new Error(errData.message || 'Failed to add book');
            }

            setNewTitle('');
            setNewAuthor('');
            setSelectedFile(null);
            setSelectedPDF(null);
            setShowUploadDialog(false);
            setShowForm(false);


            fetchBooks();
        } catch (err) {
            console.error('Submit error:', err);
            alert(err.message);
        }
    };


    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchBooks();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Manage Books</h2>

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

            <div className="mb-4">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm transition"
                >
                    + Add New Book
                </button>
            </div>

            {showForm && !showUploadDialog && (
                <form
                    onSubmit={handleInitialSubmit}
                    className="mb-6 flex flex-col md:flex-row gap-4 items-start"
                >
                    <input
                        type="text"
                        placeholder="Title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-1/3"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Author"
                        value={newAuthor}
                        onChange={(e) => setNewAuthor(e.target.value)}
                        className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-1/3"
                        required
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                    >
                        Next
                    </button>
                </form>
            )}

            {showUploadDialog && (
                <form
                    onSubmit={handleFinalSubmit}
                    className="mb-6 flex flex-col gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 max-w-xl"
                >
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">Step 2: Upload Files</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Upload a <strong>cover image</strong> and a <strong>PDF of the book</strong> (both required).
                    </p>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                            Cover Image (required)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        {selectedFile && (
                            <span className="text-sm text-green-600 mt-1">Selected: {selectedFile.name}</span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Accepted formats: JPG, PNG</span>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
                            PDF of the Book (required)
                        </label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setSelectedPDF(e.target.files[0])}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            required
                        />
                        {selectedPDF && (
                            <span className="text-sm text-green-600 mt-1">Selected: {selectedPDF.name}</span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Only PDF format allowed</span>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            Submit Book
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUploadDialog(false)}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                        >
                            Back
                        </button>
                    </div>
                </form>
            )}

            <form onSubmit={handleFilterSubmit} className="mb-8 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search by title"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-1/2"
                />
                <input
                    type="text"
                    placeholder="Filter by author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-1/2"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md font-medium shadow transition"
                >
                    Apply Filters
                </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                    <div
                        key={book._id}
                        className="relative group border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-xl p-4 shadow-md hover:shadow-lg transition"
                    >
                        {book.coverImage && (
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-48 object-contain mb-3 rounded-md"
                            />
                        )}
                        <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{book.author}</p>
                        <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                            Available Copies: {book.availableCopies}
                        </p>

                        <div className="mt-4 flex gap-2 flex-wrap">
                            <button
                                onClick={() => handleAddCopy(book._id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition"
                            >
                                + Add Copy
                            </button>
                            <button
                                onClick={() => handleDelete(book._id)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition"
                            >
                                Delete
                            </button>
                            {book.pdf && (
                                <button
                                    onClick={() => window.open(book.pdf, '_blank')}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition"
                                >
                                    View PDF
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

}

export default LibHome;
