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
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedPDF, setSelectedPDF] = useState(null);
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    const fetchBooks = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (author) queryParams.append('author', author);
            queryParams.append('isDeleted', 'false');
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

            const res = await fetch(`${BACKEND_URL}/api/books`, {
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

            {/* Initial Book Form */}
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
                        Next
                    </button>
                </form>
            )}

            {showUploadDialog && (
                <form
                    onSubmit={handleFinalSubmit}
                    className="mb-6 flex flex-col gap-4 p-4 border rounded bg-gray-50 max-w-xl"
                >
                    <p className="text-lg font-semibold">Step 2: Upload Files</p>
                    <p className="text-sm text-gray-600 mb-2">
                        Upload a <strong>cover image</strong> (required) and a <strong>PDF of the book</strong> (required).
                    </p>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">Cover Image (required)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                            className="p-2 border border-gray-300 rounded"
                        />
                        {selectedFile && (
                            <span className="text-sm text-green-600 mt-1">Selected: {selectedFile.name}</span>
                        )}
                        <span className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG</span>
                    </div>

                    <div className="flex flex-col">
                        <label className="mb-1 font-medium text-gray-700">PDF of the Book (Required)</label>
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) => setSelectedPDF(e.target.files[0])}
                            className="p-2 border border-gray-300 rounded"
                            required
                        />
                        {selectedPDF && (
                            <span className="text-sm text-green-600 mt-1">Selected: {selectedPDF.name}</span>
                        )}
                        <span className="text-xs text-gray-500 mt-1">Only PDF format allowed</span>
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Submit Book
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUploadDialog(false)}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                            Back
                        </button>
                    </div>
                </form>
            )}

            {/* Filters */}
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

            {/* Book Display */}
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
                            { book.pdf && (
                                <button
                                    onClick = {() => window.open(book.pdf, '_blank')}
                                    className = "px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
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
