import React, { useEffect } from 'react'
import { NavLink, Outlet,useNavigate,useLocation  } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { FaUserTie } from 'react-icons/fa';

/**
 * Dashboard Component
 * Main layout for recruiter/company dashboard
 * Includes sidebar navigation and outlet for nested routes
 * Protected route - requires company authentication
 */
const Dashboard = () => {

    const navigate=useNavigate()
    const location=useLocation()

    const {companyData,setCompanyData,setCompanyToken} = useContext(AppContext)

/**
 * Logout Function
 * Clears company authentication token and data
 * Removes token from localStorage
 */
const logout=()=>{
  setCompanyToken(null)
  localStorage.removeItem('companyToken')
  setCompanyData(null)
}

// Redirect to manage-jobs when accessing base dashboard route
useEffect(()=>{
  if(location.pathname==="/dashboard"){
    navigate('/dashboard/manage-jobs')
  }
},[location.pathname])


  return(
    <div className='min-h-screen'>
       {/* Navbar for recruiter panel */}
       <div className='shadow py-4'>
        <div className='px-5 flex justify-between items-center'>
        <div className="flex items-center gap-2 sm:gap-3 ">
                                   <div className="w-7 h-7 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                       <FaUserTie className="text-white text-[13px] sm:text-[16px]" />
                                    </div>
                                      <h1 className="text-[23px] sm:text-[30px] font-bold tracking-wide leading-none">
                                        <span className="text-black">Job</span>
                                         <span className="text-gray-600">ify</span>
                                       </h1>
                              </div>
         {companyData && (     
            <div className='flex items-center gap-3'>
            <p className='max-sm:hidden'>Hi,{companyData.name}</p>
            <div className='relative group'>
                <img className='w-8 border rounded-full' src={companyData.image} alt="" />
                <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
                    <ul className='list-none m-0 p-2 bg-white rounded-md border text-sm'>
                        <li onClick={logout} className='py-1 px-2 cursor-pointer pr-10'>Logout</li>
                    </ul>
                </div>
            </div>
        </div>
          )}
        
       </div>
    </div>


    <div className='flex items-start'>
       {/* leftside bar   */}
    <div className='inline-block min-h-screen border-r-2 border-gray-200'>
      <ul className='flex flex-col items-start pt-5 text-gray-800'>
          <NavLink className={({isActive})=>`flex items-center p-3 sm:px-6 gap-2 w-full hover-bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/manage-jobs'}>
            <img className='min-w-4' src={assets.home_icon} alt="" />
            <p className='max-sm:hidden'>Manage Jobs</p>
        </NavLink>
          <NavLink className={({isActive})=>`flex items-center p-3 sm:px-6 gap-2 w-full hover-bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/view-applications'}>
            <img className='min-w-4' src={assets.person_tick_icon} alt="" />
            <p className='max-sm:hidden'>View Applications</p>
        </NavLink>
        <NavLink className={({isActive})=>`flex items-center p-3 sm:px-6 gap-2 w-full hover-bg-gray-100 ${isActive && 'bg-blue-100 border-r-4 border-blue-500'}`} to={'/dashboard/add-job'}>
            <img className='min-w-4' src={assets.add_icon} alt="" />
            <p className='max-sm:hidden'>Add Job</p>
        </NavLink>
      </ul>
    </div>

    {/* right section */}
    <div className='flex-1 h-full p-2 sm:p-5'>
        <Outlet/>
    </div>


    </div>


    </div>
  )
}

export default Dashboard