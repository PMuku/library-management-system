import adminInit from './adminInit.js';
import mongoose from 'mongoose';
const uri = process.env.MONGO_URI;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDB() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    // Initialize admin user
    await adminInit();
  } catch(err) {
    // Ensures that the client will close when you finish/error
    console.error("MongoDB connection error: ", err);
    process.exit(1);
  }
};

export default connectDB;