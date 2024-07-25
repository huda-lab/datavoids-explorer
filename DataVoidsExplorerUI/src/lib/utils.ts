/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayDate(daysOffset = 0) {
  let date = new Date();
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  if (daysOffset) {
    date.setDate(date.getDate() + daysOffset);
  }

  return date;
}

export function dateFromDateISOString(dateString: string) {
  return dateString.split("T")[0];
}


export function statusToBadgeVariant(status: string) {
  if (status == "done") {
    return "success";
  } else if (status == "error") {
    return "fail";
  } else {
    return "default";
  }
}
