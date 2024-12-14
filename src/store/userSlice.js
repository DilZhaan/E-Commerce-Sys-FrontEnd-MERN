import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    user:null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers:{
        setUserDetails : (state,action) => {
            state.user = action.payload
            
        },
        clearUserDetails : (state) => {
          state.user = null;
          state.isLoading = false;
        },
    },
})
export const { setUserDetails, clearUserDetails } = userSlice.actions;
export default userSlice.reducer;