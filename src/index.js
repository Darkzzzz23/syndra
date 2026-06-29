import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <PayPalScriptProvider options={{ 
          clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
          currency: "USD",
          intent: "capture"
        }}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PayPalScriptProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);