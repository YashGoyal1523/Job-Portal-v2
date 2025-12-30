import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js "
import { v2 as cloudinary } from "cloudinary"

/**
 * Get User Data
 * Retrieves the authenticated user's profile information
 * Route: GET /api/users/user
 * Authentication: Required (Clerk middleware)
 */
export const getUserData=async(req,res)=>{
    // Extract user ID from Clerk authentication token
    const {userId}= await req.auth() 
    
    try{
        // Find user in database by ID
        const user= await User.findById(userId)
        if(!user){
            return res.json({success:false,message:"User Not Found"})
        }
        res.json({success:true,user})
    }
    catch(e){
        res.json({success:false,message:e.message})
    }
}
/**
 * Apply for a Job
 * Allows authenticated users to apply for a job posting
 * Prevents duplicate applications for the same job
 * Route: POST /api/users/apply
 * Authentication: Required (Clerk middleware)
 * Request Body: { jobId: string }
 */
export const applyForJob = async (req,res) =>{
    // Extract job ID from request body and user ID from auth token
    const {jobId}=req.body
    const {userId}= await req.auth()

    try{
        // Check if user has already applied for this job
        const isAlreadyApplied= await JobApplication.find({jobId,userId})
        if(isAlreadyApplied.length>0){
            return res.json({success:false,message:'Already Applied'})
        }
        
        // Get job details to extract company ID
        const jobData=await Job.findById(jobId)

        if(!jobData){
            res.json({success:false,message:"Job Not Found"})
        }

        // Create new job application record
        await JobApplication.create({
            companyId:jobData.companyId,
            userId,
            jobId,
            date:Date.now() // Timestamp when application was submitted
        })
        res.json({success:true,message:"Applied Succesfully"})
    }
    catch(e){
        res.json({success:false,message:e.message})
    }

}
/**
 * Get User Job Applications
 * Retrieves all job applications submitted by the authenticated user
 * Includes populated company and job details for display
 * Route: GET /api/users/applications
 * Authentication: Required (Clerk middleware)
 */
export const getUserJobApplications = async (req,res)=>{
try{
    // Extract user ID from authentication token
    const {userId}= await req.auth()
    
    // Find all applications for this user and populate related data
    const applications= await JobApplication.find({userId})
    .populate('companyId','name email image') // Populate company details
    .populate('jobId','title description location category level salary') // Populate job details
    .exec()

    if(!applications){
        return res.json({success:false,message:'No Job applications found for user'})
    }
     return res.json({success:true,applications})
}
catch(e){
    res.json({success:false,message:e.message})
}
}
/**
 * Update User Resume
 * Allows users to upload or update their resume PDF
 * Uploads file to Cloudinary and stores the secure URL in database
 * Route: POST /api/users/update-resume
 * Authentication: Required (Clerk middleware)
 * File Upload: Single PDF file via multer middleware
 */
export const updateUserResume = async (req,res)=>{
   try{
    // Extract user ID from authentication token
    const {userId}=await req.auth()
    // Get uploaded file from multer middleware
    const resumeFile=req.file
    
    // Find user in database
    const userData=await User.findById(userId)
    
    // If file was uploaded, upload to Cloudinary and update user's resume URL
    if(resumeFile){
        const resumeUpload= await cloudinary.uploader.upload(resumeFile.path)
        userData.resume=resumeUpload.secure_url // Store Cloudinary secure URL
    }
    await userData.save()

    return res.json({success:true,message:"Resume Updated"})
   } 
   catch(e){
    res.json({success:false,message:e.message})
   }
} 