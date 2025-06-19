import User from '../models/userSchema.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// @desc    User Login
// @route   POST /api/auth/login
const userLogin = async (req, res, next) => {
    try {
        const {username, password} = req.body || {};
        if (!req.body || !username || !password) {
            const error = new Error('Please enter user and pwd');
            error.status = 400;
            return next(error);
        }

        const user = await User.findOne({ username });
        if (!user) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            return next(error);
        }

        const pwdMatch = await bcrypt.compare(password, user.password);
        if (!pwdMatch) {
            const error = new Error('Invalid credentials');
            error.status = 401;
            return next(error);
        }
        // generate access token -> send back in response body
        // generate refresh token -> send back as httpOnly cookie
        const access_token = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                role: user.role,                   // payload
            },             
            process.env.JWT_ACCESS_SECRET,         // secret key
            { expiresIn: '30m' }                   // token expiry
        );
        const refresh_token = jwt.sign(
            { 
                userId: user._id,
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        user.refresh_token = refresh_token;
        await user.save();

        res.status(200).json({ access_token, refresh_token, username: user.username, role: user.role });
    } catch (error) {
        next(error);
    }
};

// @desc    New users can register
// @route   POST /api/auth/register
const userRegister = async (req, res, next) => {
    try {
        const {username, password} = req.body;
        if (!req.body || !username || !password) {
            const error = new Error('Please enter user and pwd');
            error.status = 400;
            return next(error);
        }
        
        const user = await User.findOne({ username });
        if (user) {
            const error = new Error('Username already exists');
            error.status = 409;
            return next(error);
        }

        await User.create({ username: username, password: password});
        res.status(201).json({ confirmation: 'new user created '});

    } catch (error) {
        next(error);
    }
};

// @desc    Admin can create librarians
// @route   POST /api/admin/makelib
const makeLibrarian = async (req, res, next) => {
    try {
        const {username, password} = req.body;
        if (!req.body || !username || !password) {
            const error = new Error('Please enter user and pwd');
            error.status = 400;
            return next(error);
        }
        
        const user = await User.findOne({ username });
        if (user) {
            const error = new Error('Username already exists');
            error.status = 409;
            return next(error);
        }

        await User.create({ username: username, password: password, role: 'librarian'});
        res.status(201).json({ confirmation: 'new librarian created '});

    } catch (error) {
        next(error);
    }
}


// @desc    Handle refresh token & generate new access token
// @route   POST /api/auth/refresh
const handleRefreshToken = async (req, res, next) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) {
            const error = new Error('Forbidden');
            error.status = 403;
            return next(error);
        }

        let payload;
        try {
            payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
        } catch (err) {
            const error = new Error('Invalid or expired refresh token');
            error.status = 403;
            return next(error);
        }

        const user = await User.findById(payload.userId);
        if (!user || user.refresh_token !== refresh_token) {
            const error = new Error('Refresh token mismatch or user not found');
            error.status = 403;
            return next(error);
        }
        const new_access_token = jwt.sign(
            { 
                userId: payload.userId,
                username: payload.username,
                role: payload.role,                   // payload
            },             
            process.env.JWT_ACCESS_SECRET,         // secret key
            { expiresIn: '30m' }                   // token expiry
        );
        res.status(200).json({ new_access_token });
    } catch (error) {
        next(error);
    }
};

// @desc    Handle logout and delete refresh token
// @route   POST /api/auth/logout
const handleLogout = async (req, res, next) => {
    try {
        const {refresh_token} = req.body;
        if (!refresh_token) {
            const error = new Error('Token not provided');
            error.status = 400;
            return next(error);
        }
        const user = await User.findOne({ refresh_token });
        if (!user) {
            const error = new Error('Invalid refresh token');
            error.status = 403;
            return next(error);
        }
        user.refresh_token = null;
        await user.save();
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

export { userLogin, userRegister, makeLibrarian, handleRefreshToken, handleLogout };