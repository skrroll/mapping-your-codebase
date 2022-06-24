import { createSlice } from "@reduxjs/toolkit";

export const selectedCircleSlice = createSlice({
  name: "selectedCircle",
  initialState: {
    value: null,
  },
  reducers: {
    set: (state, action) => {
      state.value = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { set } = selectedCircleSlice.actions;

export default selectedCircleSlice.reducer;
