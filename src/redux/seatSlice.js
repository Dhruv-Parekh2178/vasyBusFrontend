import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../utils/api";

export const fetchSeats = createAsyncThunk(
  "seat/fetchSeats",
  async (scheduleId, thunkAPI) => {
    try {
      const res = await api.get(`/seats/schedule/${scheduleId}`);
      return res.data?.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.data?.message || "Failed to load seats"
      );
    }
  }
);

export const lockSeat = createAsyncThunk(
  "seat/lockSeat",
  async ({ seatId, scheduleId }, thunkAPI) => {
    try {
      await api.post("/seats/lock", { seat_id: seatId, schedule_id: scheduleId });
      return seatId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.data?.message || "Failed to lock seat"
      );
    }
  }
);

export const unlockSeat = createAsyncThunk(
  "seat/unlockSeat",
  async (seatId, thunkAPI) => {
    try {
      await api.post(`/seats/unlock?seatId=${seatId}`);
      return seatId;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.data?.message || "Failed to unlock seat"
      );
    }
  }
);

const seatSlice = createSlice({
  name: "seat",
  initialState: {
    seats: [],         
    lockedSeatIds: [],   
    lockTimer: null, 
    loading: false,
    error: null,
  },
  reducers: {
    
    startLockTimer: (state) => {
      state.lockTimer = 600;
    },
    tickLockTimer: (state) => {
      if (state.lockTimer !== null && state.lockTimer > 0) {
        state.lockTimer -= 1;
      } else if (state.lockTimer === 0) {
        state.lockTimer = null;
        state.lockedSeatIds = []; 
      }
    },
    clearSeats: (state) => {
      state.seats = [];
      state.lockedSeatIds = [];
      state.lockTimer = null;
      state.loading = false;
      state.error = null;
    },
    removeLocked: (state, action) => {
      state.lockedSeatIds = state.lockedSeatIds.filter(id => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeats.fulfilled, (state, action) => {
        state.loading = false;
        state.seats = action.payload;
      })
      .addCase(fetchSeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(lockSeat.fulfilled, (state, action) => {
        const seatId = action.payload;
        if (!state.lockedSeatIds.includes(seatId)) {
          state.lockedSeatIds.push(seatId);
        }
        if (state.lockTimer === null) {
          state.lockTimer = 600;
        }
      })

      .addCase(unlockSeat.fulfilled, (state, action) => {
        state.lockedSeatIds = state.lockedSeatIds.filter(id => id !== action.payload);
        if (state.lockedSeatIds.length === 0) {
          state.lockTimer = null;
        }
      });
  },
});

export const { startLockTimer, tickLockTimer, clearSeats, removeLocked } = seatSlice.actions;
export default seatSlice.reducer;