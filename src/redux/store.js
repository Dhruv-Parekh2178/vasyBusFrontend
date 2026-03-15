import { configureStore } from "@reduxjs/toolkit";
import authReducer    from "./authSlice";
import searchReducer  from "./searchSlice";
import seatReducer    from "./seatSlice";
import bookingReducer from "./bookingSlice";

export const store = configureStore({
  reducer: {
    auth:    authReducer,
    search:  searchReducer,
    seat:    seatReducer,
    booking: bookingReducer,
  },
});