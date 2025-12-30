import jwt from 'jsonwebtoken'

/**
 * Generate JWT Token
 * Creates a JSON Web Token for company authentication
 * Token expires in 30 days
 * @param {string} id - Company ID to encode in token
 * @returns {string} - JWT token string
 */
const generatetoken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'30d' // Token valid for 30 days
    })
}

export default generatetoken