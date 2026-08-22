import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: { sidebarOpen: true },
    reducers: {
        toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    },
});

export const { toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
