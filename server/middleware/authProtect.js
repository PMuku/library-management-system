import jwt from 'jsonwebtoken';

const authProtect = (...allowedRoles) => {
    return (req, res, next) => {
        // extract jwt token from 'Bearer <token>'
        // verify token with JWT_SECRET
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                const error = new Error('No token provided, authorization denied.');
                error.status = 401;
                return next(error);
            }
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

            req.user = { id: decoded.userId, role: decoded.role };
            if (!req.user || (allowedRoles.length && !allowedRoles.includes(decoded.role))) {
                const error = new Error('Access denied: insufficient permissions');
                error.status = 403;
                return next(error);
            }
            next();

        } catch (err) {
            const error = new Error('Invalid Token, authorization denied.');
            error.status = 401;
            return next(error);
        }
    };
};

export default authProtect;