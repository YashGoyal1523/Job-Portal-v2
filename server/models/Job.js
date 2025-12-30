import mongoose from "mongoose";

/**
 * Job Model Schema
 * Stores job posting information created by companies
 */
const jobSchema=new mongoose.Schema({
    title:{type:String , required:true}, // Job title (e.g., "Senior React Developer")
    description:{type:String , required:true}, // Full job description (HTML format)
    location:{type:String , required:true}, // Job location (e.g., "Bangalore")
    category:{type:String , required:true}, // Job category (e.g., "Programming")
    level:{type:String , required:true}, // Experience level (Beginner/Intermediate/Senior)
    salary:{type:Number , required:true}, // Salary amount in rupees
    date:{type:Number , required:true}, // Timestamp when job was posted
    visible:{type:Boolean , default:true}, // Whether job is visible to job seekers
    companyId:{type:mongoose.Schema.Types.ObjectId,ref:'Company' , required:true}, // Reference to Company model
})

const Job=mongoose.model('Job',jobSchema)

export default Job