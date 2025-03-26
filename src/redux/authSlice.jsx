import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/authApi';

// Async thunk for login
export const loginAdmin = createAsyncThunk('auth/loginAdmin', async (adminData, { rejectWithValue }) => {
    try {
        const response = await axios.post('/login', adminData);
        localStorage.setItem('token', response.data.token);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        admin: localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')) : null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('admin'); 
            state.admin = null;
            state.token = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginAdmin.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginAdmin.fulfilled, (state, action) => {
                state.loading = false;
                state.admin = action.payload.admin;
                state.token = action.payload.token;
                localStorage.setItem('admin', JSON.stringify(action.payload.admin));
            })
            .addCase(loginAdmin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload.message;
            })
    }
})

export const { logout } = authSlice.actions;
export default authSlice.reducer;