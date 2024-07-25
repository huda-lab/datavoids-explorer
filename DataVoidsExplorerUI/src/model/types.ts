/* eslint-disable @typescript-eslint/no-explicit-any */
export enum CollectionStatus {
  Loading = "loading", // Uknown, we still need to ask the server
  Failed = "failed",
  Processing = "processing",
}

/**
 * ResultEntry type. Example:
 * [
        "0af8f2b8-3c21-4c96-a9b6-15a969b867cf",
        "https://www.jmc.army.mil/Radford/RadfordDefault.aspx",
        "N/A",
        "Thu, 28 Feb 2019 20:00:00 GMT",
        1
    ],
 */
export type ResultEntry = {
  url: string;
  label: string;
  date: string;
  position: number;
};

export type ResultEntryTabular = [string, string, string, number];

export enum UpdatingSheetStatus {
  Idle = "idle",
  Success = "success",
  Loading = "loading",
  Failed = "failed",
}

export enum ScheduleFrequency {
  Hourly = "Hourly",
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
}

export type NarrativeStateType = {
  disinformer: string;
  mitigator: string;
  neutral: string;
};

export type ScheduleDefinition = {
  from: string;
  to: string;
  frequency: ScheduleFrequency;
};

export type DatavoidStateType = {
  keywords: string;
  schedule: ScheduleDefinition;
  narratives: NarrativeStateType;
};

export type TaskId = string;

export type TaskInfo = {
  id: TaskId;
  keywords: string;
  schedule: ScheduleDefinition;
  narratives: NarrativeStateType;
  status_google_search_crawler: CollectionStatus;
  status_content_fetcher: CollectionStatus;
  status_labeler: CollectionStatus;
  status: CollectionStatus;
};

export enum NarrativeLabel {
  "MITIGATOR" = <any>"MITIGATOR",
  "DISINFORMATION" = <any>"DISINFORMATION",
  "NEUTRAL" = <any>"NEUTRAL",
  "N/A" = <any>"N/A",
  "ERROR" = <any>"ERROR",
}

export enum NarrativeLabelColor {
  "NEUTRAL" = <any>"#b6c5e5",
  "MITIGATOR" = <any>"#6CA056",
  "DISINFORMATION" = <any>"#C2428F",
  "N/A" = <any>"#DCDCDC",
  "ERROR" = <any>"#DCDCDC",
}
