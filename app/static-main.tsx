import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import "./ipad-v2.css";
import Home from "./page";

const root = document.getElementById("root");

if (!root) throw new Error("Missing application root");

createRoot(root).render(
  <StrictMode>
    <Home />
  </StrictMode>,
);
