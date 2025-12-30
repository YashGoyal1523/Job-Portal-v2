import express from 'express'
import { ChangeJobApplicationStatus, changeVisibility, deleteJob, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany, aiMatchCandidate, aiGenerateJobDescription, aiCandidateSummary } from '../controller/companyController.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middlewares/authMiddleware.js'

const router=express.Router()

//register a company
router.post('/register',upload.single('image') ,registerCompany) // upload wala for image
//company login
router.post('/login',loginCompany)
//get company data
router.get('/company',protectCompany,getCompanyData)
//post job
router.post('/post-job',protectCompany,postJob)
//get applicants data of company
router.get('/applicants',protectCompany,getCompanyJobApplicants)
//get company job list
router.get('/list-job',protectCompany,getCompanyPostedJobs)
//change application status
router.post('/change-status',protectCompany,ChangeJobApplicationStatus)
//change applications visibility
router.post('/change-visibility',protectCompany,changeVisibility)
//delete job
router.delete('/delete-job',protectCompany,deleteJob)

// ============================================
// AI FEATURE ROUTES (For Recruiters)
// All routes require company authentication (protectCompany middleware)
// ============================================

// AI Route: Match candidate resume to a specific job posting
// Endpoint: POST /api/company/ai/match-candidate
// Used by: View Applications page - AI Insights modal
router.post('/ai/match-candidate',protectCompany,aiMatchCandidate)

// AI Route: Generate professional job description using AI
// Endpoint: POST /api/company/ai/generate-job-description
// Used by: Add Job page - AI Helper feature
router.post('/ai/generate-job-description',protectCompany,aiGenerateJobDescription)

// AI Route: Generate quick summary of a candidate from their resume
// Endpoint: POST /api/company/ai/candidate-summary
// Used by: View Applications page - AI Insights modal
router.post('/ai/candidate-summary',protectCompany,aiCandidateSummary)

export default router