import mongoose from "mongoose";

/**
 * User Model Schema
 * Stores user profile information
 * Note: _id is String type because it uses Clerk user ID
 */
const userSchema = new mongoose.Schema({
_id: { type: String, required: true }, // Clerk user ID (string format)
name: { type: String, required: true }, // User's full name
email: { type: String, required: true,unique: true }, // User's email (unique constraint)
resume: { type:String}, // Cloudinary URL to user's resume PDF (optional)
image: { type: String, required: true } // User's profile image URL
})

const User = mongoose.model('User', userSchema)

export default User;