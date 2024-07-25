import { todayDate } from "@/lib/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ScheduleDefinition,
  NarrativeStateType,
  ScheduleFrequency,
} from "@/model/types";

export type DatavoidStateType = {
  keywords: string;
  schedule: ScheduleDefinition;
  narratives: NarrativeStateType;
};

const initialState: DatavoidStateType = {
  keywords: "pizzagate",
  schedule: {
    from: new Date("2016-06-01").toISOString(),
    to: new Date("2021-01-01").toISOString(),
    frequency: ScheduleFrequency.Monthly,
  },
  narratives: {
    disinformer: `It claims as fact the following: [Claims].\n
It may refer to [Evidence] as evidence. 
It may mention the following [Mentions]. 
It may have negative sentiments toward [Negative sentiments]. 
It may have positive sentiments toward [Positive sentiments].`,

    mitigator: `It claims as fact the following: [Claims].\n
It may refer to [Evidence] as evidence. 
It may mention the following [Mentions]. 
It may have negative sentiments toward [Negative sentiments]. 
It may have positive sentiments toward [Positive sentiments].`,
    neutral: `If the page is not leaning in one narrative or the other and instead presents both sides equally.`,
  },
};

export const collectionPlanSlice = createSlice({
  name: "narratives",
  initialState,
  reducers: {
    setDatavoidKeywords: (state, action: PayloadAction<string>) => {
      state.keywords = action.payload;
    },
    setDateFrom: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload === undefined) {
        state.schedule.to = todayDate().toISOString();
        return;
      }
      state.schedule.from = action.payload;
    },
    setDateTo: (state, action: PayloadAction<string | undefined>) => {
      if (action.payload === undefined) {
        state.schedule.to = todayDate().toISOString();
        return;
      }
      state.schedule.to = action.payload;
    },
    setFrequency: (state, action: PayloadAction<ScheduleFrequency>) => {
      state.schedule.frequency = action.payload;
    },

    changeNarrative: (
      state,
      action: PayloadAction<{
        type: keyof NarrativeStateType;
        narrative: string;
      }>,
    ) => {
      state.narratives[action.payload.type] = action.payload.narrative;
    },
  },
});

export const {
  setDatavoidKeywords,
  setDateFrom,
  setDateTo,
  setFrequency,
  changeNarrative,
} = collectionPlanSlice.actions;
export default collectionPlanSlice.reducer;
