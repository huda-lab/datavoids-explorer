import { Input } from "@/components/ui/input";
import { useDispatch, useSelector, useStore } from "react-redux";
import { RootState } from "@/model/store";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { dateFromDateISOString } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import { store } from "@/model/store";
import { startRelabeling, changeTaskStatusNarrative } from "@/model/slices/collection-status";

const TaskSummary = () => {
  const [narrativeChanged, setNarrativeChanged] = useState(false);
  const keywords = useSelector(
    (state: RootState) => state.collectionStatus.keywords,
  );
  const schedule = useSelector(
    (state: RootState) => state.collectionStatus.schedule,
  );
  const narratives = useSelector(
    (state: RootState) => state.collectionStatus.narratives,
  );
  const relabel = useCallback(() => {
    store.dispatch(startRelabeling());
  }, []);

  const narrativeOnChange = (type, narrative) => {
    console.log("narrativeOnChange", type, narrative);
    store.dispatch(changeTaskStatusNarrative({ type, narrative: narrative }));
    setNarrativeChanged(true);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row items-center gap-2">
        <Label>Keywords: </Label>
        <Input
          type="text"
          placeholder="Keywords"
          defaultValue={keywords}
          disabled={true}
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <Label>From:</Label> {schedule && dateFromDateISOString(schedule.from)}
        &nbsp;
        <Label>To:</Label> {schedule && dateFromDateISOString(schedule.to)}
      </div>
      {narratives && (
        <div className="flex flex-col gap-4">
          {Object.entries(narratives).map(([key, narrative]) => (
            <div key={key} className="flex flex-col gap-1">
              <Label>
                {key.charAt(0).toUpperCase() + key.slice(1)} Narrative
              </Label>
              <Textarea
                key={key}
                className="min-h-[50px] w-full"
                defaultValue={narrative}
                onChange={(e) => narrativeOnChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-row">
        <Button
          className="ml-auto"
          disabled={!narrativeChanged}
          onClick={relabel}
        >
          Restart labeling
        </Button>
      </div>
    </div>
  );
};

export default TaskSummary;
