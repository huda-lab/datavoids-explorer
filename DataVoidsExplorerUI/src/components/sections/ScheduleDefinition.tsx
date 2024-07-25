import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  setDateFrom,
  setDateTo,
  setFrequency,
} from "@/model/slices/collection-plan";
import { ScheduleFrequency } from "@/model/types";
import { useSelector } from "react-redux";
import { RootState } from "@/model/store";
import { store } from "@/model/store";
import { Card } from "@/components/ui/card";

const ScheduleDefinition = () => {
  const { from, to, frequency } = useSelector(
    (state: RootState) => state.collectionPlan.schedule,
  );
  const taskRunning = useSelector(
    (state: RootState) => !!state.collectionStatus.taskId,
  );

  return (
    <CollapsibleSection
      title="Data Collection"
      description="Specify the date range and frequency for your Google search data collection. Tailor your exploration to specific timeframes."
      wrapToCard
    >
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Label>From</Label>
          <DateTimePicker
            date={new Date(from)}
            setDate={(date) => {
              store.dispatch(setDateFrom(date?.toISOString()));
            }}
            disabled={taskRunning}
          />
          <Label>To</Label>
          <DateTimePicker
            date={new Date(to)}
            setDate={(date) => {
              store.dispatch(setDateTo(date?.toISOString()));
            }}
            disabled={taskRunning}
          />
          <Label>Frequency</Label>
          <Select
            onValueChange={(frequency) => {
              store.dispatch(setFrequency(frequency as ScheduleFrequency));
            }}
            value={frequency}
            disabled={taskRunning}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Daily" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(ScheduleFrequency).map((frequency) => (
                <SelectItem key={frequency} value={frequency}>
                  {frequency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
    </CollapsibleSection>
  );
};

export default ScheduleDefinition;
