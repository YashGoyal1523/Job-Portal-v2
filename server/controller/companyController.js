import Company from "../models/Company.js"
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from "cloudinary"
import generatetoken from "../utils/generateToken.js"
import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
// Import AI helper functions for recruiter features
import { matchCandidateToJob, generateJobDescription, generateCandidateSummary } from "../utils/aiHelper.js"

/**
 * Register New Company
 * Creates a new company/recruiter account
 * Uploads company logo to Cloudinary and hashes password
 * Route: POST /api/company/register
 * File Upload: Company logo image via multer middleware
 */
export const registerCompany=async(req,res)=>{
    // Extract registration data from request body
    const {name,email,password} =req.body
    const imageFile=req.file // Company logo file from multer

    // Validate required fields
    if(!name||!email||!password||!imageFile){
        return res.json({success:false , message : 'Missing Details'})
    }

    try{
        // Check if company with this email already exists
        const companyExists=await Company.findOne({email})
        if(companyExists){
            return res.json({success:false , message : 'Company Already Exists'})
           }

        // Hash password using bcrypt (salt rounds: 10)
        const salt= await bcrypt.genSalt(10)
        const hashPassword=await bcrypt.hash(password,salt)

        // Upload company logo to Cloudinary
        const imageUpload=await cloudinary.uploader.upload(imageFile.path)

        // Create new company record in database
        const company=await Company.create({
            name:name,
            email:email,
            password:hashPassword,
            image:imageUpload.secure_url // Store Cloudinary secure URL
        })
        
        // Return success response with company data (excluding password) and JWT token
        res.json({
            success:true,
            company:{
                _id:company._id,
                name:company.name,
                email:company.email,
                image:company.image
            },
            message:"Registered Successfully",
            token:generatetoken(company._id) // Generate JWT token for authentication
        })
        }
        catch(error){
            res.json({
                success:false,
                message:error.message
            })
        }
    }


/**
 * Company Login
 * Authenticates company/recruiter and returns JWT token
 * Compares provided password with hashed password in database
 * Route: POST /api/company/login
 * Request Body: { email: string, password: string }
 */
export const loginCompany=async(req,res)=>{
 const {email,password} = req.body
     try{
       // Find company by email
       const company=await Company.findOne({email})
    if (!company) {
      return res.json({
        success: false,
        message: "Invalid email or password"
      });
    }
      // Compare provided password with hashed password in database
      if(await bcrypt.compare(password,company.password)){
        // Password matches - return company data and JWT token
        res.json({
            success:true,
            company:{
                _id:company._id,
                name:company.name,
                email:company.email,
                image:company.image
            },
             message:"Logged in Successfully",
             token:generatetoken(company._id) // Generate JWT token
        })
       } 
       else{
        // Password doesn't match
        res.json({
            success:false,
            message:"Invalid email or password"
        })
       }
     }
     catch(e){
        res.json({success:false,message:e.message})
     }
}
 
/**
 * Get Company Data
 * Returns authenticated company's profile information
 * Route: GET /api/company/company
 * Authentication: Required (protectCompany middleware)
 */
export const getCompanyData = async (req,res)=>{
    
    try{
        // Company data attached by protectCompany middleware
        const company=req.company
        res.json({success:true,company})
    }
    catch(e){
        res.json({success:false,message:e.message})
    }
}

/**
 * Post New Job
 * Creates a new job posting for the authenticated company
 * Route: POST /api/company/post-job
 * Authentication: Required (protectCompany middleware)
 * Request Body: { title, description, location, salary, level, category }
 */
export const postJob = async (req,res)=>{

    // Extract job details from request body
    const {title,description,location,salary,level,category}=req.body

    // Get company ID from authenticated company (set by middleware)
    const companyId=req.company._id

    try{
        // Create new job posting
        const newJob=new Job({
            title:title,
            description,
            location,
            salary,
            companyId,
            date:Date.now(), // Current timestamp
            level,
            category
        })
        await newJob.save()
        res.json({success:true,message:"Job added successfully",newJob:newJob})
    }
    catch(e){
        res.json({success:false,message:e.message})
    }

}
/**
 * Get Company Job Applicants
 * Retrieves all job applications for jobs posted by the company
 * Includes populated user and job details
 * Route: GET /api/company/applicants
 * Authentication: Required (protectCompany middleware)
 */
export const getCompanyJobApplicants = async (req,res)=>{
    try{
        const companyId=req.company._id
        // Find all applications for company's jobs and populate related data
        const applications=await JobApplication.find({companyId})
        .populate('userId','name image resume') // Populate user details
        .populate('jobId','title location category level salary') // Populate job details
        .exec()

        return res.json({success:true,applications})
    }
    catch(e){
        res.json({success:false,message:e.message})
    }
}

/**
 * Get Company Posted Jobs
 * Retrieves all jobs posted by the company with applicant count
 * Route: GET /api/company/list-job
 * Authentication: Required (protectCompany middleware)
 */
export const getCompanyPostedJobs = async (req,res)=>{
 try{
    const companyId=req.company._id
    // Find all jobs posted by this company
    const jobs=await Job.find({companyId})

    // Add applicant count to each job
    const jobsData= await Promise.all( jobs.map(async (job)=>{
        const applicants=await JobApplication.find({jobId:job._id})
        return {...job.toObject(),applicants:applicants.length} // Add applicant count
    }))


    res.json({success:true,jobsData})
 }
 catch(e){
    res.json({success:false,message:e.message})
 }
}
/**
 * Change Job Application Status
 * Updates the status of a job application (Pending/Accepted/Rejected)
 * Route: POST /api/company/change-status
 * Authentication: Required (protectCompany middleware)
 * Request Body: { id: string, status: string }
 */
export const ChangeJobApplicationStatus= async (req,res)=>{
  
    try{
  const {id,status} =req.body
    // Find job application and update status
    await JobApplication.findOneAndUpdate({_id:id},{status:status})

    res.json({success:true,message:"Status changed"})
    }
    catch(e){
        res.json({success:false,message:e.message})
    }
}

/**
 * Change Job Visibility
 * Toggles job visibility (show/hide from public listings)
 * Only allows company that owns the job to change visibility
 * Route: POST /api/company/change-visibility
 * Authentication: Required (protectCompany middleware)
 * Request Body: { id: string }
 */
export const changeVisibility=async(req,res)=>{
    try{
        const {id} = req.body
        const companyId=req.company._id

        // Find job by ID
        const job=await Job.findById(id)

        // Security check: Only allow company that owns the job to change visibility
        if(companyId.toString()===job.companyId.toString()){
            job.visible=!job.visible // Toggle visibility
        }
        await job.save()

        res.json({success:true,job})
    }
    catch(e){
        res.json({success:false,message:e.message})
    }
}

//delete a job
export const deleteJob = async (req, res) => {
  try {
    const  id  = req.query.id;
    const companyId = req.company._id;

    const job = await Job.findById(id);
    if (!job) return res.json({ success: false, message: 'Job not found' });

    // Check if the job belongs to the requesting company
    if (companyId.toString() !== job.companyId.toString()) {
      return res.json({ success: false, message: 'Unauthorized' });
    }

    // Delete job and related job applications
    await Job.findByIdAndDelete(id);
    await JobApplication.deleteMany({ jobId: id });

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (e) {
    res.json({ success: false, message: e.message });
  }
};

/**
 * AI Feature Endpoint: Match Candidate to Job (For Recruiters)
 * 
 * This endpoint allows recruiters to analyze how well a candidate matches a specific job posting.
 * It compares the candidate's resume against the job description and returns match percentage,
 * match level, summary, key strengths, concerns, and a recommendation.
 * 
 * Route: POST /api/company/ai/match-candidate
 * Authentication: Required (company token)
 * Request Body: { resumeText: string, jobId: string }
 * Response: { success: boolean, data: { matchPercentage, matchLevel, summary, keyStrengths, keyConcerns, recommendation } }
 * 
 * Used by: View Applications page - AI Insights modal
 */
export const aiMatchCandidate = async (req, res) => {
    try {
        // Extract resume text and job ID from request body
        const { resumeText, jobId } = req.body;
        
        // Validate required fields
        if (!resumeText || !jobId) {
            return res.json({ success: false, message: "Resume text and job ID required" });
        }

        // Get job details from database
        const job = await Job.findById(jobId);
        if (!job) {
            return res.json({ success: false, message: "Job not found" });
        }

        // Security check: Ensure the job belongs to the requesting company
        // This prevents companies from analyzing candidates for other companies' jobs
        const companyId = req.company._id;
        if (companyId.toString() !== job.companyId.toString()) {
            return res.json({ success: false, message: "Unauthorized" });
        }

        // Call AI helper function to match candidate resume against job description
        const result = await matchCandidateToJob(resumeText, job.description, job.title);
        res.json(result);
    } catch (e) {
        // Handle any errors and return error response
        res.json({ success: false, message: e.message });
    }
};

/**
 * AI Feature Endpoint: Generate Job Description (For Recruiters)
 * 
 * This endpoint allows recruiters to generate professional job descriptions using AI.
 * It takes a job title and optional requirements/skills, then generates a complete
 * job description with key requirements, suggested skills, and tips.
 * 
 * Route: POST /api/company/ai/generate-job-description
 * Authentication: Required (company token)
 * Request Body: { jobTitle: string, requirements?: string, skills?: string }
 * Response: { success: boolean, data: { description, keyRequirements, suggestedSkills, tips } }
 * 
 * Used by: Add Job page - AI Helper feature
 */
export const aiGenerateJobDescription = async (req, res) => {
    try {
        // Extract job title and optional requirements/skills from request body
        const { jobTitle, requirements, skills } = req.body;
        
        // Validate that job title is provided (required field)
        if (!jobTitle) {
            return res.json({ success: false, message: "Job title required" });
        }

        // Call AI helper function to generate job description
        // Pass empty strings if requirements or skills are not provided
        const result = await generateJobDescription(jobTitle, requirements || "", skills || "");
        res.json(result);
    } catch (e) {
        // Handle any errors and return error response
        res.json({ success: false, message: e.message });
    }
};

/**
 * AI Feature Endpoint: Generate Candidate Summary (For Recruiters)
 * 
 * This endpoint allows recruiters to get a quick AI-generated summary of a candidate.
 * It analyzes the resume and extracts key information like experience level, top skills,
 * education, and years of experience.
 * 
 * Route: POST /api/company/ai/candidate-summary
 * Authentication: Required (company token)
 * Request Body: { resumeText: string, candidateName?: string }
 * Response: { success: boolean, data: { summary, experienceLevel, topSkills, education, yearsOfExperience } }
 * 
 * Used by: View Applications page - AI Insights modal
 */
export const aiCandidateSummary = async (req, res) => {
    try {
        // Extract resume text and optional candidate name from request body
        const { resumeText, candidateName } = req.body;
        
        // Validate that resume text is provided (required field)
        if (!resumeText) {
            return res.json({ success: false, message: "Resume text required" });
        }

        // Call AI helper function to generate candidate summary
        // Pass empty string if candidate name is not provided
        const result = await generateCandidateSummary(resumeText, candidateName || "");
        res.json(result);
    } catch (e) {
        // Handle any errors and return error response
        res.json({ success: false, message: e.message });
    }
};