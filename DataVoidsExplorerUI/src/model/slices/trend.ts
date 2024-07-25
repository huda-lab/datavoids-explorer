import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "@/api";
import { RootState } from "@/model/store";

type Trend = {
  date: string;
  frequency: number;
};

enum TrendStatus {
  idle = "idle",
  loading = "loading",
  succeeded = "succeeded",
  failed = "failed",
}

type TrendState = {
  trend: Trend[] | null;
  lastUpdated: string | null;
  status: TrendStatus;
};

const initialState: TrendState = {
  trend: null,
  lastUpdated: null,
  status: TrendStatus.idle,
};

export const fetchTrendAsync = createAsyncThunk(
  "numbers/fetchTrend",
  async (_, { rejectWithValue }) => {
    console.log("call")
    try {
      const response = await axiosInstance.get<Trend[]>("/data");
      return response.data;
    } catch (error) {
      return rejectWithValue([]);
    }
  },
  {
    condition: (_, { getState }) => {
      const { trend }: { trend: TrendState } = getState() as RootState;
      console.log("call cond", trend.status);
      if (trend.status === TrendStatus.loading) {
        return false; // Prevents the async operation if a request is already loading
      }
    },
  }
);


export const trendSlice = createSlice({
  name: "trend",
  initialState,
  reducers: {
    resetTrend: (state) => {
      state.trend = null;
      state.lastUpdated = null;
      state.status = TrendStatus.idle;
    },

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendAsync.pending, (state) => {
        state.status = TrendStatus.loading;
      })
      .addCase(fetchTrendAsync.fulfilled, (state, action) => {
        state.status = TrendStatus.loading;
        state.trend = action.payload;
      })
      .addCase(fetchTrendAsync.rejected, (state) => {
        state.status = TrendStatus.failed;
      });
  },
});

export default trendSlice.reducer;
