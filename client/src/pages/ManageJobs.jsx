import React from 'react'
import { jobsData, manageJobsData } from '../assets/assets'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { useState,useEffect } from 'react'
import { toast } from 'react-toastify'
import Loading from '../components/Loading'

/**
 * Manage Jobs Page
 * Allows recruiters to view, manage visibility, and delete their job postings
 * Shows number of applicants for each job
 * Route: /dashboard/manage-jobs
 */
const ManageJobs = () => {

const navigate=useNavigate()

// State for company's job postings
const [jobs,setJobs]=useState(false)
const {backendUrl,companyToken,fetchJobs,fetchUserApplications,fetchCompanyJobApplications}=useContext(AppContext)

/**
 * Fetch all jobs posted by the company
 * Results are reversed to show newest jobs first
 */
const fetchCompanyJobs=async()=>{
    try{
        const {data}=await axios.get(backendUrl+'/api/company/list-job',{headers:{token:companyToken}})
        if(data.success){
            setJobs(data.jobsData.reverse()) // Reverse to show newest first
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
 * Toggle Job Visibility
 * Shows or hides a job posting from public job listings
 * @param {string} id - Job ID to toggle visibility
 */
const changeJobVisibility = async(id)=>{
    try{
        const {data} = await axios.post(backendUrl+'/api/company/change-visibility',{id:id},{headers:{token:companyToken}})
        if(data.success){
            toast.success(data.message)
            fetchCompanyJobs();  // Refresh company's job list
            fetchJobs();          // Refresh public job listings on home page
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
 * Delete Job
 * Permanently deletes a job posting and all its applications
 * @param {string} id - Job ID to delete
 */
const deleteJob = async(id)=>{
    try{
        const {data} = await axios.delete(backendUrl+'/api/company/delete-job',{ params: { id },headers:{token:companyToken}})
        if(data.success){
            toast.success(data.message)
            fetchCompanyJobs();  // Refresh company's job list
            fetchJobs();  // Refresh public job listings
            fetchUserApplications() // Refresh user's applications page        
            fetchCompanyJobApplications() // Refresh applications view
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
    if(companyToken){
        fetchCompanyJobs()
    }
},[])



  return jobs ? jobs.length===0 ? (
  <div className='flex items-center justify-center h-[70vh]'>
    <p className='text-xl sm:text-2xl'>No Jobs Available or Posted</p>
  </div>) :(
    <div className='container p-4 max-w-5xl '>
        <div className='overflow-x-auto'>
            <table className='min-w-full bg-white border border-gray-200 max-sm:text-sm'>
                <thead>
                    <tr className='border-b border-gray-200'>
                        <th className='py-2 px-4 text-left max-sm:hidden'>#</th>
                        <th className='py-2 px-4 text-left'>Job title</th>
                        <th className='py-2 px-4 text-left max-sm:hidden'>Date</th>
                        <th className='py-2 px-4 text-left max-sm:hidden'>Location</th>
                        <th className='py-2 px-4 text-center'>Applicants</th>
                        <th className='py-2 px-4 text-left'>Visible</th>
                        <th className='py-2 px-4 text-left'>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job,index)=>(
                        <tr key={index} className='border-b border-gray-200 text-gray-700'>
                            <td className='py-2 px-4 max-sm:hidden'>{index+1}</td>
                            <td className='py-2 px-4'>{job.title}</td>
                            <td className='py-2 px-4 max-sm:hidden'>{moment(job.date).format('ll')}</td>
                            <td className='py-2 px-4 max-sm:hidden'>{job.location}</td>
                            <td className='py-2 px-4 text-center'>{job.applicants}</td>
                            <td className='py-2 px-4 '>
                                <input onChange={()=>changeJobVisibility(job._id)} className='scale-125 ml-4' type="checkbox" checked={job.visible} />
                            </td>
                            <td className='py-2 px-4 text-left'>
                            <button onClick={() => deleteJob(job._id)} className='text-red-600 text-xl cursor-pointer' title='Delete Job'>✕</button>
                            </td>
                        </tr>
                    ))} 
                </tbody>
            </table>
        </div>

        <div className='mt-4 flex justify-end'>
            <button onClick={()=>navigate('/dashboard/add-job')}  className='bg-black text-white py-2 px-4 rounded'>Add New</button>
        </div>
    </div>
  )
  :
  <Loading/>
}

export default ManageJobs