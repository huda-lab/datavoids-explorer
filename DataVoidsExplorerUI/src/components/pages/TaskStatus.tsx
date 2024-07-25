import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Label } from "@/components/ui/label";
import TaskSummary from "@/components/sections/TaskSummary";
import { useParams } from "react-router-dom";
import { getTaskInfo, setTaskId } from "@/model/slices/collection-status";
import { AppDispatch, RootState } from "@/model/store";
import { Card } from "../ui/card";
import { getTaskResults } from "@/model/slices/collection-status";
import { statusToBadgeVariant } from "@/lib/utils";
import CollectionResults from "../sections/CollectionResults";
import ManualLabeling from "../sections/ManualLabeling";
import { Header } from "../ui/header";
import { Badge } from "../ui/badge";
import { CollapsibleSection } from "../ui/collapsible-section";

function TaskStatus() {
  const statusGoogleSearchCrawler = useSelector(
    (state: RootState) => state.collectionStatus.statusGoogleSearchCrawler,
  );
  const statusContentFetcher = useSelector(
    (state: RootState) => state.collectionStatus.statusContentFetcher,
  );
  const statusContentLabeler = useSelector(
    (state: RootState) => state.collectionStatus.statusContentLabeler,
  );
  const errorMessage = useSelector(
    (state: RootState) => state.collectionStatus.errorMessage,
  );
  const { taskId } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!taskId) return;
    dispatch(setTaskId(taskId));
    dispatch(getTaskInfo(taskId));
    dispatch(getTaskResults(taskId));
    // const refreshInterval = setInterval(() => {
    //   dispatch(getTaskInfo(taskId));
    //   dispatch(getTaskResults(taskId));
    // }, 10000);
    return () => clearInterval(refreshInterval);
  }, [taskId, dispatch]);

  return (
    <>
      <Header title={`Collection Task Info`} />
      <Card className="m-4 flex flex-row p-4">
        <div className="grow">
          <div>
            <Label>TaskID:</Label> {taskId}
          </div>

          {errorMessage ? (
            <div className="flex flex-row flex-wrap items-center gap-4">
              <Label>Error:</Label><div className="text-red-400">{errorMessage}</div>
            </div>
          ) : (
            <div className="flex flex-row flex-wrap gap-4">
              <div>
                Google Search Crawling: &nbsp;
                <Badge
                  variant={statusToBadgeVariant(statusGoogleSearchCrawler)}
                >
                  {statusGoogleSearchCrawler}
                </Badge>
              </div>
              <div>
                Content Fetcher: &nbsp;
                <Badge variant={statusToBadgeVariant(statusContentFetcher)}>
                  {statusContentFetcher}
                </Badge>
              </div>
              <div>
                Labeler: &nbsp;
                <Badge variant={statusToBadgeVariant(statusContentLabeler)}>
                  {statusContentLabeler}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </Card>
      {errorMessage === null && (
        <>
          <CollapsibleSection title="Task Summary" wrapToCard>
            <TaskSummary />
          </CollapsibleSection>
          <CollapsibleSection title="Manual Labeling" wrapToCard>
            <ManualLabeling taskId={taskId} />
          </CollapsibleSection>
          <CollapsibleSection title="Results Overview" wrapToCard>
            <CollectionResults />
          </CollapsibleSection>
        </>
      )}
    </>
  );
}

export default TaskStatus;
