import { Input } from "@/components/ui/input";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { useSelector } from "react-redux";
import { RootState, store } from "@/model/store";
import { Card } from "@/components/ui/card";
import { setDatavoidKeywords } from "@/model/slices/collection-plan";

const KeywordsDefinition = () => {
  const keywords = useSelector(
    (state: RootState) => state.collectionPlan.keywords,
  );

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    store.dispatch(setDatavoidKeywords(event.target.value));
  };

  const taskRunning = useSelector(
    (state: RootState) => !!state.collectionStatus.taskId,
  );

  return (
    <CollapsibleSection
      title="Data Void Description"
      description="Enter keywords to explore data voids. Discover topics with limited or missing information."
      wrapToCard={true}
    >
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Keywords"
          value={keywords}
          onChange={onInputChange}
          disabled={taskRunning}
        />
      </div>
    </CollapsibleSection>
  );
};

export default KeywordsDefinition;
