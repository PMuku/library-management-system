import IssueRequest from "../models/issueReqSchema.js";
import calculateAndUpdateFine from "../utils/calculateFine.js";

// @desc    Create a new book issue request
// @route   POST /api/users/issue
const issueBook = async (req, res, next) => {
    try {
        const { bookId, duration } = req.body;
        const userId = req.user.id;
        if (!bookId) {
            const error = new Error('Book ID required');
            error.status = 400;
            return next(error);
        }
        const alreadyRequested = await IssueRequest.findOne({
            user: userId,
            bookId,
            status: { $in: ['pending', 'approved'] }
        });
        if (alreadyRequested) {
            const error = new Error('You already have a pending or approved request for this book.');
            error.status = 400;
            return next(error);
        }
        const pendingFines = await IssueRequest.findOne({
            user: userId,
            finePaid: false,
            status: 'returned'
        });
        if (pendingFines) {
            const error = new Error('You have pending fines. Please pay them before issuing a new book.');
            error.status = 403;
            return next(error);
        }
        const newRequest = await IssueRequest.create({
            user: userId,
            bookId: bookId,
            duration, // default to 14 days if not specified
            status: 'pending'
        });
        res.status(201).json(newRequest);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all current issue requests for the user
// @route   GET /api/users/view-issued-current
// current issues (approved and not returned)
const getCurrentIssues = async (req, res, next) => {
    try {
        const current = await IssueRequest.find({
            user: req.user.id,
            status: 'approved'
        }).populate('bookcpyId').populate('bookId', 'title author');
        for (const req_ of current) {
            await calculateAndUpdateFine(req_);
        }
        res.status(200).json(current);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all past issue requests for the user
// @route   GET /api/users/view-issued-past
const getPastIssues = async (req, res, next) => {
    try {
        const past = await IssueRequest.find({ 
            user: req.user.id,
            status: { $in: ['returned', 'rejected'] }
        }).populate('bookcpyId').populate('bookId', 'title author');
        res.status(200).json(past);
    } catch (error) {
        next(error);
    }
};

// @desc    Pay fines
// @route   POST /api/users/pay-fine
const payFine = async (req, res, next) => {
    console.log('Reached payFine route');
    try {
        const { requestId } = req.body;
        if (!requestId) {
            const error = new Error('Request ID required');
            error.status = 400;
            return next(error);
        }
        
        const request = await IssueRequest.findOne({
            _id: requestId,
            user: req.user.id,
            status: 'approved',
        });
        if (!request) {
            const error = new Error('Invalid request ID');
            error.status = 404;
            return next(error);
        }
        if (request.finePaid) {
            const error = new Error('Fine already paid');
            error.status = 400;
            return next(error);
        }
        request.finePaid = true;
        await request.save();
        res.status(200).json({ message: 'Fine paid successfully' });
    } catch (error) {
        next(error);
    }
};

export { issueBook, getCurrentIssues, getPastIssues, payFine };