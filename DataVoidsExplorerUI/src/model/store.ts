import { configureStore, combineReducers } from "@reduxjs/toolkit";
import trendReducer from "./slices/trend";
import collectionPlan from "./slices/collection-plan";
import collectionStatus from "./slices/collection-status";
import tasks from "./slices/tasks";

// Available reducers
const reducer = combineReducers({
  collectionPlan: collectionPlan,
  trend: trendReducer,
  collectionStatus: collectionStatus,
  tasks: tasks,
});

// Create the store
export const store = configureStore({
  reducer,
  devTools: import.meta.env.NODE_ENV !== "production",
});

// Export the store and types
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;
