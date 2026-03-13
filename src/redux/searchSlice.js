import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import scheduleService from "../services/scheduleService";

export const searchSchedules = createAsyncThunk(
  "search/searchSchedules",
  async ({ source, destination, travelDate }, thunkAPI) => {
    try {
      const response = await scheduleService.searchSchedules(
        source, destination, travelDate
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Search failed"
      );
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    results: [],
    loading: false,
    error: null,
    lastSearch: null,
  },
  reducers: {
    clearSearch: (state) => {
      state.results = [];
      state.error = null;
      state.lastSearch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchSchedules.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(searchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;