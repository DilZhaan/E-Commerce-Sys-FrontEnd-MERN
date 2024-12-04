import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SignUpIcon from '../assest/signin.gif'

const SignUp = () => {
  const pwd = {
    pattern : '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\\W)(?!.* ).{8,16}',
    err : "Password must be 8 to 16 characters long, include at least one lowercase letter, one uppercase letter, one digit, one special character, and no spaces.",
  }

  const [user,setUser] = useState({
    proPic:"",
    fName:"",
    lName:"",
    address:"",
    dob:"",
    gender:"",
    email:"",
    pwd:"",
    cPwd:"",
  })
  const [pwdMatch,setpwdMatch] = useState(null);

  const updateUserHandler = (e) => {
    const {name,value} = e.target
    setUser( prev => {
        return{
        ...prev,
        [name] : value
        }
      }
    )
  }

  const handleUploadPic = e => {
    const file = e.target.files[0]
    console.log(file);
  }
  
  const pwdChecker = useEffect(()=>{
    if(!user.cPwd || !user.pwd) return (setpwdMatch(""));
    setpwdMatch((user.pwd === user.cPwd)? "Password Matched!" : "Password unMatched!")
  },[user.cPwd,user.pwd])

  return (
    <section id='SignUp'>
      <div className='container mx-auto bg-blue-50 shadow-2xl p-6 rounded-md max-w-[calc(100vh-300px)] w-full my-6 bg-gradient-to-b from-blue-50 from-80% via-blue-200 to-blue-50 ' >
        <div className='space-y-6'>
          <div className='text-4xl font-bold from-neutral-600 text-slate-800 font'>Sign Up</div>

          <div className='relative w-20 h-20 mx-auto overflow-hidden rounded-full'>
            <div>
              <img src={SignUpIcon} alt='Sign Up Logo' />
            </div>
            <form>
              <label>
                <div className='absolute bottom-0 w-full py-4 text-xs text-center rounded-b-full cursor-pointer bg-slate-200 bg-opacity-80'>
                  Upload
                </div>
              <input
                type='file'
                accept='image/gif, image/jpeg, image/png'
                title='Please upload a valid image file (GIF, JPG, or PNG).'
                className="hidden"  
                onChange={handleUploadPic}
              />
              </label>
            </form>
          </div>
          <div>
            <form className='space-y-3'>

              <div className='block'>
                <label htmlFor='fName'>First Name : </label>
                <input 
                  type="text" 
                  id='fName'
                  placeholder='First Name' 
                  name='fName' 
                  onChange={updateUserHandler} 
                  className='w-full p-2 bg-white border rounded-md outline-none broder-black focus-within:shadow-md ' 
                  required
                />
              </div>

              <div className='block'>
                <label htmlFor='lName'>Last Name : </label>
                <input 
                  type="text" 
                  id='lName'
                  placeholder='Last Name' 
                  name='lName' 
                  onChange={updateUserHandler} 
                  className='w-full p-2 bg-white border rounded-md outline-none broder-black focus-within:shadow-md ' 
                  required 
                />
              </div>
              
              <div className='block'>
                <label htmlFor='address'>Address : </label>
                <input
                  type = "text" 
                  id = 'address'placeholder='Address' 
                  name = 'address' 
                  onChange = {updateUserHandler} 
                  className = 'w-full p-2 bg-white border rounded-md outline-none broder-black focus-within:shadow-md '  
                  required 
                />
              </div>

              <div className='block'>
                <label htmlFor='dob'>Date of Birth : </label>
                <input 
                  type = "Date" 
                  id = 'dob' 
                  name = 'dob' 
                  onChange = {updateUserHandler} 
                  className = 'w-full p-2 bg-white border rounded-md outline-none broder-black focus-within:shadow-md ' 
                  required
                />
              </div>

              <div className='flex items-center space-x-7'>
                <label htmlFor='gender'>Gender : </label>
                <div className='space-x-3'>
                   <input 
                    type = "Radio" 
                    id = 'Male' 
                    value = "Male" 
                    name = 'gender' 
                    onChange = {updateUserHandler} 
                    required 
                   />
                   <label htmlFor='Male'>Male</label>
                </div>
                <div className='space-x-3'>
                    <input 
                      type = "Radio" 
                      id = 'Female' 
                      value = "Female" 
                      name = 'gender' 
                      onChange = {updateUserHandler} 
                      required
                    />
                   <label htmlFor='Female'>Female</label>

                </div>
              </div>

              <div className='block'>
                <label htmlFor='email'>Email : </label>
                <input 
                  type = "email" 
                  id = 'email'
                  placeholder = 'Email' 
                  onChange = {updateUserHandler} 
                  className = 'w-full p-2 bg-white border rounded-md outline-none broder-black focus-within:shadow-md ' 
                  name = 'email' 
                  required 
                />
              </div>

              <div className='w-full'>
                <label htmlFor='pwd'>Password : </label>
                <input 
                  type="password" 
                  id = 'pwd' 
                  name = 'pwd' 
                  onChange = {updateUserHandler} 
                  className = 'w-full p-2 bg-white border rounded-md outline-none broder-black focus-within:shadow-md' 
                  pattern = {pwd.pattern} 
                  placeholder = 'Password'
                  title = {pwd.err}
                  required 
                />
              </div>

              <div className='w-full'>
                <label htmlFor='cPwd'>Confirm Password : </label>
                <input 
                  type = "password" 
                  id = 'cPwd' 
                  name = 'cPwd' 
                  onChange = {updateUserHandler} 
                  className = 'w-full p-2 bg-white border rounded-md outline-none broder-black focus-within:shadow-md '  
                  placeholder = 'Password' 
                  required 
                />
              </div>

              <div className='w-full'>
                <label 
                  htmlFor='pwdMatched' 
                  className="block ml-auto font-semibold text-red-800 w-fit"
                >
                  {pwdMatch}

                </label>
              </div>

              <div className='container mt-7 bg-violet-700 p-1 rounded-3xl w-[calc(100%-30px)] flex mx-auto items-center justify-center text-white font-bold text-2xl hover:bg-violet-600 focus-within:bg-violet-500'>
                <button 
                  type="submit" 
                  id='submit' 
                  name='submit' 
                  className='rounded-3xl border-white-300 w-full py-2.5 border-2 ' 
                >
                  Sign Up
                </button>
              </div>

              <div>
                <span>Already have an account? </span><Link to="/login" className='text-blue-600 underline hover:text-blue-500'>Sign In</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SignUp
