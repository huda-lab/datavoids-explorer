import { useEffect, useState, memo } from "react";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { store, RootState } from "@/model/store";
import { useSelector, useDispatch } from "react-redux";
import GoogleTrendsWidget from "./GoogleTrendsWidget";
import { dateFromDateISOString } from "@/lib/utils";

const TrendsOvertime = memo(() => {
  const datavoidDef = useSelector(
    (state: RootState) => state.collectionPlan,
  );
  console.log(datavoidDef);

  return (
    <CollapsibleSection
      title="Trends overtime"
      description="A graphical representation of Google Trends data to track the popularity of your chosen keywords over time."
      wrapToCard
    >
      <div className="flex w-full items-center space-x-2">
        <GoogleTrendsWidget
          keyword={datavoidDef.keywords}
          geo=""
          startTime={dateFromDateISOString(datavoidDef.schedule.from)}
          endTime={dateFromDateISOString(datavoidDef.schedule.to)}
        />
      </div>
    </CollapsibleSection>
  );
});

export default TrendsOvertime;
