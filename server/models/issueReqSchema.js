import mongoose from "mongoose";

const IssueReqSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    bookcpyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookCopy',
        required: false
    },
    duration: {
        type: Number, // in days
        required: true,
        min: 1
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    actualReturnDate: { 
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'returned'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        required: false
    },
    finePerDay: {
        type: Number,
        default: 10
    },
    fineAmount: {
        type: Number,
        default: 0
    },
    finePaid: {
        type: Boolean,
        default: false
    }
});

const IssueRequest = mongoose.model('IssueRequest', IssueReqSchema);
export default IssueRequest;