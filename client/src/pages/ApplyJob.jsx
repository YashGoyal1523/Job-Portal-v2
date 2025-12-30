import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import { assets } from '../assets/assets';
import kconvert from 'k-convert'
import moment from 'moment'
import JobCard from '../components/JobCard';
import Footer from '../components/Footer';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react';


/**
 * Apply Job Page
 * Displays job details and allows users to apply for a job
 * Shows related jobs from the same company
 * Route: /apply/:id
 */
const ApplyJob = () => {

  // Get job ID from URL parameters
  const {id} =useParams();

  const {getToken} = useAuth()

  const navigate=useNavigate()

  // State for current job data
  const [JobData,setJobData]=useState(null)
  const {jobs,backendUrl,userData,userApplications,fetchUserApplications} =useContext(AppContext)

  // Track if user has already applied for this job
  const [isAlreadyApplied,setIsAlreadyApplied] =useState(false)

  /**
   * Fetch job details by ID
   */
  const fetchJob=async ()=>{
    const {data}= await axios.get(backendUrl+`/api/jobs/${id}`)
    try{
      if(data.success){
      setJobData(data.job)
    }
    else{
      toast.error(data.message)
    }
    }
    catch(e){
      toast.error(e.message)
    }
  }

  /**
   * Handle job application submission
   * Validates user login and resume upload before applying
   */
  const applyHandler=async()=>{
    try{
      // Check if user is logged in
      if(!userData){
        return toast.error('Login to apply')
      }
      // Check if user has uploaded a resume
      if(!userData.resume){
        navigate('/applications')
        return toast.error('Upload resume to apply')
      }

      // Get Clerk authentication token
      const token=await getToken()

      // Submit job application
      const {data} = await axios.post(backendUrl+'/api/users/apply',{jobId:JobData._id},{headers:{Authorization:`Bearer ${token}`}})

      if(data.success){
        toast.success(data.message)
        fetchUserApplications() // Refresh applications list
      }
      else{
        toast.error(data.message)
      }

    }
    catch(e){
      toast.error(e.message)
    }
  }

  /**
   * Check if user has already applied for this job
   * Compares current job ID with user's application history
   */
  const checkAlreadyApplied=()=>{
    const hasApplied =userApplications.some(item=>item.jobId._id===JobData._id)
    setIsAlreadyApplied(hasApplied)
  }

  useEffect(()=>{
    fetchJob()
  },[id])

  useEffect(()=>{
    if(userApplications.length>0&&JobData){
      checkAlreadyApplied()
    }
  },[JobData,userApplications,id])

  return JobData?(
    <>
    
    <Navbar/>

    <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto '>
      <div className='bg-white text-black rounded-lg w-full'>
        {/* top section */}
        <div className='flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border-sky-400 rounded-xl '>
          <div className='flex flex-col md:flex-row items-center'>
          <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border' src={JobData.companyId.image} alt="" />
          <div className='text-center md:text-left text-neutral'>
            <h1 className='text-2xl sm:text-4xl font-medium'>{JobData.title}</h1>
            <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
              <span className='flex items-center gap-1'>
                <img src={assets.suitcase_icon} alt="" />
                {JobData.companyId.name}
              </span>
              <span className='flex items-center gap-1'>
                <img src={assets.location_icon} alt="" />
                {JobData.location}
              </span >
              <span className='flex items-center gap-1'>
                <img src={assets.person_icon} alt="" />
                {JobData.level}
              </span>
              <span className='flex items-center gap-1'>
                <img src={assets.money_icon} alt="" />
               CTC: ₹ {kconvert.convertTo(Number(JobData.salary), { precision: 1 })}
              </span>
            </div>
          </div>   
        </div>
        <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center'>
          <button onClick={applyHandler} className='bg-blue-600 p-2.5 px-10 text-white rounded cursor-pointer'>{isAlreadyApplied?'Already Applied':'Apply Now'}</button>
          <p className='mt-1 text-gray-600'>Posted {moment(JobData.date).fromNow()}</p>
        </div>
      </div>
    <div className='flex flex-col lg:flex-row justify-between items-start'>
      {/* left section */}
      <div className='w-full lg:w-2/3'>
      <h2 className='font-bold text-2xl mb-4'>Job Description</h2>
      <div className='rich-text' dangerouslySetInnerHTML={{__html:JobData.description}}></div>
    <button onClick={applyHandler} className='bg-blue-600 p-2.5 px-10 text-white rounded mt-10 cursor-pointer'>{isAlreadyApplied?'Already Applied':'Apply Now'}</button>
   </div>
    {/* right section */}
    <div className='w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5'>
      <h2 >More Jobs From {JobData.companyId.name}</h2>
      {jobs.filter(job => job._id!==JobData._id &&job.companyId._id===JobData.companyId._id).filter(job=>{
        //set of applied job ids by user
        const appliedJobsIds=new Set(userApplications.map(app=>app.jobId&&app.jobId._id))
        //return true if user has not applied for this job
        return !appliedJobsIds.has(job._id)
      }).slice(0,4).map((job,index)=><JobCard key={index} job={job}/>)}
    </div>
  </div>
</div>
</div>

<Footer/>

    </>
  ):(
    <Loading/>
  )
}

export default ApplyJob