import {v2 as cloudinary} from 'cloudinary'

/**
 * Cloudinary Configuration
 * Initializes Cloudinary SDK for image and file storage
 * Used for: Company logos, user profile images, resume PDFs
 * Credentials loaded from environment variables
 */
const connectCloudinary=async()=>{
    cloudinary.config({
        cloud_name:process.env.CLOUDINARY_NAME,
        api_key:process.env.CLOUDINAR_API_KEY,
        api_secret:process.env.CLOUDINARY_SECRET_KEY
    })
}
export default connectCloudinary