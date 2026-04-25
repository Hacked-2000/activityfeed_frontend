import { BrowserRouter } from "react-router-dom";
import RenderRoute from "./routes/RenderRoute";
import "./assets/common.css";

function App() {
  return (
    <BrowserRouter>
      <RenderRoute />
    </BrowserRouter>
  );
}

export default App;
