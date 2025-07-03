import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
    title: {
        type: String, required: true
    },
    author: {
        type: String, required: true
    },
    availableCopies: {
        type: Number, default: 0, required: false
    },
    deleted: {
        type: Boolean, default: false
    },
    coverImage: {
        type: String, default: 'https://via.placeholder.com/200x300?text=No+Cover'
    }
});

const Book = mongoose.model('Book', BookSchema);
export default Book;