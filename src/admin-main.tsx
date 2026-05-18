import React from "react";
import ReactDOM from "react-dom/client";
import { AdminPortal } from "./components/AdminPortal";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AdminPortal />
  </React.StrictMode>,
);
