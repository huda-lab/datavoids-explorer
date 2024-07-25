"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";

interface DateTimePickerProps {
  date: Date;
  setDate: (date: Date | undefined) => void;
  disabled: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  date,
  setDate,
  disabled = false,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            date.getHours() != 0 && date.getMinutes() != 0 ? (
              format(date, "PPP HH:mm")
            ) : (
              format(date, "PPP")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={disabled}
        />
        <div className="border-t border-border p-3">
          <TimePicker setDate={setDate} date={undefined} disabled={disabled} />
        </div>
      </PopoverContent>
    </Popover>
  );
};
