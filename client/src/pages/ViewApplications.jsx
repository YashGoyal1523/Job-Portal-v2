import React, { useContext,useState ,useEffect } from 'react'
import { assets, viewApplicationsPageData } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import Loading from '../components/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'


const ViewApplications = () => {

const {companyToken,backendUrl,applicants,fetchCompanyJobApplications,fetchUserApplications}=useContext(AppContext)

// ============================================
// AI FEATURE STATE (For Recruiters)
// These states manage the AI Insights modal and analysis results
// ============================================
const [selectedApplicant, setSelectedApplicant] = useState(null) // Currently selected applicant for AI analysis
const [showAIModal, setShowAIModal] = useState(false) // Controls visibility of AI Insights modal
const [resumeText, setResumeText] = useState('') // Resume text pasted by recruiter for analysis
const [aiLoading, setAiLoading] = useState(false) // Loading state during AI analysis
const [aiMatchResult, setAiMatchResult] = useState(null) // Stores AI match analysis results
const [aiSummaryResult, setAiSummaryResult] = useState(null) // Stores AI candidate summary results

//func to update job application status
const changeJobApplicationsStatus=async(id,status)=>{
    try{
        const {data} = await axios.post(backendUrl+'/api/company/change-status',{id:id,status:status},{headers:{token:companyToken}})

        if(data.success){
            fetchCompanyJobApplications() // for view applications page
            fetchUserApplications() // for applied jobs page of user
        }
        else{
            toast.error(data.message)
        }
        
    }
    catch(e){
        toast.error(e.message)
    }
}

const [menuOpen, setMenuOpen] = useState(false);

/**
 * AI Feature Handler: Analyze Candidate Match and Generate Summary
 * 
 * This function performs two AI analyses for a candidate:
 * 1. Matches the candidate's resume against the job requirements
 * 2. Generates a quick summary of the candidate's profile
 * 
 * Both analyses are performed in parallel to provide comprehensive insights.
 * Used by: AI Insights modal in View Applications page
 */
const handleAIAnalysis = async () => {
    // Validate that resume text has been pasted
    if (!resumeText.trim()) {
        toast.error('Please paste the candidate resume text first')
        return
    }

    // Ensure an applicant is selected
    if (!selectedApplicant) return

    try {
        // Set loading state and clear previous results
        setAiLoading(true)
        setAiMatchResult(null)
        setAiSummaryResult(null)

        // AI Analysis 1: Match candidate resume to job requirements
        // This analyzes how well the candidate fits the specific job posting
        const matchResponse = await axios.post(
            backendUrl + '/api/company/ai/match-candidate',
            {
                resumeText: resumeText,
                jobId: selectedApplicant.jobId._id
            },
            { headers: { token: companyToken } }
        )

        if (matchResponse.data.success) {
            setAiMatchResult(matchResponse.data.data)
        }

        // AI Analysis 2: Generate candidate summary
        // This creates a quick overview of the candidate's experience, skills, and education
        const summaryResponse = await axios.post(
            backendUrl + '/api/company/ai/candidate-summary',
            {
                resumeText: resumeText,
                candidateName: selectedApplicant.userId.name
            },
            { headers: { token: companyToken } }
        )

        if (summaryResponse.data.success) {
            setAiSummaryResult(summaryResponse.data.data)
        }

    } catch (error) {
        // Handle errors from API calls
        toast.error(error.response?.data?.message || 'Error analyzing candidate')
    } finally {
        // Always reset loading state, even if there was an error
        setAiLoading(false)
    }
}

/**
 * Open AI Insights Modal
 * 
 * Opens the modal for a specific applicant and resets all AI-related state.
 * The recruiter will need to paste the candidate's resume text before analysis.
 */
const openAIModal = (applicant) => {
    setSelectedApplicant(applicant)
    setShowAIModal(true)
    setResumeText('')
    setAiMatchResult(null)
    setAiSummaryResult(null)
}

/**
 * Close AI Insights Modal
 * 
 * Closes the modal and clears all AI-related state.
 */
const closeAIModal = () => {
    setShowAIModal(false)
    setSelectedApplicant(null)
    setResumeText('')
    setAiMatchResult(null)
    setAiSummaryResult(null)
}


  return applicants? applicants.length===0 ? (
     <div className='flex items-center justify-center h-[70vh]'>
    <p className='text-xl sm:text-2xl'>No Applications Available </p>
  </div>)
   :(
    <div className='container mx-auto p-4 '>
        <div>
            <table className='w-full max-w-4xl bg-white border border-gray-200  max-sm:text-sm'>
                <thead>
                    <tr className='border-b border-gray-200'>
                        <th className='py-2  px-4 text-left'>#</th>
                        <th className='py-2  px-4 text-left'>Username</th>
                        <th className='py-2  px-4 text-left max-sm:hidden'>Job title</th>
                        <th className='py-2  px-4 text-left max-sm:hidden'>Location</th>
                        <th className='py-2  px-4 text-left'>Resume</th>
                        <th className='py-2  px-4 text-left'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {applicants.filter(item=>item.jobId&&item.userId).map((applicant,index)=>(
                        <tr key={index} className='text-gray-700 border-b border-gray-200'>
                            <td className='py-2 px-4  text-center'>{index+1}</td>
                            <td className='py-2 px-4  text-center'>
                                <div className='flex items-center'>
                                <img className='w-10 h-10 rounded-full mr-3 max-sm:hidden' src={applicant.userId.image} alt="" />
                                <span>{applicant.userId.name}</span>
                                </div>
                  
                            </td>
                            <td className='py-2 px-4  max-sm:hidden'>{applicant.jobId.title}</td>
                            <td className='py-2 px-4  max-sm:hidden'>{applicant.jobId.location}</td>
                            <td className='py-2 px-4 '>
                                <div className='flex gap-2 items-center flex-wrap'>
                                    <a className='bg-blue-50 text-blue-400 py-1 px-3 rounded inline-flex gap-2 items-center' href={applicant.userId.resume} target='_blank'>
                                        Resume
                                        <img src={assets.resume_download_icon} alt="" />
                                    </a>
                                    {/* AI Feature Button: Opens AI Insights modal for candidate analysis */}
                                    <button 
                                        onClick={() => openAIModal(applicant)}
                                        className='bg-purple-50 text-purple-600 py-1 px-3 rounded inline-flex gap-1 items-center text-sm hover:bg-purple-100'
                                    >
                                        🤖 AI Insights
                                    </button>
                                </div>
                            </td>
                            <td className='py-2 px-4 relative'>
                                {applicant.status==='Pending' ?
                                <div className='relative inline-block text-left group'>
                                    <button className='text-gray-500 action-button'>...</button>
                                    <div className='z-10 hidden absolute right-0 md:left-0 top-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow group-hover:block '>
                                        <button onClick={()=>changeJobApplicationsStatus(applicant._id,'Accepted')} className='block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100 '>Accept</button>
                                        <button onClick={()=>changeJobApplicationsStatus(applicant._id,'Rejected')}className='block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 '>Reject</button>
                                    </div>
                                </div>
                                :
                                <div>
                                    {applicant.status}
                                </div>
                                 }
                                
                            </td>
                        </tr>
                    ))}
                </tbody> 
            </table>
        </div>

        {/* ============================================
            AI FEATURE MODAL: Candidate Insights
            This modal allows recruiters to:
            1. Paste candidate resume text
            2. Get AI-powered match analysis against the job
            3. Get AI-generated candidate summary
            ============================================ */}
        {showAIModal && selectedApplicant && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
                    <div className='p-6'>
                        <div className='flex justify-between items-center mb-4'>
                            <h2 className='text-2xl font-bold'>AI Insights - {selectedApplicant.userId.name}</h2>
                            <button onClick={closeAIModal} className='text-gray-500 hover:text-gray-700 text-2xl'>&times;</button>
                        </div>

                        <div className='mb-4'>
                            <p className='text-sm text-gray-600 mb-2'>
                                <strong>Job:</strong> {selectedApplicant.jobId.title}
                            </p>
                            <p className='text-sm text-gray-500 mb-4'>
                                📄 <strong>Step 1:</strong> Open the resume PDF, copy its text, and paste below. 
                                (Note: PDF text extraction can be automated in future updates)
                            </p>
                            {/* Input field for pasting candidate resume text */}
                            {/* Note: PDF text extraction can be automated in future updates */}
                            <textarea
                                className='w-full border-2 border-gray-300 rounded p-3 min-h-[150px]'
                                placeholder='Paste candidate resume text here...'
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                            />
                            {/* Button to trigger AI analysis */}
                            <button
                                onClick={handleAIAnalysis}
                                disabled={aiLoading || !resumeText.trim()}
                                className='mt-3 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
                            >
                                {aiLoading ? 'Analyzing...' : '🤖 Analyze with AI'}
                            </button>
                        </div>

                        {/* ============================================
                            AI RESULTS DISPLAY
                            Shows match analysis and candidate summary
                            ============================================ */}
                        
                        {/* AI Result 1: Match Analysis */}
                        {/* Displays how well candidate matches the job requirements */}
                        {aiMatchResult && (
                            <div className='border-t pt-4 mt-4'>
                                <h3 className='text-xl font-bold mb-3'>📊 Match Analysis</h3>
                                <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                                    <div className='flex items-center gap-4 mb-3'>
                                        <div className='text-3xl font-bold text-purple-600'>
                                            {aiMatchResult.matchPercentage}%
                                        </div>
                                        <div>
                                            <div className={`text-lg font-semibold ${
                                                aiMatchResult.matchLevel === 'High' ? 'text-green-600' :
                                                aiMatchResult.matchLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {aiMatchResult.matchLevel} Match
                                            </div>
                                            <div className='text-sm text-gray-600'>{aiMatchResult.recommendation}</div>
                                        </div>
                                    </div>
                                    <p className='text-gray-700 mb-3'>{aiMatchResult.summary}</p>
                                    
                                    <div className='grid md:grid-cols-2 gap-4 mt-4'>
                                        <div>
                                            <h4 className='font-semibold text-green-700 mb-2'>✅ Key Strengths:</h4>
                                            <ul className='list-disc list-inside text-sm text-gray-700'>
                                                {aiMatchResult.keyStrengths?.map((strength, idx) => (
                                                    <li key={idx}>{strength}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className='font-semibold text-orange-700 mb-2'>⚠️ Key Concerns:</h4>
                                            <ul className='list-disc list-inside text-sm text-gray-700'>
                                                {aiMatchResult.keyConcerns?.map((concern, idx) => (
                                                    <li key={idx}>{concern}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* AI Result 2: Candidate Summary */}
                        {/* Displays quick overview of candidate's profile */}
                        {aiSummaryResult && (
                            <div className='border-t pt-4 mt-4'>
                                <h3 className='text-xl font-bold mb-3'>👤 Candidate Summary</h3>
                                <div className='bg-blue-50 p-4 rounded-lg'>
                                    <p className='text-gray-700 mb-3'>{aiSummaryResult.summary}</p>
                                    <div className='grid md:grid-cols-2 gap-4 text-sm'>
                                        <div>
                                            <strong>Experience Level:</strong> {aiSummaryResult.experienceLevel}
                                        </div>
                                        <div>
                                            <strong>Years of Experience:</strong> {aiSummaryResult.yearsOfExperience}
                                        </div>
                                        <div>
                                            <strong>Education:</strong> {aiSummaryResult.education}
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <strong>Top Skills:</strong>
                                        <div className='flex flex-wrap gap-2 mt-2'>
                                            {aiSummaryResult.topSkills?.map((skill, idx) => (
                                                <span key={idx} className='bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm'>
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  ) :<Loading />
}

export default ViewApplications