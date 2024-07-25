import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AppDispatch, RootState } from "@/model/store";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Header } from "../ui/header";
import { Badge } from "../ui/badge";
import { getTasks } from "@/model/slices/tasks";
import { ExternalLink } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { TaskInfo } from "@/model/types";
import { statusToBadgeVariant } from "@/lib/utils";

function Tasks() {
  const tasks = useSelector((state: RootState) => state.tasks);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getTasks());
  }, [dispatch]);

  return (
    <>
      <Header title={`Tasks`} />
      <div className="m-2 grow">
        <div className="flex flex-col">
          {tasks.tasks.map((task: TaskInfo) => (
            <Card key={task.id} className="my-2 p-2">
              <div className="flex flex-row items-center">
                <div className="flex grow flex-col gap-2">
                  <div>
                    <Label>Task: </Label> {task.id}
                  </div>
                  <div className="flex flex-row flex-wrap gap-4">
                    <div>
                      Google Search Crawling: &nbsp;
                      <Badge
                        variant={statusToBadgeVariant(
                          task.status_google_search_crawler,
                        )}
                      >
                        {task.status_google_search_crawler}
                      </Badge>
                    </div>
                    <div>
                      Content Fetcher: &nbsp;
                      <Badge
                        variant={statusToBadgeVariant(
                          task.status_content_fetcher,
                        )}
                      >
                        {task.status_content_fetcher}
                      </Badge>
                    </div>
                    <div>
                      Labeler: &nbsp;
                      <Badge
                        variant={statusToBadgeVariant(task.status_labeler)}
                      >
                        {task.status_labeler}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Link to={`/task/${task.id}`} className="m-2">
                  <Button size={"icon"}>
                    <ExternalLink />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}

export default Tasks;
