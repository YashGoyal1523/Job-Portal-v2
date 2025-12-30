import React, { useState,useRef, useEffect } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const AddJob = () => {

    // Standard job posting form state
    const [title,setTitle]=useState('')
    const [location,setLocation]=useState('Bangalore')
    const [category,setCategory]=useState('Programming')
    const [level,setLevel]=useState('Programming')
    const [salary,setSalary]=useState(0)
    
    // ============================================
    // AI FEATURE STATE (For Recruiters)
    // These states manage the AI Job Description Helper
    // ============================================
    const [showAIHelper, setShowAIHelper] = useState(false) // Controls visibility of AI helper section
    const [aiRequirements, setAiRequirements] = useState('') // Optional requirements input for AI
    const [aiSkills, setAiSkills] = useState('') // Optional skills input for AI
    const [aiGenerating, setAiGenerating] = useState(false) // Loading state during AI generation
    const [aiGeneratedDesc, setAiGeneratedDesc] = useState(null) // Stores AI-generated job description

    const editorRef=useRef(null)
    const quillRef=useRef(null)

    const {backendUrl,companyToken,fetchJobs}= useContext(AppContext)
    
    const onSubmitHandler=async(e)=>{
        e.preventDefault()
        try{
            const description = quillRef.current.root.innerHTML
            const {data} =await axios.post(backendUrl+'/api/company/post-job',{title,description,location,salary,category,level},{headers:{token:companyToken}})
            console.log(data)
            if(data.success){
                toast.success(data.message)
                setTitle('')
                setSalary(0)
                quillRef.current.root.innerHTML=""
                fetchJobs() // for home page update               
            }
            else{
                toast.error(data.message)
            }
        }
        catch(e){
            toast.error(e.message)
        }
    }


    useEffect(()=>{
        //initiate quill only once
        if(!quillRef.current && editorRef.current){
            quillRef.current=new Quill(editorRef.current,{
                theme:'snow'
            })
        }
    },[])

    /**
     * AI Feature Handler: Generate Job Description
     * 
     * This function uses AI to generate a professional job description based on:
     * - Job title (required)
     * - Optional requirements and skills
     * 
     * The generated description can then be inserted into the Quill editor.
     * Used by: AI Helper feature in Add Job page
     */
    const handleAIGenerate = async () => {
        // Validate that job title is entered (required for AI generation)
        if (!title.trim()) {
            toast.error('Please enter a job title first')
            return
        }

        try {
            // Set loading state and clear previous results
            setAiGenerating(true)
            setAiGeneratedDesc(null)

            // Call AI endpoint to generate job description
            const { data } = await axios.post(
                backendUrl + '/api/company/ai/generate-job-description',
                {
                    jobTitle: title,
                    requirements: aiRequirements,
                    skills: aiSkills
                },
                { headers: { token: companyToken } }
            )

            // If AI generation was successful, store results and show success message
            if (data.success) {
                setAiGeneratedDesc(data.data)
                toast.success('Job description generated!')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            // Handle errors from API call
            toast.error(error.response?.data?.message || 'Error generating description')
        } finally {
            // Always reset loading state, even if there was an error
            setAiGenerating(false)
        }
    }

    /**
     * Insert AI-Generated Description into Editor
     * 
     * This function takes the AI-generated job description and inserts it into
     * the Quill rich text editor, converting plain text to HTML format.
     */
    const useAIGeneratedDescription = () => {
        if (aiGeneratedDesc && quillRef.current) {
            // Convert plain text to HTML format for Quill editor
            // Replace double newlines with paragraph breaks and single newlines with line breaks
            const htmlContent = `<p>${aiGeneratedDesc.description.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`
            quillRef.current.root.innerHTML = htmlContent
            setShowAIHelper(false)
            toast.success('Description added to editor!')
        }
    }


  return (
    <form onSubmit={onSubmitHandler} className='container p-4 flex flex-col w-full items-start gap-3' >
    <div className='w-full'>
         <p className='mb-2'>Job Title</p>
         <input className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded' type="text" placeholder='Type Here' onChange={(e)=>setTitle(e.target.value)} value={title} required/>
    </div>

    <div className='w-full max-w-lg'>
        <div className='flex justify-between items-center my-2'>
            <p>Job Description</p>
            {/* AI Feature Button: Toggles AI Helper section */}
            <button 
                type='button'
                onClick={() => setShowAIHelper(!showAIHelper)}
                className='bg-purple-600 text-white px-4 py-1 rounded text-sm hover:bg-purple-700'
            >
                🤖 AI Helper
            </button>
        </div>
        {/* ============================================
            AI FEATURE SECTION: Job Description Generator
            Allows recruiters to generate professional job descriptions using AI
            ============================================ */}
        {showAIHelper && (
            <div className='mb-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg'>
                <h3 className='font-bold mb-2'>✨ Generate Job Description with AI</h3>
                <p className='text-sm text-gray-600 mb-3'>Enter additional details to help AI generate a better description:</p>
                
                <div className='mb-3'>
                    <label className='block text-sm font-medium mb-1'>Key Requirements (optional):</label>
                    <textarea
                        className='w-full border border-gray-300 rounded p-2 text-sm'
                        rows='2'
                        placeholder='e.g., 3+ years experience, Bachelor degree, etc.'
                        value={aiRequirements}
                        onChange={(e) => setAiRequirements(e.target.value)}
                    />
                </div>
                
                <div className='mb-3'>
                    <label className='block text-sm font-medium mb-1'>Required Skills (optional):</label>
                    <input
                        type='text'
                        className='w-full border border-gray-300 rounded p-2 text-sm'
                        placeholder='e.g., React, Node.js, MongoDB'
                        value={aiSkills}
                        onChange={(e) => setAiSkills(e.target.value)}
                    />
                </div>
                
                {/* Button to trigger AI job description generation */}
                <button
                    type='button'
                    onClick={handleAIGenerate}
                    disabled={aiGenerating}
                    className='bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 disabled:bg-gray-400'
                >
                    {aiGenerating ? 'Generating...' : '🚀 Generate Description'}
                </button>

                {/* Display AI-generated job description */}
                {aiGeneratedDesc && (
                    <div className='mt-4 p-3 bg-white border border-purple-300 rounded'>
                        <h4 className='font-semibold mb-2'>Generated Description:</h4>
                        <div className='text-sm text-gray-700 whitespace-pre-wrap mb-3 max-h-60 overflow-y-auto'>
                            {aiGeneratedDesc.description}
                        </div>
                        {/* Button to insert AI-generated description into the editor */}
                        <button
                            type='button'
                            onClick={useAIGeneratedDescription}
                            className='bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700'
                        >
                            ✓ Use This Description
                        </button>
                        
                        {aiGeneratedDesc.keyRequirements && (
                            <div className='mt-3'>
                                <h5 className='font-semibold text-sm mb-1'>Suggested Requirements:</h5>
                                <ul className='list-disc list-inside text-xs text-gray-600'>
                                    {aiGeneratedDesc.keyRequirements.slice(0, 5).map((req, idx) => (
                                        <li key={idx}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
        <div ref={editorRef}>

        </div>
    </div>

    <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
            <p className='mb-2'>Job Category</p>
            <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setCategory(e.target.value)}>
                {JobCategories.map((category,index)=>(
                    <option key={index} value={category}>{category}</option>
                ))}
            </select>
        </div>
        <div>
            <p className='mb-2'>Job Location</p>
            <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setLocation(e.target.value)}>
                {JobLocations.map((location,index)=>(
                    <option key={index} value={location}>{location}</option>
                ))}
            </select>
        </div>
        <div>
            <p className='mb-2'>Job Level</p>
            <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e=>setLevel(e.target.value)}>
                <option value="Beginner Level">Beginner Level</option>
                <option value="Intermediate Level">Intermediate Level</option>
                <option value="Senior Level">Senior Level</option>

            </select>
        </div>
    </div>

    <div>
        <p className='mb-2'>Job Salary</p>
        <input min={0} className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px' onChange={e=>setSalary(e.target.value)} value={salary} type="Number" placeholder='0' />
    </div>

    <button className='w-28 py-3 mt-4 bg-black text-white rounded cursor-pointer'>Add</button>

    </form>
  )
}

export default AddJob