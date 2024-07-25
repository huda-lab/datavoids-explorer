import { axiosInstance } from "@/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TaskInfo } from "@/model/types";

export type TasksSliceType = {
  tasks: TaskInfo[];
};

const initialState: TasksSliceType = {
  tasks: [],
};

export const getTasks = createAsyncThunk(
  "tasks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<TaskInfo[]>("/tasks");
      return response.data;
    } catch (error) {
      return rejectWithValue([]);
    }
  },
);

export const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getTasks.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
  },
});

export default tasksSlice.reducer;
