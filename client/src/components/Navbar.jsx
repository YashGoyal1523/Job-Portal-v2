import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import {useClerk,useUser,UserButton} from '@clerk/clerk-react'
import { Link,useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { FaUserTie } from 'react-icons/fa';

const Navbar = () => {

const {openSignIn}=useClerk();

const {user}=useUser()

const navigate=useNavigate()

const {setShowRecruiterLogin}=useContext(AppContext)

  return (
    <div className='shadow py-4'>
        <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center '>

                    <div onClick={() => navigate('/')} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
                           <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-600 rounded-full flex items-center justify-center">
                               <FaUserTie className="text-white text-[15px] sm:text-[16px]" />
                            </div>
                              <h1 className="text-[27px] sm:text-[34px] font-bold tracking-wide leading-none">
                                <span className="text-black">Job</span>
                                 <span className="text-gray-600">ify</span>
                               </h1>
                      </div>
                      
                     { user?

                   <div className='flex items-center gap-3 max-sm:text-sm'>
                    <Link to={'/applications'} className='hover:text-blue-600'>Applied Jobs</Link>
                    <p>|</p>
                    <Link to={'/resume-analyzer'} className='hover:text-blue-600'>Resume Analyzer</Link>
                    <p>|</p>
                    <Link to={'/job-matcher'} className='hover:text-blue-600'>Job Matcher</Link>
                    <p>|</p>
                    <p className='max-sm:hidden'>Hi, {user.firstName+" "+user.lastName}</p>
                    <UserButton/>
                   </div>
                :
            <div className="flex gap-3 sm:gap-4 text-xs sm:text-base">
               <button onClick={() => setShowRecruiterLogin(true)} className="bg-gray-200 text-gray-700 px-3 sm:px-6 py-2 sm:py-2 hover:bg-gray-300 rounded-full cursor-pointer">Recruiter Login</button>
                <button onClick={openSignIn} className="bg-blue-600 text-white px-3 sm:px-6 py-2 sm:py-2 hover:bg-blue-700 rounded-full cursor-pointer">User Login</button>
            </div>

            }

        </div>
    </div>
  )
}

export default Navbar