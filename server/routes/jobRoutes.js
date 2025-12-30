import express from 'express'
import { getJobById, getJobs, analyzeResume, jobMatchingScore } from '../controller/jobController.js'

const router = express.Router()

//route to get all jobs data
router.get('/',getJobs)
//route to get a single job by id
router.get('/:id',getJobById)

// ============================================
// AI FEATURE ROUTES (For Job Seekers)
// ============================================

// AI Route: Analyze resume quality and get feedback
// Endpoint: POST /api/jobs/ai/analyze-resume
// Used by: Resume Analyzer page
router.post('/ai/analyze-resume', analyzeResume)

// AI Route: Match candidate skills to job requirements
// Endpoint: POST /api/jobs/ai/job-matching
// Used by: Job Matcher page
router.post('/ai/job-matching', jobMatchingScore)

export default router