import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Home from '../Pages/Home'
import Login from '../Pages/Login'
import SignUp from '../Pages/SignUp'
import ForgotPwd from '../Pages/ForgotPwd'

const router = createBrowserRouter([
    {
        path: "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : "/login",
                element : <Login/>
            },
            {
                path : "/SignUp",
                element : <SignUp/>
            },
            {
                path : "/FogotPassword",
                element : <ForgotPwd/>
            },
            {
                path : "/FogotPassword",
                element : <ForgotPwd/>
            },
        ]
    }
])

export default router