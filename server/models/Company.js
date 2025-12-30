import mongoose from "mongoose"
 
/**
 * Company Model Schema
 * Stores recruiter/company account information
 * Used for company authentication and job posting
 */
const companySchema = new mongoose.Schema({
    name:{type:String ,required:true}, // Company/recruiter name
    email:{type:String ,required:true,unique:true}, // Company email (unique constraint)
    image:{type:String ,required:true}, // Company logo/image URL
    password:{type:String ,required:true}, // Hashed password for authentication
})

const Company=mongoose.model('Company',companySchema)

export default Company