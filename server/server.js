import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node"
import { clerkWebhooks } from './controller/webhooks.js'
import bodyParser from 'body-parser';
import connectCloudinary from './config/cloudinary.js'
import companyRoutes from './routes/companyRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import {clerkMiddleware} from '@clerk/express'
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config(); 

// Initialize Express application
const app=express()

// Connect to MongoDB database
await connectDB()
// Connect to Cloudinary for file storage
await connectCloudinary()

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors()) // Enable CORS for cross-origin requests

// Clerk webhooks endpoint (must come before express.json())
// Webhooks require raw body parsing
app.post(
  '/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  clerkWebhooks
);

app.use(express.json()) // Parse JSON request bodies
app.use(clerkMiddleware()) // Clerk authentication middleware for user routes

// ============================================
// ROUTES
// ============================================
// Health check endpoint
app.get('/',(req,res)=> res.send("API WORKING"))

// API route handlers
app.use('/api/company',companyRoutes); // Company/recruiter routes
app.use('/api/jobs',jobRoutes) // Job listing routes
app.use('/api/users',userRoutes) // User/job seeker routes

// ============================================
// SERVER SETUP
// ============================================
// Set port from environment variable or default to 3000
const port=process.env.PORT || 3000

// Setup Sentry error tracking
Sentry.setupExpressErrorHandler(app);

// Start server
app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})
