import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import CRMApp from "./CRMApp";
import { AuthProvider } from "./context/AuthContext";
import "./crm.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CRMApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);