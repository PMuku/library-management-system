import express from 'express'
import connectDB from './db.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import notFound from './middleware/notFound.js';
import books from './routes/books.js';
import users from './routes/users.js';
import librarian from './routes/librarian.js';
import admin from './routes/admin.js';
import auth from './routes/auth.js';

connectDB();
const app = express()
const PORT = process.env.PORT;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger middleware
app.use(logger);

// CORS middleware
import cors from 'cors';
app.use(cors({
    origin: 'http://localhost:5173', // Adjust this to your frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // Allow credentials if needed
}));

// Routes
app.use('/api/books', books);
app.use('/api/admin', admin);
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/librarian', librarian);

// Error handler
app.use(notFound);
app.use(errorHandler);


app.get('/', (req, res) => {
    res.send('Server is up and running...');
});
app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}.`));