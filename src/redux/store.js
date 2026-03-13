import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import searchReducer from "./searchSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    search: searchReducer,
  },
});