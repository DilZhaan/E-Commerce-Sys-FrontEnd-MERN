import React, {useContext} from 'react'
import Logo from '../Components/Logo'
import { FiSearch, FiShoppingCart } from "react-icons/fi"
import { LiaUserSolid } from "react-icons/lia"
import { Link } from 'react-router-dom'
import { isLoggedContext } from '../contexts/LoggedContextProvider'

const Header = () => {
  const isLogged = useContext(isLoggedContext);
  return (
    <div className='shadow-md bg-slate-100 flex justify-between items-center py-3 px-4'>

      <div>
        <Link to="/">
          <Logo width={130} height={50} className="border-b-white" />
        </Link>
      </div>

      <div className='hidden lg:flex items-center w-full h-12 bg-white justify-center max-w-sm border rounded-full pl-5 focus-within:shadow-md '>
        <input type='text' className='outline-none w-full' placeholder='Search an Item...' />
        <div className='text-2xl bg-red-400 min-w-16 h-full pr-1 flex items-center justify-center text-white rounded-r-full cursor-pointer'>
          <FiSearch />
        </div>
      </div>

      <div className='flex gap-2 items-center justify-center'>
        <div className='flex text-3xl cursor-pointer'>
          <span><FiShoppingCart /></span>
          <div className='bg-blue-600 relative text-white h-4 w-4 rounded-full flex items-center justify-center -top-2 -left-2'>
            <p className='text-xs'>0</p>
          </div>
        </div>
        {
          (!isLogged) ?
            <Link to={"/login"} className='px-3 py-1 rounded-ful text-white bg-red-600 rounded-full hover:bg-red-700 '> Login </Link>
          :
            <div className='cursor-pointer text-4xl'>
              <LiaUserSolid />
            </div>
        }


      </div>

    </div>
  )
}

export default Header
