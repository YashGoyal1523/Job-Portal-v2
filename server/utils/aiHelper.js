import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Gemini AI client using API key from environment variables
// This client is used for all AI-powered features in the application
const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * AI Feature: Resume Quality Score Analyzer
 * 
 * This function uses Google Gemini AI to analyze a candidate's resume and provide
 * comprehensive feedback including quality score, strengths, weaknesses, and suggestions.
 * 
 * @param {string} resumeText - The full text content of the resume to analyze
 * @returns {Object} - Returns an object with success status and analysis data including:
 *   - score: Quality score from 1-10
 *   - strengths: Array of 3 key strengths
 *   - weaknesses: Array of 3 areas to improve
 *   - suggestions: Array of 3 actionable improvement suggestions
 *   - atsScore: ATS (Applicant Tracking System) compatibility score from 1-10
 *   - summary: 2-3 sentence overall assessment
 * 
 * Used by: Job seekers to improve their resumes before applying
 * Endpoint: POST /api/jobs/ai/analyze-resume
 */
export const resumeQualityScore = async (resumeText) => {
    try {
        // Validate input: ensure resume text is provided and not empty
        if (!resumeText || resumeText.trim().length === 0) {
            return { success: false, message: "Resume text required" };
        }

        // Get the Gemini AI model instance (using flash preview for faster responses)
        const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Construct the AI prompt with specific instructions for resume analysis
        // The prompt guides the AI to act as a professional resume reviewer
        const prompt = `You are a professional resume reviewer. Analyze this resume and provide feedback.

Resume:
${resumeText}

Provide your response in this exact JSON format (no markdown, just pure JSON):
{
  "score": <number 1-10>,
  "strengths": [<list 3 strengths as strings>],
  "weaknesses": [<list 3 areas to improve as strings>],
  "suggestions": [<list 3 actionable improvements as strings>],
  "atsScore": <number 1-10 for ATS compatibility>,
  "summary": "<2-3 sentence overall assessment>"
}`;

        // Send prompt to Gemini AI and get the response
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from AI response (AI may wrap JSON in markdown or text)
        // Use regex to find the JSON object in the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { success: false, message: "Invalid response format" };
        }

        // Parse the extracted JSON string into a JavaScript object
        const parsed = JSON.parse(jsonMatch[0]);

        // Return structured response with all analysis data
        return {
            success: true,
            data: {
                score: parsed.score,
                strengths: parsed.strengths,
                weaknesses: parsed.weaknesses,
                suggestions: parsed.suggestions,
                atsScore: parsed.atsScore,
                summary: parsed.summary
            }
        };
    } catch (error) {
        // Log error for debugging and return error response
        console.error("Resume analysis error:", error);
        return { success: false, message: error.message };
    }
};

/**
 * AI Feature: Smart Job Matching
 * 
 * This function uses Google Gemini AI to analyze how well a candidate's skills match
 * a specific job position. It provides detailed matching analysis including matched/missing
 * skills, strengths, gaps, and actionable recommendations.
 * 
 * @param {string|Array} candidateSkills - Candidate's skills (can be array or comma-separated string)
 * @param {string} jobDescription - Full job description text
 * @param {string} jobTitle - Optional job title for better context
 * @returns {Object} - Returns an object with success status and matching data including:
 *   - matchPercentage: Match score from 0-100%
 *   - matchLevel: "High", "Medium", or "Low"
 *   - matchedSkills: Array of skills the candidate has that match the job
 *   - missingSkills: Array of required skills the candidate lacks
 *   - strengths: Array of 2-3 reasons why candidate is a good fit
 *   - gaps: Array of 2-3 skill gaps to address
 *   - recommendations: Array of 2-3 actionable steps to improve candidacy
 * 
 * Used by: Job seekers to understand their fit for a position
 * Endpoint: POST /api/jobs/ai/job-matching
 */
export const smartJobMatching = async (candidateSkills, jobDescription, jobTitle = "") => {
    try {
        // Validate required inputs
        if (!candidateSkills || !jobDescription) {
            return { success: false, message: "Candidate skills and job description required" };
        }

        // Get the Gemini AI model instance
        const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Construct AI prompt for job matching analysis
        // Convert skills array to comma-separated string if needed
        const prompt = `Analyze how well a candidate matches a job position.

Candidate Skills:
${Array.isArray(candidateSkills) ? candidateSkills.join(", ") : candidateSkills}

Job Title: ${jobTitle || "Not specified"}

Job Description:
${jobDescription}

Provide your response in this exact JSON format (no markdown, just pure JSON):
{
  "matchPercentage": <number 0-100>,
  "matchLevel": "<High, Medium, or Low>",
  "matchedSkills": [<list of skills candidate has that match the job>],
  "missingSkills": [<list of required skills candidate lacks>],
  "strengths": [<list 2-3 reasons why candidate is good fit>],
  "gaps": [<list 2-3 skill gaps to address>],
  "recommendations": [<list 2-3 actionable steps to improve candidacy>]
}`;

        // Send prompt to Gemini AI and get the response
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON from AI response (handles markdown-wrapped JSON)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { success: false, message: "Invalid response format" };
        }

        // Parse the extracted JSON string
        const parsed = JSON.parse(jsonMatch[0]);

        // Return structured response with all matching analysis data
        return {
            success: true,
            data: {
                matchPercentage: parsed.matchPercentage,
                matchLevel: parsed.matchLevel,
                matchedSkills: parsed.matchedSkills,
                missingSkills: parsed.missingSkills,
                strengths: parsed.strengths,
                gaps: parsed.gaps,
                recommendations: parsed.recommendations
            }
        };
    } catch (error) {
        // Log error for debugging and return error response
        console.error("Job matching error:", error);
        return { success: false, message: error.message };
    }
};
