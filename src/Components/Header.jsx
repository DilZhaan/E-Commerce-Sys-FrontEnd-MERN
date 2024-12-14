import React from 'react';
import Logo from './Logo.jsx';
import { FiSearch, FiShoppingCart } from "react-icons/fi";
import { LiaUserSolid } from "react-icons/lia";
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import summaryAPI from '../common/index.jsx';
import { toast } from 'react-toastify'
import { clearUserDetails } from '../store/userSlice.js';

const Header = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch()
  
  const handleSignOut = async () => {
    const fetchData = await fetch(summaryAPI.SignOut.url,{
      method:summaryAPI.SignOut.method,
      credentials:'include'
    })

    const data = await fetchData.json()

    if (data.success){
      toast.success(data.message)
      dispatch(clearUserDetails())
    } else {
      toast.error(data.message)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 shadow-md bg-slate-100">
      <div>
        <Link to="/">
          <Logo width={130} height={50} className="border-b-white" />
        </Link>
      </div>

      <div className="items-center justify-center hidden w-full h-12 max-w-sm pl-5 bg-white border rounded-full lg:flex focus-within:shadow-md">
        <input type="text" className="w-full outline-none" placeholder="Search an Item..." />
        <div className="flex items-center justify-center h-full pr-1 text-2xl text-white bg-red-400 rounded-r-full cursor-pointer min-w-16">
          <FiSearch />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className="flex text-3xl cursor-pointer">
          <span>
            <FiShoppingCart />
          </span>
          <div className="relative flex items-center justify-center w-4 h-4 text-white bg-blue-600 rounded-full -top-2 -left-2">
            <p className="text-xs">0</p>
          </div>
        </div>
        
        { !user ? (
          <Link
            to="/login"
            className="px-3 py-1 text-white bg-red-600 rounded-full hover:bg-red-700"
          >
            Sign In
          </Link>
         ) : (
          <div className='flex justify-between gap-3'>
            <div className="text-4xl cursor-pointer">
              <LiaUserSolid />
            </div>
            <button
              onClick={handleSignOut}
              className="px-3 py-1 text-white bg-red-600 rounded-full hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
          )
         }

        
      </div>
    </div>
  );
};

export default Header;
