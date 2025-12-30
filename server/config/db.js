import mongoose from "mongoose";

/**
 * Database Connection Function
 * Establishes connection to MongoDB database
 * Uses connection string from environment variables
 * Database name: Job-Portal
 */
const connectDB= async()=>{
    // Log when database connection is established
    mongoose.connection.on('connected',()=>console.log('Database Connected'))

    // Connect to MongoDB using connection string from .env file
    await mongoose.connect(`${process.env.MONGODB_URI}/Job-Portal`)
}

export default connectDB;