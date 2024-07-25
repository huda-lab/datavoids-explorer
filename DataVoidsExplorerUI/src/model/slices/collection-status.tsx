import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "@/api";
import { AxiosError } from "axios";
import { RootState } from "@/model/store";
import {
  NarrativeStateType,
  UpdatingSheetStatus,
  ResultEntry,
  ResultEntryTabular,
  CollectionStatus,
  ScheduleDefinition,
  TaskInfo,
} from "@/model/types";

export type CollectionStatusState = {
  status: CollectionStatus;
  errorMessage: string | null;
  taskId: string | null;
  googleSpreadSheetId: string | null;
  updatingSheetStatus: UpdatingSheetStatus;
  updatingSheetMessage: string | null;
  results: ResultEntry[] | null;
  keywords: string | null;
  narratives: NarrativeStateType;
  schedule: ScheduleDefinition | null;
  statusGoogleSearchCrawler: CollectionStatus;
  statusContentFetcher: CollectionStatus;
  statusContentLabeler: CollectionStatus;
};

const initialState: CollectionStatusState = {
  status: CollectionStatus.Loading,
  errorMessage: null,
  taskId: null,
  googleSpreadSheetId: null,
  updatingSheetStatus: UpdatingSheetStatus.Idle,
  updatingSheetMessage: null,
  results: null,
  keywords: "",
  narratives: {
    disinformer: "",
    mitigator: "",
    neutral: "",
  },
  schedule: null,
  statusGoogleSearchCrawler: CollectionStatus.Loading,
  statusContentFetcher: CollectionStatus.Loading,
  statusContentLabeler: CollectionStatus.Loading,
};

export const startCollection = createAsyncThunk(
  "task/collection/start",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      const response = await axiosInstance.post<CollectionStatusState>(
        "/task/collection/start",
        {
          keywords: state.collectionPlan.keywords,
          schedule: state.collectionPlan.schedule,
          narratives: state.collectionPlan.narratives,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue([]);
    }
  },
);

export const startRelabeling = createAsyncThunk(
  "task/relabeling/start",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    try {
      const response = await axiosInstance.post<CollectionStatusState>(
        "/task/relabeling/start",
        {
          task_id: state.collectionStatus.taskId,
          new_narratives: state.collectionStatus.narratives,
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue([]);
    }
  },
);

export const getTaskInfo = createAsyncThunk(
  "task/info",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<TaskInfo>(
        `/task/info/${taskId}`,
      );
      return response.data;
    } catch (err) {
      const error = err as Error | AxiosError;
      return rejectWithValue(error.message);
    }
  },
);

export const updateSheet = createAsyncThunk(
  "labeler/export_to_sheet",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const taskId = state.collectionStatus.taskId;
    const googleSpreadSheetId = state.collectionStatus.googleSpreadSheetId;
    try {
      const response = await axiosInstance.post("/labeler/export", {
        taskId,
        googleSpreadSheetId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const importFromSheet = createAsyncThunk(
  "labeler/import_from_sheet",
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as RootState;
    const taskId = state.collectionStatus.taskId;
    const googleSpreadSheetId = state.collectionStatus.googleSpreadSheetId;
    console.log("State", state)
    try {
      console.log("importing from sheet", taskId, googleSpreadSheetId);
      const response = await axiosInstance.post("/labeler/import", {
        taskId,
        googleSpreadSheetId,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const getTaskResults = createAsyncThunk(
  "task/collection/results",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<ResultEntryTabular[]>(
        `/task/collection/results/${taskId}`,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const collectionPlanSlice = createSlice({
  name: "narratives",
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<CollectionStatus>) => {
      state.status = action.payload;
    },
    setTaskId: (state, action: PayloadAction<string | undefined>) => {
      state.taskId = !action.payload ? null : action.payload;
    },
    changeTaskStatusNarrative: (
      state,
      action: PayloadAction<{
        type: keyof NarrativeStateType;
        narrative: string;
      }>,
    ) => {
      state.narratives[action.payload.type] = action.payload.narrative;
    },
  },
  extraReducers: (builder) => {
    builder

      // Start collection
      .addCase(startCollection.pending, (state) => {
        state.status = CollectionStatus.Loading;
        state.taskId = null;
      })
      .addCase(startCollection.fulfilled, (state, result) => {
        state.status = CollectionStatus.Processing;
        state.taskId = result.payload.taskId;

        // change the browser location to include the task id
        window.location.href = `/task/${result.payload.taskId}`;
      })
      .addCase(startCollection.rejected, (state) => {
        state.status = CollectionStatus.Failed;
        state.taskId = null;
      })

      // Start relabeling
      .addCase(startRelabeling.fulfilled, (state, result) => {
        console.log("start relabeling fuffulled", result.payload);
        state.taskId = result.payload.taskId;
        // change the browser location to include the task id
        window.location.href = `/task/${result.payload.taskId}`;
      })
      .addCase(startRelabeling.rejected, (state) => {
        // TODO error display
      })

      // Get task state
      .addCase(getTaskInfo.fulfilled, (state, result) => {
        console.log("task info", result.payload);
        if (!result.payload) {
          state.errorMessage = "Task with this ID was not found";
          return;
        }
        state.status = result.payload.status;
        state.statusGoogleSearchCrawler =
          result.payload.status_google_search_crawler;
        state.statusContentFetcher = result.payload.status_content_fetcher;
        state.statusContentLabeler = result.payload.status_labeler;
        state.keywords = result.payload.keywords;
        state.schedule = result.payload.schedule;
        state.narratives = result.payload.narratives;
      })

      // Get Task Results
      .addCase(getTaskResults.fulfilled, (state, result) => {
        state.results = result.payload.map((r) => ({
          url: r[0],
          label: r[1],
          date: r[2],
          position: r[3],
        }));
      })
      .addCase(getTaskResults.rejected, (state, action) => {
        state.results = null;
      })

      // Update sheet
      .addCase(updateSheet.pending, (state) => {
        state.updatingSheetStatus = UpdatingSheetStatus.Loading;
        state.updatingSheetMessage = "";
      })
      .addCase(updateSheet.fulfilled, (state, action) => {
        state.googleSpreadSheetId = action.payload.googleSpreadSheetId;
        if (action.payload.status == "error") {
          state.updatingSheetStatus = UpdatingSheetStatus.Failed;
          state.updatingSheetMessage = action.payload.message;
        } else {
          state.updatingSheetStatus = UpdatingSheetStatus.Success;
          state.updatingSheetMessage = "Sheet exported successfully";
          state.googleSpreadSheetId = action.payload.googleSpreadSheetId;
        }
      })
      .addCase(updateSheet.rejected, (state) => {
        state.updatingSheetStatus = UpdatingSheetStatus.Failed;
        state.updatingSheetMessage = "Failed to update sheet";
      });
  },
});

export const { setState, setTaskId, changeTaskStatusNarrative } = collectionPlanSlice.actions;
export default collectionPlanSlice.reducer;
