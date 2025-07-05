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
    const coverImageFile = req.files?.coverImage?.[0];
    const pdfFile = req.files?.pdf?.[0];

    if (!title || !author) {
      return next(new Error("Title and author are required"));
    }

    if (!coverImageFile || !pdfFile) {
      return next(new Error("Both cover image and PDF are required"));
    }
    const coverImageUrl = coverImageFile.path;
    const pdfUrl = pdfFile.path;
    const existingBook = await Book.findOne({ title, author });
    if (existingBook) {
      return next(new Error("Book already exists"));
    }

    const newBook = await Book.create({
      title,
      author,
      coverImage: coverImageUrl,
      pdf: pdfUrl,
    });

    res.status(201).json(newBook);
  } catch (err) {
    next(err);
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