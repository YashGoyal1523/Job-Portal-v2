import express from 'express'
import { applyForJob, getUserData, getUserJobApplications, updateUserResume } from '../controller/userController.js'
import upload from '../config/multer.js'

const router=express.Router()

// ============================================
// USER ROUTES (Job Seeker Routes)
// All routes require Clerk authentication middleware
// ============================================

// Get authenticated user's profile data
router.get('/user',getUserData)

// Apply for a job posting
router.post('/apply',applyForJob)

// Get all job applications submitted by the user
router.get('/applications',getUserJobApplications)

// Upload or update user's resume PDF
// Uses multer middleware to handle file upload
router.post('/update-resume',upload.single('resume'),updateUserResume)

export default router;