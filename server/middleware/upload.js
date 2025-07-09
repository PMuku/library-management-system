import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

// File type whitelist
const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
];

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        try {
            // Validate file type
            //console.log("file:", file);
            if (!allowedMimeTypes.includes(file.mimetype)) {
                throw new Error(`Unsupported file type: ${file.mimetype}`);
            }

            const folder = file.mimetype.startsWith("application/pdf")
                ? "books/pdfs"
                : "books/covers";
                      
            const originalName = file.originalname
                .split(".")[0]
                .trim()
                .replace(/\s+/g, "_") // replace spaces with underscores
                .replace(/[^\w\-]/g, ""); // remove special characters

            return {
                folder,
                resource_type: "auto",
                public_id: originalName,
            };
        } catch (err) {
            console.error("Error in Cloudinary params:", err.message);
            throw err;
        }
    },
});

// Extra: filter files before even reaching Cloudinary
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB limit
    },
});