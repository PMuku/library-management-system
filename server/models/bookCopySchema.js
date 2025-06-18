import mongoose from "mongoose";

const BookCopySchema = new mongoose.Schema({
    book: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true 
    },
    isIssued: { 
        type: Boolean,
        default: false 
    }
});

const BookCopy = mongoose.model('BookCopy', BookCopySchema);
export default BookCopy;
