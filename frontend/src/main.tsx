
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "./config/youtube";

  createRoot(document.getElementById("root")!).render(<App />);
  