import express from "express";
import authProtect from "../middleware/authProtect.js";
import { viewAllBooks, addBook, addBookCopy, editBook, deleteBook } from "../controllers/bookController.js";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";

const router = express.Router();
const upload = multer({ storage });

// Get all books/ particular books based on query
router.get('/', authProtect(), viewAllBooks);

// Add a new book
router.post('/', authProtect('librarian', 'admin'), upload.single('coverImage'), addBook);
router.post('/add-copy/:id', authProtect('librarian', 'admin'), addBookCopy);
// Edit book by ID
router.put('/:id', authProtect('librarian', 'admin'), editBook);

// Delete book by ID
router.delete('/:id', authProtect('librarian', 'admin'), deleteBook);

// get id by performing a GET request to /api/books/ with filters
// and then use the id in the PUT/ DELETE request to /api/books/:id

export default router;