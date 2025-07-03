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

// @desc    Get all unpaid fines (from returned or approved requests)
// @route   GET /api/users/fines
const getOutstandingFines = async (req, res, next) => {
    try {
        const requests = await IssueRequest.find({
            user: req.user.id,
            finePaid: false,
            fineAmount: { $gt: 0 },
            status: { $in: ['approved', 'returned'] },
        }).populate('bookId', 'title author');

        const totalBooks = requests.length;
        let totalFine = 0;
        for (const req_ of requests) {
            await calculateAndUpdateFine(req_);
            totalFine += req_.fineAmount;
        }

        res.status(200).json({ totalFine, totalBooks });
    } catch (error) {
        next(error);
    }
};


// @desc    Pay fines
// @route   POST /api/users/pay-fine
const payFine = async (req, res, next) => {
    console.log('Reached payFine route');
    try {
        const userId = req.user.id;
        // Get all unpaid fines (approved OR returned)
        const unpaidFines = await IssueRequest.find({
            user: userId,
            finePaid: false,
            fineAmount: { $gt: 0 },
            status: { $in: ['approved', 'returned'] },
        });

        if (unpaidFines.length === 0) {
            return res.status(200).json({ message: 'No pending fines to pay.' });
        }

        for (const request of unpaidFines) {
            // Ensure latest fine value
            await calculateAndUpdateFine(request);
            request.finePaid = true;
            await request.save();
        }

        res.status(200).json({
            message: 'All fines paid successfully.'
        });
    } catch (error) {
        next(error);
    }
};

export { issueBook, getCurrentIssues, getPastIssues, getOutstandingFines, payFine };