import React from 'react'
import { FaFacebook , FaSquareInstagram , FaLinkedin } from "react-icons/fa6";
import { Link } from 'react-router-dom';

const footer = () => {
  const currentYear = new Date().getFullYear()
  return (
    <div className='w-full bg-slate-300 flex item-center justify-center'>
      <div className='container space-y-3 py-4'>
        <div className='flex justify-center'>
          <p>© {currentYear} DilZhan's Store Online</p>
        </div>
        <div className=' space-y-2'>
          <div className='flex justify-center'>
            <label>Follow Us : </label>
          </div>
          <div className='flex justify-center text-2xl opacity-60 gap-2'>
            <Link to="#"><FaFacebook /></Link>
            <Link to="#"><FaSquareInstagram /></Link>
            <Link to="#"><FaLinkedin /></Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default footer
