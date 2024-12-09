import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import summaryAPI from '../common/index.jsx';
import { toast } from 'react-toastify';
import Context  from '../contexts';

const Login = () => {  
  const {fetchUserDetails} = useContext(Context);


  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    pwd: "",
});

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataResponse = await fetch(summaryAPI.SignIn.url, {
        method: summaryAPI.SignIn.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const dataAPI = await dataResponse.json();

      if (dataAPI.success) {
        toast.success(dataAPI.message);
        fetchUserDetails();
        navigate('/');
      } else if (dataAPI.error) {
        toast.error(dataAPI.message);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      console.error('Error during login:', error);
    }
  };

  return (
    <section id="signin">
      <div className="container mx-auto bg-gradient-to-b from-blue-50 from-60% via-blue-200 to-blue-50 shadow-2xl p-6 rounded-md max-w-[calc(100vh-300px)] w-full mt-16">
        <div className="space-y-6">
          <div className="text-4xl font-bold text-slate-800">Sign In</div>
          <div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="block">
                <label htmlFor="email">Email: </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Email"
                  className="w-full p-2 bg-white border border-black rounded-md outline-none focus-within:shadow-md"
                  name="email"
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div className="w-full">
                <label htmlFor="pwd">Password: </label>
                <input
                  type="password"
                  id="pwd"
                  name="pwd"
                  className="w-full p-2 bg-white border border-black rounded-md outline-none focus-within:shadow-md"
                  placeholder="Password"
                  onChange={handleOnChange}
                  required
                />
              </div>

              <div>
                <Link to="/forgotPassword" className="block ml-auto text-blue-600 underline w-fit hover:text-blue-500">
                  Forgot Password?
                </Link>
              </div>

              <div className="container mt-7 bg-violet-700 p-1 rounded-3xl w-[calc(100%-30px)] flex mx-auto items-center justify-center text-white font-bold text-2xl hover:bg-violet-600">
                <button
                  type="submit"
                  id="submit"
                  name="submit"
                  value="Sign In"
                  className="rounded-3xl border-white-300 w-full py-2.5 border-2"
                >
                  Sign In
                </button>
              </div>

              <div>
                <span>Don't have an account? </span>
                <Link to="/SignUp" className="text-blue-600 underline hover:text-blue-500">
                  Sign Up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;