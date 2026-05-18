import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  AuthProvider,
} from "@/contexts/AuthContext";

const queryClient = new QueryClient();
const theme = localStorage.getItem("theme") || "light";

document.documentElement.classList.add(theme);

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>

    <QueryClientProvider client={queryClient}>

      <AuthProvider>

        <App />

      </AuthProvider>

    </QueryClientProvider>

  </React.StrictMode>
);