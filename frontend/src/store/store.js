import { configureStore } from "@reduxjs/toolkit";
import selectedCircleReducer from "./selectedCircleSlice";

export default configureStore({
  reducer: {
    selectedCircle: selectedCircleReducer,
  },
});
