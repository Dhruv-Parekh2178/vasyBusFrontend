import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../utils/api";


export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async ({ scheduleId, seatIds, passengers }, thunkAPI) => {
    try {
      const res = await api.post("/bookings", {
        schedule_id: scheduleId,
        seat_ids: seatIds,
        passengers: passengers.map(p => ({
          seat_id:          p.seatId,
          passenger_name:   p.passengerName.trim(),
          passenger_age:    Number(p.passengerAge),
          passenger_gender: p.passengerGender,
        })),
      });
      return res.data?.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.data?.message || "Booking failed"
      );
    }
  }
);

export const fetchMyBookings = createAsyncThunk(
  "booking/fetchMyBookings",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/bookings/my-bookings");
      return res.data?.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.data?.message || "Failed to load bookings"
      );
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async ({ bookingId, reason }, thunkAPI) => {
    try {
      const encoded = encodeURIComponent(reason || "Cancelled by user");
      await api.put(`/bookings/${bookingId}/cancel?reason=${encoded}`);
      return bookingId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.data?.message || "Cancellation failed"
      );
    }
  }
);


const bookingSlice = createSlice({
  name: "booking",
  initialState: {
 
    selectedSeats: [],      
    passengerDetails: [], 
    currentBooking: null,


    myBookings: [],    

    loading: false,
    bookingLoading: false,
    error: null,
  },
  reducers: {
    selectSeat: (state, action) => {
      const { seatId, seatNumber, seatType } = action.payload;
      if (!state.selectedSeats.includes(seatId)) {
        state.selectedSeats.push(seatId);
        state.passengerDetails.push({
          seatId, seatNumber, seatType,
          passengerName: "", passengerAge: "", passengerGender: "",
        });
      }
    },
    deselectSeat: (state, action) => {
      const seatId = action.payload;
      state.selectedSeats = state.selectedSeats.filter(id => id !== seatId);
      state.passengerDetails = state.passengerDetails.filter(p => p.seatId !== seatId);
    },
    updatePassenger: (state, action) => {
      const { seatId, field, value } = action.payload;
      const p = state.passengerDetails.find(p => p.seatId === seatId);
      if (p) p[field] = value;
    },

   
    clearSelection: (state) => {
      state.selectedSeats = [];
      state.passengerDetails = [];
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearBookingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBooking.pending, (state) => {
        state.bookingLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookingLoading = false;
        state.currentBooking = action.payload;
        state.selectedSeats = [];
        state.passengerDetails = [];
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.bookingLoading = false;
        state.error = action.payload;
      })

      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.myBookings = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(cancelBooking.fulfilled, (state, action) => {
        const bookingId = action.payload;
        const booking = state.myBookings.find(b => b.bookingId === bookingId);
        if (booking) booking.bookingStatus = "CANCELLED";
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  selectSeat, deselectSeat, updatePassenger,
  clearSelection, clearCurrentBooking, clearBookingError,
} = bookingSlice.actions;

export default bookingSlice.reducer;