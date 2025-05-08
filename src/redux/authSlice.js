import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "http://localhost:4000/api/auth";

// Create async thunks for API calls
export const signIn = createAsyncThunk(
  "auth/signIn",
  async (credentials, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(`${BASE_URL}/signin`, credentials, {
        withCredentials: true
      });
      
      // After successful login, immediately check auth to get user details
      if (response.data.success) {
        try {
          const authCheck = await axios.get(`${BASE_URL}/check`, {
            withCredentials: true
          });
          
          if (authCheck.data.success) {
            // Combine both responses
            return {
              ...response.data,
              user: authCheck.data.user
            };
          }
        } catch (checkError) {
          console.error("Failed to fetch user details after login:", checkError);
        }
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (userData, { rejectWithValue }) => {
    try {
      // Log form data for debugging
      console.log("SignUp thunk - Form data keys:", [...userData.keys()]);
      console.log("SignUp thunk - Form data values:", 
        [...userData.entries()].map(entry => `${entry[0]}: ${entry[1] instanceof File ? `File: ${entry[1].name}` : entry[1]}`));
      
      // Log specific file data if present
      const fileEntry = userData.get('proPic') || userData.get('profilePic');
      if (fileEntry instanceof File) {
        console.log("File details:", {
          name: fileEntry.name,
          size: fileEntry.size,
          type: fileEntry.type
        });
      } else {
        console.log("No file included in form data");
      }
      
      // Add more detailed content-type header
      const response = await axios.post(`${BASE_URL}/signup`, userData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary' + Math.random().toString().substr(2)
        },
        // Add timeout to avoid hanging requests
        timeout: 30000
      });
      
      console.log("Signup response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Signup API error:", error);
      // Log more detailed error information
      if (error.response) {
        console.error("Response error data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        return rejectWithValue(error.response.data || { message: "Registration failed with server error" });
      } else if (error.request) {
        console.error("Request was made but no response received");
        return rejectWithValue({ message: "No response from server. Please try again later." });
      } else {
        console.error("Error setting up request:", error.message);
        return rejectWithValue({ message: "Error setting up request: " + error.message });
      }
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      console.log("Checking authentication status");
      const response = await axios.get(`${BASE_URL}/check`, {
        withCredentials: true
      });
      console.log("Auth check response:", response.data);
      
      // Log detailed user info for debugging
      if (response.data.user) {
        console.log("User details from server:", {
          id: response.data.user._id,
          email: response.data.user.email,
          role: response.data.user.role,
          name: `${response.data.user.fName} ${response.data.user.lName}`
        });
      } else {
        console.warn("Auth check succeeded but no user data was received");
      }
      
      // If the response indicates an error, reject the thunk
      if (response.data.error === true) {
        return rejectWithValue(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error("Auth check failed:", error);
      
      // Handle token expiration or auth issues
      if (error.response?.status === 401) {
        console.log("Authentication failed due to invalid or expired token");
        
        // Force user logout when token is expired
        try {
          // Try to clear cookie on server
          await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true })
            .catch(err => console.log("Logout cleanup attempt failed:", err));
            
          console.log("Expired token detected - user automatically logged out");
        } catch (logoutErr) {
          console.error("Failed to logout after token expiration:", logoutErr);
        }
      }
      
      return rejectWithValue(error.response?.data || { 
        message: "Authentication check failed", 
        tokenExpired: error.response?.status === 401
      });
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/logout`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = "";
    },
    resetLoading: (state) => {
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Sign In
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.data;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        state.successMessage = action.payload.message;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Sign in failed";
      })
      
      // Sign Up
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Sign up failed";
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        
        // If token expired, clear all auth state
        if (action.payload?.tokenExpired) {
          console.log("Auth state cleared due to expired token");
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        } else if (action.payload?.error) {
          // Other auth check failures
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Logout failed";
      });
  },
});

export const { clearError, clearSuccessMessage, resetLoading } = authSlice.actions;

export default authSlice.reducer; 