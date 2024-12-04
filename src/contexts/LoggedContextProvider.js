import React, { createContext, useState } from 'react';

export const isLoggedContext = createContext();

const LoggedContextProvider = ({children}) => {

  const [isLogged,setUserDetails] = useState(false)

  return (
    <isLoggedContext.Provider value={isLogged}>
      {children}
    </isLoggedContext.Provider>
  )
}

export default LoggedContextProvider
