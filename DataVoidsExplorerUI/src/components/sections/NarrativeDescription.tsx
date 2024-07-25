import { FC, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { Sparkles, HelpCircle } from "lucide-react";
import {
  NarrativeStateType,
  changeNarrative,
} from "@/model/slices/collection-plan";
import { RootState, store } from "@/model/store";
import { Textarea } from "@/components/ui/textarea";

interface NarrativeDescriptionProps {
  description: string;
  type: keyof NarrativeStateType;
}

const NarrativeDescription: FC<NarrativeDescriptionProps> = ({
  description,
  type,
}) => {
  const narrative = useSelector(
    (state: RootState) => state.collectionPlan.narratives[type],
  );
  const taskRunning = useSelector(
    (state: RootState) => !!state.collectionStatus.taskId,
  );

  const aiGenerateNarrative = () => {};

  const setText = (event: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(
      changeNarrative({ type, narrative: event.target.value }),
    );
  };

  return (
    <div className="mb-4">
      {description && <div className="mb-2">{description}</div>}
      <div className="flex">
        <Textarea
          className="min-h-[150px]"
          value={narrative}
          onChange={setText}
          disabled={taskRunning}
        />
        <div className="ml-1 flex flex-col gap-1">
          <Button variant="outline" size="icon" onClick={aiGenerateNarrative}>
            <Sparkles className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NarrativeDescription;
