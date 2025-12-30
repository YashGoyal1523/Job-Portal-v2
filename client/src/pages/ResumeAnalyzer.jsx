import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

/**
 * AI Feature Page: Resume Analyzer
 * 
 * This page allows job seekers to get AI-powered feedback on their resume quality.
 * Users can paste their resume text and receive a quality score, strengths, weaknesses,
 * suggestions for improvement, ATS compatibility score, and an overall summary.
 * 
 * Route: /resume-analyzer
 * API Endpoint: POST /api/jobs/ai/analyze-resume
 */
const ResumeAnalyzer = () => {
  // State for user input
  const [resumeText, setResumeText] = useState('')
  
  // State for AI analysis
  const [analyzing, setAnalyzing] = useState(false) // Loading state during AI analysis
  const [result, setResult] = useState(null) // Stores AI analysis results
  
  const { backendUrl } = useContext(AppContext)

  /**
   * AI Feature Handler: Analyze resume quality
   * 
   * This function sends resume text to the AI endpoint and displays the analysis
   * results including score, strengths, weaknesses, suggestions, and ATS score.
   */
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter your resume text')
      return
    }

    try {
      // Set loading state while AI analyzes the resume
      setAnalyzing(true)
      
      // Call AI endpoint to analyze resume quality
      const { data } = await axios.post(backendUrl + '/api/jobs/ai/analyze-resume', {
        resumeText: resumeText
      })

      // If AI analysis was successful, store results and show success message
      if (data.success) {
        setResult(data.data)
        toast.success('Resume analyzed successfully!')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      // Handle errors from API call
      toast.error(error.message || 'Error analyzing resume')
    } finally {
      // Always reset loading state, even if there was an error
      setAnalyzing(false)
    }
  }

  // Clear resume text input and analysis results
  const handleClear = () => {
    setResumeText('')
    setResult(null)
  }

  return (
    <>
      <Navbar />
      <div className='container px-4 2xl:px-20 mx-auto min-h-screen py-10'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-10'>
            <h1 className='text-4xl font-bold text-gray-900 mb-3'>Resume Analyzer</h1>
            <p className='text-gray-600 text-lg'>
              Get AI-powered feedback on your resume quality and suggestions for improvement
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-8'>
            {/* Input Section */}
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h2 className='text-2xl font-semibold mb-4'>Paste Your Resume</h2>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder='Paste your resume text here... (Copy from your resume and paste all content)'
                className='w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none resize-none'
              />
              <div className='flex gap-3 mt-4'>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className={`flex-1 ${analyzing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-3 rounded-lg transition cursor-pointer`}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze Resume'}
                </button>
                <button
                  onClick={handleClear}
                  className='flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer'
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className='bg-white rounded-lg shadow-lg p-6'>
              {!result ? (
                <div className='h-full flex items-center justify-center text-gray-400'>
                  <p className='text-center'>
                    📋 Analysis results will appear here
                  </p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {/* Score */}
                  <div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-2'>Overall Score</h3>
                    <div className='flex items-end gap-3'>
                      <div className='text-5xl font-bold text-blue-600'>{result.score}</div>
                      <span className='text-gray-600 mb-2'>/10</span>
                    </div>
                    <div className='mt-2 bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full'
                        style={{ width: `${(result.score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* ATS Score */}
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>ATS Compatibility</h4>
                    <div className='flex items-end gap-3'>
                      <span className='text-3xl font-bold text-green-600'>{result.atsScore}</span>
                      <span className='text-gray-600 mb-1'>/10</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <h4 className='font-semibold text-gray-900 mb-2'>Summary</h4>
                    <p className='text-gray-700 text-sm leading-relaxed'>{result.summary}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          {result && (
            <div className='mt-10 grid md:grid-cols-3 gap-6'>
              {/* Strengths */}
              <div className='bg-green-50 rounded-lg p-6 border-l-4 border-green-500'>
                <h3 className='text-xl font-bold text-green-700 mb-4'>✓ Strengths</h3>
                <ul className='space-y-2'>
                  {result.strengths.map((strength, idx) => (
                    <li key={idx} className='text-gray-700 text-sm'>• {strength}</li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className='bg-red-50 rounded-lg p-6 border-l-4 border-red-500'>
                <h3 className='text-xl font-bold text-red-700 mb-4'>✗ Areas to Improve</h3>
                <ul className='space-y-2'>
                  {result.weaknesses.map((weakness, idx) => (
                    <li key={idx} className='text-gray-700 text-sm'>• {weakness}</li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div className='bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500'>
                <h3 className='text-xl font-bold text-blue-700 mb-4'>💡 Suggestions</h3>
                <ul className='space-y-2'>
                  {result.suggestions.map((suggestion, idx) => (
                    <li key={idx} className='text-gray-700 text-sm'>• {suggestion}</li>
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

export default ResumeAnalyzer
