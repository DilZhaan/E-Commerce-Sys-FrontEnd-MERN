import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import LoggedContextProvider from './contexts/LoggedContextProvider';
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className='bg-[#f2f2f2]'>
      <LoggedContextProvider>
      <Header />
      <ToastContainer/>
      <main className='min-h-[calc(100vh-197.61px)]'>
        <Outlet />
      </main>
      </LoggedContextProvider>
      <Footer/>
    </div>
  );
};

export default App;
