import express from "express";
import authProtect from "../middleware/authProtect.js";
import { viewAllBooks, addBook, addBookCopy, editBook, deleteBook } from "../controllers/bookController.js";
import multer from "multer";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Routes
router.get("/", authProtect(), viewAllBooks);
router.post("/", authProtect("librarian", "admin"),
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pdf", maxCount: 1 },
  ]),
  (err, req, res, next) => {
    // Multer error handler middleware - this catches multer errors
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(400).json({ message: err.message });
    } else if (err) {
      console.error("Unknown upload error:", err);
      return res.status(500).json({ message: err.message });
    }
    next();
  },
  (req, res, next) => {
    try {
      req.coverImageUrl = req.files?.coverImage?.[0]?.path;
      req.pdfUrl = req.files?.pdf?.[0]?.path;

      if (!req.coverImageUrl || !req.pdfUrl) {
        return next(new Error("Both cover image and PDF are required"));
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  addBook
);
router.post("/add-copy/:id", authProtect("librarian", "admin"), addBookCopy);
router.put("/:id", authProtect("librarian", "admin"), editBook);
router.delete("/:id", authProtect("librarian", "admin"), deleteBook);

export default router;
