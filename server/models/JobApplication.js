import mongoose from "mongoose";

/**
 * Job Application Model Schema
 * Stores job application records linking users to job postings
 * Tracks application status (Pending/Accepted/Rejected)
 */
const JobApplicationSchema=new mongoose.Schema({
    userId:{type:String , ref:'User',required:true}, // Clerk user ID (string format)
    companyId:{type:mongoose.Schema.Types.ObjectId , ref:'Company',required:true}, // Reference to Company model
    jobId:{type:mongoose.Schema.Types.ObjectId , ref:'Job',required:true}, // Reference to Job model
    status:{type:String,default:'Pending'}, // Application status: 'Pending', 'Accepted', or 'Rejected'
    date:{type:Number,required:true} // Timestamp when application was submitted
})

const JobApplication=mongoose.model('JobApplication',JobApplicationSchema)

export default JobApplication