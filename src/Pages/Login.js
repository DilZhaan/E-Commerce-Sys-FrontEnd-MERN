import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Login = () => {
  const [data,SetData] = useState({
    email:"",
    pwd:"",
  })

  const handleOnChange = (e) => {
    const {name , value} = e.target
    SetData((prev) => {
      return{
        ...prev,
        [name] : value
      }
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
  }

  return (
    <section id='signin'>
      <div className='container mx-auto bg-gradient-to-b from-blue-50 from-60% via-blue-200 to-blue-50  shadow-2xl p-6 rounded-md max-w-[calc(100vh-300px)] w-full mt-16 ' >
        <div className='space-y-6'>
          <div className='text-4xl font-bold from-neutral-600 text-slate-800 font'>Sign In</div>
          <div>

            <form className='space-y-3' onSubmit={handleSubmit}>
              
              <div className='block'>
                <label htmlFor='email'>Email : </label>
                <input 
                  type="email" 
                  id='email'
                  placeholder='Email' 
                  className='outline-none rounded-md bg-white w-full p-2 border broder-black focus-within:shadow-md ' 
                  name='email'
                  onChange={handleOnChange}
                  required
                 />
              </div>

              <div className='w-full'>
                <label htmlFor='pwd'>Password : </label>
                <input 
                  type="password" 
                  id='pwd' name='pwd' 
                  className='outline-none  rounded-md bg-white w-full p-2 border broder-black focus-within:shadow-md ' placeholder='Password' 
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div>
                <Link to="/fogotPassword" className='underline text-blue-600 block w-fit ml-auto hover:text-blue-500'>Forgot Password?</Link>
              </div>

              <div className='container mt-7 bg-violet-700 p-1 rounded-3xl w-[calc(100%-30px)] flex mx-auto items-center justify-center text-white font-bold text-2xl hover:bg-violet-600 focus-within:bg-violet-500'>

                <button 
                  type="submit" 
                  id='submit' 
                  name='submit' 
                  vlaue='Sign In' 
                  className='rounded-3xl border-white-300 w-full py-2.5 border-2 ' 
                >
                  Sign In
                </button>
              </div>

              <div>
                <span>Don't have an account? </span><Link to="/SignUp" className='underline text-blue-600 hover:text-blue-500'>Sign Up</Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
