import React, { useEffect, useState } from 'react';
import { isCookie, Outlet } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Context from './contexts';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import summaryAPI from './common';
import { useDispatch } from "react-redux"; 
import { setUserDetails } from './store/userSlice';

const App = () => {

  const userDispatch = useDispatch()

  const fetchUserDetails = async () => {
    const dataResponse = await fetch(summaryAPI.CurrentUser.url, {
      method: summaryAPI.CurrentUser.method,
      credentials: 'include'
    })
    const user = await dataResponse.json()
    if (user.success) {
      userDispatch(setUserDetails(user.data))
      console.log("User: ",user.data);   
    }
  };

  useEffect(() => {
    fetchUserDetails()
  },[]) 

  return (
    <div className='bg-[#f2f2f2]'>
      <Context.Provider value={fetchUserDetails}>
        <Header />
        <ToastContainer />
        <main className='min-h-[calc(100vh-197.61px)]'>
          <Outlet />
        </main>
      </Context.Provider>
      <Footer />
    </div>
  );
};

export default App;
