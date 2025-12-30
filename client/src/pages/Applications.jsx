import React, { useContext, useState } from 'react'
import Navbar from '../components/Navbar'
import { assets, jobsApplied } from '../assets/assets'
import moment from 'moment'
import Footer from '../components/Footer'
import { AppContext } from '../context/AppContext'
import { useUser,useAuth } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from 'react-toastify'

/**
 * Applications Page
 * Displays user's resume management and job application history
 * Allows users to upload/update resume and view application statuses
 * Route: /applications
 */
const Applications = () => {

    const {user} = useUser()
    const {getToken} = useAuth()

  // State for resume editing mode
  const [isEdit,setIsEdit] = useState(false)

  // State for selected resume file
  const [resume,setResume] = useState(null)

  const {backendUrl,userData,userApplications,fetchUserData} = useContext(AppContext)

  /**
   * Update User Resume
   * Uploads resume file to server and updates user profile
   */
  const updateResume = async ()=>{
    try{
      // Create FormData for file upload
      const formData=new FormData()
      formData.append('resume',resume)

      // Get Clerk authentication token
      const token=await getToken()

      // Upload resume to server
      const {data} = await axios.post(backendUrl+'/api/users/update-resume',formData,{headers:{Authorization:`Bearer ${token}`}} )

      if(data.success){
        await fetchUserData() // Refresh user data
        toast.success(data.message)
      }
      else{
        toast.error(data.message)
      }
    }
    catch(e){
      toast.error(e.message)
    }

    // Reset edit mode and clear file selection
    setIsEdit(false)
    setResume(null)
  }



  return (
    <>
    <Navbar/>

      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
        <h2 className='text-xl font-semibold'>Your Resume</h2>
        <div className='flex gap-2 mb-6 mt-3'>
          {
            isEdit  || (userData && userData.resume === "") ?
            <>
              <label className='flex items-center cursor-pointer' htmlFor='resumeUpload'>
                <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2'>{resume? resume.name : "Select Resume"}</p>
                <input onChange={e=>setResume(e.target.files[0])} accept="application/pdf" type="file" id="resumeUpload" hidden/>
                <img src={assets.profile_upload_icon} alt="" />
              </label>
              <button onClick={updateResume} className='bg-green-100 border border-green-400 rounded-lg px-4 py-2 cursor-pointer'>Save</button>
            </>
            :
            <div className='flex gap-2'>
              <a className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg' href={userData?.resume }target='_blank'>Resume</a>
              <button onClick={()=>setIsEdit(true)} className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2 cursor-pointer'>Edit</button>
            </div>
          }
        </div>
        <h2 className='text-xl font-semibold mb-4'>Jobs Applied</h2>
        <table className='min-w-full bg-white border rounded-lg'>
          <thead>
            <tr>
              <th className='py-3 px-4 border-b text-left'>Company</th>
              <th className='py-3 px-4 border-b text-left'>Job Title</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-3 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-3 px-4 border-b text-left'>Status</th>
            </tr>
          </thead>
          <tbody>
            {userApplications.map((job,index)=> true ? (
            <tr key={index}>
              <td className='py-3  px-4 gap-2 border-b'>
                <div className='flex items-center gap-2'>
                <img className='w-8 h-8' src={job.companyId.image} alt="" />
                {job.companyId.name}
                </div>
                </td>
              <td className='py-2 px-4 border-b'>{job.jobId.title}</td>
              <td className='py-2 px-4 border-b max-sm:hidden'>{job.jobId.location}</td>
              <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.date).format('ll')}</td>
              <td className='py-2 px-4 border-b'><span className={`${job.status==='Accepted' ?'bg-green-100': job.status==='Rejected'? 'bg-red-100' : 'bg-blue-100'} px-4 py-1.5 rounded`}>{job.status}</span></td>
            </tr>)
            :(null)) }
          </tbody>
        </table>
      </div>
    
    <Footer/>
    </>
  )
}

export default Applications