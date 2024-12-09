const backEndDomain = "http://localhost:3090"

const summaryAPI = {
    signUp:{
        url:`${backEndDomain}/api/SignUp`,
        method: "post",
    },
    SignIn:{
        url:`${backEndDomain}/api/SignIn`,
        method: "post",
    },
    CurrentUser:{
        url:`${backEndDomain}/api/user-details`,
        method: "get",
    },
}

export default summaryAPI