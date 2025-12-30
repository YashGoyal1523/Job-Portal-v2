import jwt from 'jsonwebtoken'
import Company from '../models/Company.js'

/**
 * Company Authentication Middleware
 * Protects routes that require company/recruiter authentication
 * Verifies JWT token and attaches company data to request object
 * Used for: Company dashboard routes, job posting, viewing applications
 */
export const protectCompany = async (req,res,next) =>{

    // Extract token from request headers
    const token = req.headers.token

    // If no token provided, return unauthorized error
    if(!token){
        
        return res.json({success:false,message:"Not authorised,Login again"})
    }
    try{
       // Verify JWT token using secret key
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        
        // Find company in database and attach to request (excluding password)
        req.company= await Company.findById(decoded.id).select('-password')
       
        // Continue to next middleware/route handler
        next()
    }
    catch(e){
        // If token is invalid or expired, return error
        res.json({success:false,message:e.message})
    }
}