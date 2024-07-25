import { Header } from "@/components/ui/header";
import KeywordsDefinition from "@/components/sections/KeywordsDefinition";
import ScheduleDefinition from "@/components/sections/ScheduleDefinition";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import TrendsOvertime from "@/components/sections/TrendsOvertime";
import NarrativeDescription from "@/components/sections/NarrativeDescription";
import { startCollection } from "@/model/slices/collection-status";
import { store } from "@/model/store";
import { Button } from "../ui/button";
import { CollectionStatus } from "@/model/types";
import { useSelector } from "react-redux";

function TaskSubmission() {
  const status = useSelector(
    (state: RootState) => state.collectionStatus.status,
  );
  return (
    <>
      <Header
        title={
          <div className="flex items-center">
            <img className="mr-2 h-6" src="/icon.svg" />
            <span>DataVoids Explorer</span>
          </div>
        }
      />
      <KeywordsDefinition />
      <ScheduleDefinition />
      <TrendsOvertime />

      <CollapsibleSection title="Narratives descriptions" wrapToCard>
        <NarrativeDescription
          description="Label the page as disinformation if:"
          type={"disinformer"}
        />
        <NarrativeDescription
          description="Label the page as mitigator if:"
          type={"mitigator"}
        />
        <NarrativeDescription
          description="Label the page as irrelevant if:"
          type={"neutral"}
        />
      </CollapsibleSection>

      <div className="mt-4 space-y-2 mr-4 mb-8 text-right">
        {status !== CollectionStatus.Processing ? (
          <Button onClick={() => store.dispatch(startCollection())}>
            Start
          </Button>
        ) : (
          <div>Processing...</div>
        )}
      </div>
    </>
  );
}

export default TaskSubmission;
