import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../redux/authSlice'

const store = configureStore ({
    reducer: {
        // Define your reducers here
        auth: authReducer   
    },
    // Other store setup goes here
});

export default store;