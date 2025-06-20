import IssueRequest from '../models/issueReqSchema.js';
import Book from '../models/bookSchema.js';
import BookCopy from '../models/bookCopySchema.js';

// @desc    View all pending issue requests
// @route   GET /api/librarian/pending-requests
const viewPendingRequests = async (req, res, next) => {
    try {
        const requests = await IssueRequest.find({status: 'pending' })
            .sort( {issueDate: 1} )
            .populate('bookId')
            .populate('user', 'username _id');
        res.status(200).json(requests);
    } catch (error) {
        next(error);
    }
};

// @desc    Approve a book issue request
// @route   PUT /api/librarian/approve-request/:id
const approveRequest = async (req, res, next) => {
    try {
        const requestId = req.params.id;
        const finePerDay = req.body.finePerDay || 10; // default fine per day
        const request = await IssueRequest.findById(requestId);
        if (!request) {
            const error = new Error('Request not found');
            error.status = 404;
            return next(error);
        }
        if (request.status !== 'pending') {
            const error = new Error('Request is not pending');
            error.status = 400;
            return next(error);
        }
        const unpaidFine = await IssueRequest.findOne({
            userId: request.user,
            finePaid: false,
            status: { $in: ['returned', 'approved'] }
        });
        if (unpaidFine) {
            const error = new Error('User has unpaid fines');
            error.status = 400;
            return next(error);
        }
        const book = await Book.findById(request.bookId);
        if (!book) {
            const error = new Error('Book not found');
            error.status = 404;
            return next(error);
        }
        const availableCopy = await BookCopy.findOne({ 
            book: request.bookId, 
            isIssued: false 
        });

        if (!availableCopy) {
            const error = new Error('No available copies for this book');
            error.status = 400;
            return next(error);
        }
        // Reserve the copy
        availableCopy.isIssued = true;
        await availableCopy.save();
        book.availableCopies -= 1;
        await book.save();
        // Assign to request
        request.bookcpyId = availableCopy._id;
        request.status = 'approved';
        request.finePerDay = finePerDay;
        request.issueDate = new Date();
        await request.save();
        res.status(200).json({ message: 'Request approved', request });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject a book issue request
// @route   PUT /api/librarian/reject-request/:id
const rejectRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const request = await IssueRequest.findById(id);
        if (!request) {
            const error = new Error('Request not found');
            error.status = 404;
            return next(error);
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request is not pending' });
        }

        request.status = 'rejected';
        request.rejectionReason = reason || 'No reason provided';
        await request.save();

        res.status(200).json(request);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark book as returned
// @route   PUT /api/librarian/mark-returned/:id
const markReturned = async (req, res, next) => {
    try {
        const { id } = req.params;
        const request = await IssueRequest.findById(id);
        if (!request) {
            const error = new Error('Request not found');
            error.status = 404;
            return next(error);
        }
        if (request.status !== 'approved') {
            const error = new Error('Request is not approved');
            error.status = 400;
            return next(error);
        }
        const copy = await BookCopy.findById(request.bookcpyId);
        if (copy) {
            copy.isIssued = false;
            await copy.save();
            const book = await Book.findById(request.bookId);
            if (book) {
                book.availableCopies += 1;
                await book.save();
            }
        }
        request.actualReturnDate = new Date();
        request.status = 'returned';

        const dueDate = new Date(request.issueDate.getTime() + request.duration * 24 * 60 * 60 * 1000);
        if (request.actualReturnDate > dueDate) {
            const numDaysLate = Math.ceil((request.actualReturnDate - dueDate) / (1000 * 60 * 60 * 24));
            request.finePaid = false;
            request.fineAmount = numDaysLate * request.finePerDay;
        } else {
            request.finePaid = true;
            request.fineAmount = 0;
        }
        await request.save();
        res.status(200).json({ message: 'Book marked as returned', request });
    } catch (error) {
        next(error);
    }
};

// @desc    View all currently issued books
// @route   GET /api/librarian/current-issues

const getIssuedBooks = async (req, res, next) => {
    try {
        const issuedBooks = await IssueRequest.find({
            status: 'approved'
        }).populate('book user');
        res.status(200).json(issuedBooks);
    } catch (error) {
        next(error);
    }
};

// @desc    View overdue users
// @route   GET /api/librarian/overdue-users
const getOverdueUsers = async (req, res, next) => {
  try {
    const now = new Date();

    // Requests with approved status and due date before now
    const overdueRequests = await IssueRequest.find({
      status: 'approved',
      issueDate: { $exists: true },
      $expr: {
        $lt: [
          { $add: ['$issueDate', { $multiply: ['$duration', 24 * 60 * 60 * 1000] }] },
          now
        ]
      }
    }).populate('user book');

    res.status(200).json(overdueRequests);
  } catch (error) {
    next(error);
  }
};

export { viewPendingRequests, approveRequest, rejectRequest, markReturned, getIssuedBooks, getOverdueUsers };