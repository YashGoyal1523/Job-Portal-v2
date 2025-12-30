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

/**
 * AI Feature: Match Candidate to Job (For Recruiters)
 * 
 * This function uses Google Gemini AI to analyze how well a candidate's resume matches
 * a specific job posting. It provides detailed analysis including match percentage,
 * match level, summary, key strengths, concerns, and recommendation.
 * 
 * @param {string} resumeText - The full text content of the candidate's resume
 * @param {string} jobDescription - Full job description text
 * @param {string} jobTitle - Optional job title for better context
 * @returns {Object} - Returns an object with success status and matching data including:
 *   - matchPercentage: Match score from 0-100%
 *   - matchLevel: "High", "Medium", or "Low"
 *   - summary: Summary of candidate fit for this role
 *   - keyStrengths: Array of key strengths for this role
 *   - keyConcerns: Array of concerns or gaps
 *   - recommendation: "Strong Candidate", "Consider Interview", or "Not a Good Fit"
 * 
 * Used by: Recruiters to evaluate candidate fit for a specific job
 * Endpoint: POST /api/company/ai/match-candidate
 */
export const matchCandidateToJob = async (resumeText, jobDescription, jobTitle = "") => {
    try {
        // Validate required inputs
        if (!resumeText || !jobDescription) {
            return { success: false, message: "Resume text and job description required" };
        }

        // Get the Gemini AI model instance
        const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Construct AI prompt for candidate-job matching analysis
        const prompt = `Analyze how well a candidate matches a specific job position.

Candidate Resume:
${resumeText}

Job Title: ${jobTitle || "Not specified"}

Job Description:
${jobDescription}

Provide your response in this exact JSON format (no markdown, just pure JSON):
{
  "matchPercentage": <number 0-100>,
  "matchLevel": "<High, Medium, or Low>",
  "summary": "<2-3 sentence summary of candidate fit for this role>",
  "keyStrengths": [<list 2-3 key strengths for this role>],
  "keyConcerns": [<list 2-3 concerns or gaps>],
  "recommendation": "<Strong Candidate, Consider Interview, or Not a Good Fit>"
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
                summary: parsed.summary,
                keyStrengths: parsed.keyStrengths,
                keyConcerns: parsed.keyConcerns,
                recommendation: parsed.recommendation
            }
        };
    } catch (error) {
        // Log error for debugging and return error response
        console.error("Candidate matching error:", error);
        return { success: false, message: error.message };
    }
};

/**
 * AI Feature: Generate Job Description (For Recruiters)
 * 
 * This function uses Google Gemini AI to generate professional job descriptions
 * based on job title and optional requirements/skills.
 * 
 * @param {string} jobTitle - Job title (required)
 * @param {string} requirements - Optional requirements (e.g., "5+ years experience, Bachelor degree")
 * @param {string} skills - Optional required skills (e.g., "React, Node.js, MongoDB")
 * @returns {Object} - Returns an object with success status and generated content including:
 *   - description: Full job description (4-6 paragraphs)
 *   - keyRequirements: Array of key requirements
 *   - suggestedSkills: Array of suggested skills
 *   - tips: Array of tips to improve the posting
 * 
 * Used by: Recruiters to generate professional job descriptions
 * Endpoint: POST /api/company/ai/generate-job-description
 */
export const generateJobDescription = async (jobTitle, requirements = "", skills = "") => {
    try {
        // Validate required input
        if (!jobTitle || jobTitle.trim().length === 0) {
            return { success: false, message: "Job title required" };
        }

        // Get the Gemini AI model instance
        const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Construct AI prompt for job description generation
        const prompt = `Generate a professional job description for the following position.

Job Title: ${jobTitle}
${requirements ? `Requirements: ${requirements}` : ''}
${skills ? `Required Skills: ${skills}` : ''}

Provide your response in this exact JSON format (no markdown, just pure JSON):
{
  "description": "<4-6 paragraph professional job description>",
  "keyRequirements": [<list of 5-7 key requirements>],
  "suggestedSkills": [<list of 5-7 suggested skills>],
  "tips": [<list of 2-3 tips to improve the job posting>]
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

        // Return structured response with generated job description
        return {
            success: true,
            data: {
                description: parsed.description,
                keyRequirements: parsed.keyRequirements,
                suggestedSkills: parsed.suggestedSkills,
                tips: parsed.tips
            }
        };
    } catch (error) {
        // Log error for debugging and return error response
        console.error("Job description generation error:", error);
        return { success: false, message: error.message };
    }
};

/**
 * AI Feature: Generate Candidate Summary (For Recruiters)
 * 
 * This function uses Google Gemini AI to generate a quick professional summary
 * of a candidate based on their resume.
 * 
 * @param {string} resumeText - The full text content of the candidate's resume
 * @param {string} candidateName - Optional candidate name for personalization
 * @returns {Object} - Returns an object with success status and summary data including:
 *   - summary: Professional summary (3-4 sentences)
 *   - experienceLevel: Experience level (e.g., "Senior", "Mid-level", "Entry-level")
 *   - topSkills: Array of top 5-7 skills
 *   - education: Education summary
 *   - yearsOfExperience: Estimated years of experience
 * 
 * Used by: Recruiters to quickly understand candidate profile
 * Endpoint: POST /api/company/ai/candidate-summary
 */
export const generateCandidateSummary = async (resumeText, candidateName = "") => {
    try {
        // Validate required input
        if (!resumeText || resumeText.trim().length === 0) {
            return { success: false, message: "Resume text required" };
        }

        // Get the Gemini AI model instance
        const model = client.getGenerativeModel({ model: "gemini-3-flash-preview" });

        // Construct AI prompt for candidate summary generation
        const prompt = `Generate a professional summary of this candidate.

${candidateName ? `Candidate Name: ${candidateName}` : ''}

Resume:
${resumeText}

Provide your response in this exact JSON format (no markdown, just pure JSON):
{
  "summary": "<3-4 sentence professional summary>",
  "experienceLevel": "<Senior, Mid-level, Entry-level, etc.>",
  "topSkills": [<list of top 5-7 skills>],
  "education": "<Education summary>",
  "yearsOfExperience": "<Estimated years of experience>"
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

        // Return structured response with candidate summary
        return {
            success: true,
            data: {
                summary: parsed.summary,
                experienceLevel: parsed.experienceLevel,
                topSkills: parsed.topSkills,
                education: parsed.education,
                yearsOfExperience: parsed.yearsOfExperience
            }
        };
    } catch (error) {
        // Log error for debugging and return error response
        console.error("Candidate summary generation error:", error);
        return { success: false, message: error.message };
    }
};
