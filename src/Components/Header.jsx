import React, {useContext} from 'react'
import Logo from './Logo.jsx'
import { FiSearch, FiShoppingCart } from "react-icons/fi"
import { LiaUserSolid } from "react-icons/lia"
import { Link } from 'react-router-dom'
import Context from '../contexts'

const Header = () => {
  const UserDetails = useContext(Context);
  return (
    <div className='flex items-center justify-between px-4 py-3 shadow-md bg-slate-100'>

      <div>
        <Link to="/">
          <Logo width={130} height={50} className="border-b-white" />
        </Link>
      </div>

      <div className='items-center justify-center hidden w-full h-12 max-w-sm pl-5 bg-white border rounded-full lg:flex focus-within:shadow-md '>
        <input type='text' className='w-full outline-none' placeholder='Search an Item...' />
        <div className='flex items-center justify-center h-full pr-1 text-2xl text-white bg-red-400 rounded-r-full cursor-pointer min-w-16'>
          <FiSearch />
        </div>
      </div>

      <div className='flex items-center justify-center gap-2'>
        <div className='flex text-3xl cursor-pointer'>
          <span><FiShoppingCart /></span>
          <div className='relative flex items-center justify-center w-4 h-4 text-white bg-blue-600 rounded-full -top-2 -left-2'>
            <p className='text-xs'>0</p>
          </div>
        </div>
        {
          (!UserDetails) ?
            <Link to={"/login"} className='px-3 py-1 text-white bg-red-600 rounded-full rounded-ful hover:bg-red-700 '> Login </Link>
          :
            <div className='text-4xl cursor-pointer'>
              <LiaUserSolid />
            </div>
        }


      </div>

    </div>
  )
}

export default Header
