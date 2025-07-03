import BookCopy from '../models/bookCopySchema.js';
import Book from '../models/bookSchema.js'

// @desc    View all books
// @route   GET /api/books
// search and author filters
// GET /api/books?search=  or /api/books?author= or /api/books?search=<>&author=<> 
const viewAllBooks = async (req, res, next) => {
    try {
        const {search, author} = req.query;
        const query = {};

        if (!req.user || !['admin', 'librarian'].includes(req.user.role))
            query.deleted = { $ne: true };
        if (search)
            query.title = { $regex: search, $options: 'i' }; // case-insensitive search
        if (author)
            query.author = { $regex: author, $options: 'i' }; // case-insensitive search
        
        const limit = parseInt(req.query.limit) || 0;
        const books = await Book.find(query).limit(limit);
        res.status(200).json(books);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a new book
// @route   POST /api/books
const addBook = async (req, res, next) => {
    try {
        const { title, author } = req.body;
        let coverimage = null;

        if (!req.body || !title || !author) {
            const error = new Error('Title and author are required');
            error.status = 400;
            return next(error);
        }
        // Check if the book already exists
        const existingBook = await Book.findOne({ title, author });
        if (existingBook) {
            const error = new Error('Book already exists');
            error.status = 409;
            return next(error);
        }
        let coverImage = null;
        try {
            const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
            const data = await response.json();
            const coverKey = data.docs?.[0]?.cover_edition_key;
            if (coverKey) {
                coverImage = `https://covers.openlibrary.org/b/olid/${coverKey}-L.jpg`;
            }
        } catch (err) {
            console.warn('Error fetching cover image from Open Library:', err.message);
        }
        // If Open Library fails, check for uploaded file (via multer + Cloudinary)
        if (!coverImage && req.file && req.file.path) {
            coverImage = req.file.path;
        }
        // Fallback image if none found
        if (!coverImage) {
            coverImage = 'https://via.placeholder.com/200x300?text=No+Cover';
        }
        // Create a new book
        const newBook = await Book.create({ title, author, coverImage });
        res.status(201).json(newBook);
    } catch (error) {
        next(error);
    }
};

// @desc    Add a book copy
// @route   POST /api/books/add-copy/:id
const addBookCopy = async (req, res, next) => {
    try {
        const bookId = req.params.id;
        // Check if the book exists
        const book = await Book.findById(bookId);
        if (!book) {
            const error = new Error(`Book with id ${bookId} not found!`);
            error.status = 404;
            return next(error);
        }
        // Add a new copy of the book in BookCopy schema
        const newCopy = new BookCopy({ book: bookId });
        await newCopy.save();
        book.availableCopies += 1; // Increment available copies
        await book.save();
        res.status(201).json({ message: 'Book copy added successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Edit book
// @route   PUT /api/books/:id
const editBook = async (req, res, next) => {
    try {
        const { title, author } = req.body;
        if (!req.body || !title || !author) {
            const error = new Error('Title and author are required');
            error.status = 400;
            return next(error);
        }
        // Check if the book exists
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author },
            { new: true, runValidators: true }
        );
        if (!book) {
            const error = new Error(`Book with id ${req.params.id} not found!`);
            error.status = 404;
            return next(error);
        }
        res.status(200).json(book);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete book (soft delete)
// @route   DELETE /api/books/:id
const deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            const error = new Error(`Book with id ${req.params.id} not found!`);
            error.status = 404;
            return next(error);
        }
        book.deleted = true;
        await book.save();
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export { viewAllBooks, addBook, addBookCopy, editBook, deleteBook };