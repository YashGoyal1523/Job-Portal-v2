import Job from "../models/Job.js"
// Import AI helper functions for job seeker features
import { resumeQualityScore, smartJobMatching } from "../utils/aiHelper.js"

//get all jobs
export const getJobs=async(req,res)=>{
    try{
        const jobs=await Job.find({visible:true})
        .populate({path:'companyId',select:'-password'})

        res.json({success:true,jobs:jobs})
    }
    catch(e){
        res.json({sucess:false,message:e.message})
    }
}
//get a single job by id
export const getJobById=async(req,res)=>{
     try{
        const {id} = req.params
        const job=await Job.findById(id)
        .populate({path:'companyId',select:'-password'})
        
        if(!job){
            return res.json({success:false,message:'Job Not Found'})
        }
        res.json({success:true,job:job})
    }
    catch(e){
        res.json({sucess:false,message:e.message})
    }
}

/**
 * AI Feature Endpoint: Analyze Resume Quality
 * 
 * This endpoint allows job seekers to get AI-powered feedback on their resume.
 * It analyzes the resume text and returns a quality score, strengths, weaknesses,
 * suggestions, ATS compatibility score, and an overall summary.
 * 
 * Route: POST /api/jobs/ai/analyze-resume
 * Request Body: { resumeText: string }
 * Response: { success: boolean, data: { score, strengths, weaknesses, suggestions, atsScore, summary } }
 * 
 * Used by: Resume Analyzer page (/resume-analyzer)
 */
export const analyzeResume = async (req, res) => {
    try {
        // Extract resume text from request body
        const { resumeText } = req.body;
        
        // Validate that resume text is provided
        if (!resumeText) {
            return res.json({ success: false, message: "Resume text required" });
        }

        // Call AI helper function to analyze resume quality
        const result = await resumeQualityScore(resumeText);
        res.json(result);
    } catch (e) {
        // Handle any errors and return error response
        res.json({ success: false, message: e.message });
    }
};

/**
 * AI Feature Endpoint: Smart Job Matching
 * 
 * This endpoint allows job seekers to see how well their skills match a specific job position.
 * It analyzes candidate skills against job requirements and returns match percentage,
 * matched/missing skills, strengths, gaps, and recommendations.
 * 
 * Route: POST /api/jobs/ai/job-matching
 * Request Body: { candidateSkills: string|Array, jobDescription: string, jobTitle?: string }
 * Response: { success: boolean, data: { matchPercentage, matchLevel, matchedSkills, missingSkills, strengths, gaps, recommendations } }
 * 
 * Used by: Job Matcher page (/job-matcher)
 */
export const jobMatchingScore = async (req, res) => {
    try {
        // Extract candidate skills, job description, and optional job title from request
        const { candidateSkills, jobDescription, jobTitle } = req.body;
        
        // Validate required fields
        if (!candidateSkills || !jobDescription) {
            return res.json({ success: false, message: "Candidate skills and job description required" });
        }

        // Call AI helper function to perform smart job matching
        // Pass empty string if jobTitle is not provided
        const result = await smartJobMatching(candidateSkills, jobDescription, jobTitle || "");
        res.json(result);
    } catch (e) {
        // Handle any errors and return error response
        res.json({ success: false, message: e.message });
    }
};