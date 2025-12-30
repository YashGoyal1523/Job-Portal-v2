import multer from "multer";

/**
 * Multer Configuration
 * Handles file uploads (images, resumes) from client
 * Uses disk storage - files are temporarily stored before uploading to Cloudinary
 */
const storage=multer.diskStorage({})

// Create multer instance with disk storage configuration
const upload=multer({storage:storage})

export default upload 