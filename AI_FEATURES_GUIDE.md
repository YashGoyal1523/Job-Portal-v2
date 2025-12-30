# AI Features Implementation Guide

## ✅ Completed Setup

All AI features have been implemented with Google Gemini API:

### 1. **Resume Quality Score**
- **Endpoint:** `POST /api/jobs/ai/analyze-resume`
- **What it does:** Analyzes resume and gives score (1-10) with suggestions
- **Request body:**
```json
{
  "resumeText": "Your full resume text here"
}
```
- **Response includes:**
  - Score (1-10)
  - Strengths
  - Weaknesses
  - Suggestions for improvement
  - ATS compatibility score
  - Summary

---

### 2. **Smart Job Matching**
- **Endpoint:** `POST /api/jobs/ai/job-matching`
- **What it does:** Matches candidate skills with job requirements
- **Request body:**
```json
{
  "candidateSkills": ["React", "Node.js", "MongoDB"],
  "jobDescription": "Full job description text",
  "jobTitle": "MERN Developer"
}
```
- **Response includes:**
  - Match percentage (0-100%)
  - Match level (High/Medium/Low)
  - Matched skills
  - Missing skills
  - Strengths
  - Gaps
  - Recommendations

---

### 3. **AI Candidate Match Score** (For Recruiters)
- **Endpoint:** `POST /api/company/ai/match-candidate`
- **What it does:** Analyzes how well a candidate matches a specific job
- **Request body:**
```json
{
  "resumeText": "Candidate resume text here",
  "jobId": "job_id_here"
}
```
- **Response includes:**
  - Match percentage (0-100%)
  - Match level (High/Medium/Low)
  - Summary of candidate fit
  - Key strengths for this role
  - Key concerns or gaps
  - Recommendation (Strong Candidate/Consider Interview/Not a Good Fit)

---

### 4. **AI Job Description Generator** (For Recruiters)
- **Endpoint:** `POST /api/company/ai/generate-job-description`
- **What it does:** Generates professional job descriptions
- **Request body:**
```json
{
  "jobTitle": "Senior React Developer",
  "requirements": "5+ years experience, Bachelor degree",
  "skills": "React, Node.js, MongoDB"
}
```
- **Response includes:**
  - Full job description (4-6 paragraphs)
  - Key requirements list
  - Suggested skills list
  - Tips to improve the posting

---

### 5. **AI Candidate Summary** (For Recruiters)
- **Endpoint:** `POST /api/company/ai/candidate-summary`
- **What it does:** Generates a brief professional summary of a candidate
- **Request body:**
```json
{
  "resumeText": "Candidate resume text here",
  "candidateName": "John Doe"
}
```
- **Response includes:**
  - Professional summary (3-4 sentences)
  - Experience level
  - Top skills
  - Education summary
  - Years of experience estimate

---

## 🔑 Required Setup: Add Gemini API Key

### Step 1: Get Free API Key
1. Go to: https://aistudio.google.com/apikey
2. Click "Get API Key" button
3. Create a new free API key
4. Copy the key

### Step 2: Add to .env file
Open `/server/.env` and replace:
```
GEMINI_API_KEY="your_gemini_api_key_here"
```
With your actual API key:
```
GEMINI_API_KEY="AIzaSyD_XXXX..."
```

### Step 3: Restart Server
Stop and restart your Node.js server for changes to take effect.

---

## 📦 Package Installed
- `@google/generative-ai` - Already installed via npm

---

## 🧪 Quick Test Commands

### Test Resume Analysis
```bash
curl -X POST http://localhost:3000/api/jobs/ai/analyze-resume \
  -H "Content-Type: application/json" \
  -d '{"resumeText":"John Doe, Expert React Developer with 5 years experience. Skills: React, Node.js, MongoDB, JavaScript"}'
```

### Test Job Matching
```bash
curl -X POST http://localhost:3000/api/jobs/ai/job-matching \
  -H "Content-Type: application/json" \
  -d '{"candidateSkills":["React","Node.js"],"jobDescription":"Need React Developer with Node.js experience","jobTitle":"Senior React Developer"}'
```

### Test Recruiter AI Features (requires company token)
```bash
# Match Candidate to Job
curl -X POST http://localhost:3000/api/company/ai/match-candidate \
  -H "Content-Type: application/json" \
  -H "token: YOUR_COMPANY_TOKEN" \
  -d '{"resumeText":"John Doe, React Developer with 5 years experience","jobId":"JOB_ID"}'

# Generate Job Description
curl -X POST http://localhost:3000/api/company/ai/generate-job-description \
  -H "Content-Type: application/json" \
  -H "token: YOUR_COMPANY_TOKEN" \
  -d '{"jobTitle":"Senior React Developer","requirements":"5+ years","skills":"React, Node.js"}'

# Get Candidate Summary
curl -X POST http://localhost:3000/api/company/ai/candidate-summary \
  -H "Content-Type: application/json" \
  -H "token: YOUR_COMPANY_TOKEN" \
  -d '{"resumeText":"John Doe, React Developer...","candidateName":"John Doe"}'
```

---

## 📝 Frontend Integration (✅ Already Implemented!)

### For Job Seekers:
1. **Resume Analyzer Page** - `/resume-analyzer`
   - Input: Text area for pasting resume
   - Output: Score card with strengths, weaknesses, suggestions

2. **Job Matching Page** - `/job-matcher`
   - Input: Candidate skills + job description
   - Output: Match percentage with matched/missing skills

### For Recruiters:
3. **AI Insights in View Applications** - `/dashboard/view-applications`
   - Click "🤖 AI Insights" button next to each candidate
   - Paste resume text to get:
     - Match score against the job
     - Candidate summary
     - Key strengths and concerns
     - Recommendation

4. **AI Job Description Helper** - `/dashboard/add-job`
   - Click "🤖 AI Helper" button above job description editor
   - Enter job title and optional requirements/skills
   - Generate professional job description
   - One-click to add to editor

---

## ⚠️ Important Notes

1. **Free Tier Limits:** 60 API calls per minute (plenty for portfolio use)
2. **API Key Safety:** Keep your API key secret, never commit to GitHub
3. **Response Time:** Gemini API responds in 2-5 seconds typically
4. **Error Handling:** Already implemented in all endpoints

---

## 🚀 Next Steps

1. ✅ Get Gemini API key from https://aistudio.google.com/apikey
2. ✅ Add it to `.env` file
3. ✅ Restart your server
4. ✅ Test the endpoints with curl or Postman
5. ✅ Build frontend UI to integrate these endpoints

---

## 📚 Files Modified/Created

### Backend:
- **Created/Modified:** `/server/utils/aiHelper.js` (AI helper functions)
- **Modified:** `/server/controller/jobController.js` (job seeker AI endpoints)
- **Modified:** `/server/controller/companyController.js` (recruiter AI endpoints)
- **Modified:** `/server/routes/jobRoutes.js` (job seeker AI routes)
- **Modified:** `/server/routes/companyRoutes.js` (recruiter AI routes)

### Frontend:
- **Modified:** `/client/src/pages/ViewApplications.jsx` (Added AI Insights modal)
- **Modified:** `/client/src/pages/AddJob.jsx` (Added AI Job Description helper)

---

## 🎯 How to Use Recruiter AI Features

### 1. **AI Candidate Match Score**
1. Go to Dashboard → View Applications
2. Click "🤖 AI Insights" button next to any candidate
3. Paste the candidate's resume text (copy from PDF)
4. Click "Analyze with AI"
5. View match percentage, strengths, concerns, and recommendation

### 2. **AI Job Description Generator**
1. Go to Dashboard → Add Job
2. Enter job title
3. Click "🤖 AI Helper" button
4. Optionally add requirements and skills
5. Click "Generate Description"
6. Review and click "Use This Description" to add to editor

### 3. **AI Candidate Summary**
- Automatically shown in the AI Insights modal
- Provides quick overview of candidate's experience, skills, and education

---

## 💡 Quick Tips

1. **Resume Text:** For now, you need to copy-paste resume text from PDFs. PDF text extraction can be automated in future updates.

2. **Match Scores:** Higher scores (70%+) are typically good candidates. Use the recommendation field for guidance.

3. **Job Descriptions:** The AI generates professional descriptions, but you can always edit them in the editor.

4. **Free Tier:** Google Gemini free tier allows 60 requests/minute - plenty for testing and small-scale use.

---

**All AI features are now ready to use!** 🎉
