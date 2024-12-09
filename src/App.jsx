import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import Context from './contexts';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import summaryAPI from './common';

const App = () => {
  const fetchUserDetails = async () => {
    const dataResponse = await fetch(summaryAPI.CurrentUser.url, {
      method: summaryAPI.CurrentUser.method,
      credentials: 'include'
    })
    const dataAPI = await dataResponse.json()
    console.log("Data:", dataResponse, dataAPI)
    return dataAPI
  };

  useEffect(() => {
    fetchUserDetails()
  }, [])
  return (
    <div className='bg-[#f2f2f2]'>
      <Context.Provider value={{fetchUserDetails}}>
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
