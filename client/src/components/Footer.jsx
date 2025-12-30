import React from 'react'
import { assets } from '../assets/assets'
import { FaUserTie } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className='container px-4 2xl:px-20 mx-auto flex items-center justify-between gap-4 py-3 mt-20'>
        <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <FaUserTie className="text-white text-[14px]" />
        </div>
        <h1 className="text-[26px] font-bold tracking-wide">
          <span className="text-black">Job</span><span className="text-gray-600">ify</span>
        </h1>
      </div>
        <p className='flex-1 border-l border-gray-400 pl-4 text-sm text-gray-500 max-sm:hidden'>Copyright @YashGoyal | All rights reserved.</p>
        <div className='flex gap-2.5'>
            <img width={38} src={assets.facebook_icon} alt="" />
            <img width={38} src={assets.twitter_icon} alt="" />
            <img width={38} src={assets.instagram_icon} alt="" />
        </div>
    </div>
  )
}

export default Footer