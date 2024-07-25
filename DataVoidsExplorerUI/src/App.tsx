import { Provider } from "react-redux";
import { store } from "@/model/store";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskSubmission from "@/components/pages/TaskSubmission";
import TaskStatus from "@/components/pages/TaskStatus";
import Tasks from "./components/pages/Tasks";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" Component={TaskSubmission} />
          <Route path="/task/:taskId" Component={TaskStatus} />
          <Route path="/tasks" Component={Tasks} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
