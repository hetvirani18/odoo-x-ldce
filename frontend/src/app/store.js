import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        ui: uiReducer,
    },
    middleware: (getDefault) => getDefault().concat(api.middleware),
});
