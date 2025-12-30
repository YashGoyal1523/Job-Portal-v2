import React, { useState, useContext } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

/**
 * AI Feature Page: Job Matcher
 * 
 * This page allows job seekers to see how well their skills match a specific job position.
 * Users can enter their skills and paste a job description, then get AI-powered analysis
 * showing match percentage, matched/missing skills, strengths, gaps, and recommendations.
 * 
 * Route: /job-matcher
 * API Endpoint: POST /api/jobs/ai/job-matching
 */
const JobMatcher = () => {
  // State for user input
  const [candidateSkills, setCandidateSkills] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  
  // State for AI analysis
  const [matching, setMatching] = useState(false) // Loading state during AI analysis
  const [result, setResult] = useState(null) // Stores AI matching results
  
  const { backendUrl } = useContext(AppContext)

  /**
   * AI Feature Handler: Perform job matching analysis
   * 
   * This function sends candidate skills and job description to the AI endpoint
   * and displays the matching results including percentage, skills comparison, etc.
   */
  const handleMatch = async () => {
    if (!candidateSkills.trim() || !jobDescription.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Set loading state while AI analyzes
      setMatching(true)
      
      // Convert comma-separated skills string into an array
      // Trim whitespace and filter out empty strings
      const skillsArray = candidateSkills
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)

      // Call AI endpoint to perform job matching analysis
      const { data } = await axios.post(backendUrl + '/api/jobs/ai/job-matching', {
        candidateSkills: skillsArray,
        jobDescription: jobDescription,
        jobTitle: jobTitle || 'Job Position'
      })

      // If AI analysis was successful, store results and show success message
      if (data.success) {
        setResult(data.data)
        toast.success('Job matching completed!')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      // Handle errors from API call
      toast.error(error.message || 'Error analyzing job match')
    } finally {
      // Always reset loading state, even if there was an error
      setMatching(false)
    }
  }

  // Clear all input fields and results
  const handleClear = () => {
    setCandidateSkills('')
    setJobDescription('')
    setJobTitle('')
    setResult(null)
  }

  // Helper function to determine text color based on match percentage
  // High match (75%+): green, Medium (50-74%): yellow, Low (<50%): red
  const getMatchColor = (percentage) => {
    if (percentage >= 75) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Helper function to determine background color based on match percentage
  // High match (75%+): green, Medium (50-74%): yellow, Low (<50%): red
  const getMatchBgColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-100'
    if (percentage >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <>
      <Navbar />
      <div className='container px-4 2xl:px-20 mx-auto min-h-screen py-10'>
        <div className='max-w-5xl mx-auto'>
          <div className='mb-10'>
            <h1 className='text-4xl font-bold text-gray-900 mb-3'>Job Matcher</h1>
            <p className='text-gray-600 text-lg'>
              See how well your skills match with a job position and get recommendations
            </p>
          </div>

          <div className='grid lg:grid-cols-2 gap-8'>
            {/* Input Section */}
            <div className='space-y-6'>
              {/* Skills Input */}
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <h2 className='text-2xl font-semibold mb-4'>Your Skills</h2>
                <input
                  type='text'
                  value={candidateSkills}
                  onChange={(e) => setCandidateSkills(e.target.value)}
                  placeholder='Enter skills separated by commas (e.g., React, Node.js, MongoDB)'
                  className='w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none'
                />
                <p className='text-gray-500 text-sm mt-2'>💡 Separate skills with commas</p>
              </div>

              {/* Job Details */}
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <h2 className='text-2xl font-semibold mb-4'>Job Details</h2>
                <div className='mb-4'>
                  <label className='block text-gray-700 font-semibold mb-2'>Job Title (Optional)</label>
                  <input
                    type='text'
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder='e.g., Senior React Developer'
                    className='w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none'
                  />
                </div>

                <label className='block text-gray-700 font-semibold mb-2'>Job Description *</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder='Paste the complete job description here...'
                  className='w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none'
                />

                <div className='flex gap-3 mt-4'>
                  <button
                    onClick={handleMatch}
                    disabled={matching}
                    className={`flex-1 ${matching ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition cursor-pointer`}
                  >
                    {matching ? 'Analyzing...' : 'Calculate Match'}
                  </button>
                  <button
                    onClick={handleClear}
                    className='flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer'
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className='bg-white rounded-lg shadow-lg p-6 h-fit'>
              {!result ? (
                <div className='h-96 flex items-center justify-center text-gray-400'>
                  <p className='text-center'>
                    🎯 Match results will appear here
                  </p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {/* Match Percentage */}
                  <div className={`${getMatchBgColor(result.matchPercentage)} rounded-lg p-6 text-center`}>
                    <h3 className='text-gray-600 font-semibold mb-2'>Overall Match</h3>
                    <div className={`text-5xl font-bold ${getMatchColor(result.matchPercentage)} mb-3`}>
                      {result.matchPercentage}%
                    </div>
                    <p className={`font-bold ${getMatchColor(result.matchPercentage)}`}>
                      {result.matchLevel}
                    </p>
                  </div>

                  {/* Match Bar */}
                  <div>
                    <div className='bg-gray-200 rounded-full h-3'>
                      <div
                        className={`${result.matchPercentage >= 75 ? 'bg-green-600' : result.matchPercentage >= 50 ? 'bg-yellow-600' : 'bg-red-600'} h-3 rounded-full transition-all`}
                        style={{ width: `${result.matchPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-green-50 p-3 rounded-lg border border-green-200'>
                      <p className='text-green-700 font-semibold text-sm'>Matched</p>
                      <p className='text-2xl font-bold text-green-600'>{result.matchedSkills.length}</p>
                    </div>
                    <div className='bg-red-50 p-3 rounded-lg border border-red-200'>
                      <p className='text-red-700 font-semibold text-sm'>Missing</p>
                      <p className='text-2xl font-bold text-red-600'>{result.missingSkills.length}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Results */}
          {result && (
            <div className='mt-10 space-y-6'>
              {/* Matched Skills */}
              {result.matchedSkills.length > 0 && (
                <div className='bg-green-50 rounded-lg p-6 border-l-4 border-green-500'>
                  <h3 className='text-xl font-bold text-green-700 mb-4'>✓ Your Matching Skills</h3>
                  <div className='flex flex-wrap gap-2'>
                    {result.matchedSkills.map((skill, idx) => (
                      <span key={idx} className='bg-green-200 text-green-800 px-4 py-2 rounded-full font-semibold text-sm'>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills */}
              {result.missingSkills.length > 0 && (
                <div className='bg-red-50 rounded-lg p-6 border-l-4 border-red-500'>
                  <h3 className='text-xl font-bold text-red-700 mb-4'>✗ Missing Skills</h3>
                  <div className='flex flex-wrap gap-2'>
                    {result.missingSkills.map((skill, idx) => (
                      <span key={idx} className='bg-red-200 text-red-800 px-4 py-2 rounded-full font-semibold text-sm'>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              <div className='bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500'>
                <h3 className='text-xl font-bold text-blue-700 mb-4'>💪 Your Strengths</h3>
                <ul className='space-y-2'>
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className='text-gray-700'>• {strength}</li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div className='bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500'>
                <h3 className='text-xl font-bold text-yellow-700 mb-4'>⚠️ Skill Gaps</h3>
                <ul className='space-y-2'>
                  {result.gaps.map((gap, idx) => (
                    <li key={idx} className='text-gray-700'>• {gap}</li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className='bg-purple-50 rounded-lg p-6 border-l-4 border-purple-500'>
                <h3 className='text-xl font-bold text-purple-700 mb-4'>🎯 Recommendations</h3>
                <ul className='space-y-2'>
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className='text-gray-700'>• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default JobMatcher
