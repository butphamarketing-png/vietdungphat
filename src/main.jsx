import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

function dismissLoader() {
  const el = document.getElementById("app-loader");
  if (!el) return;
  const hide = () => {
    el.classList.add("is-done");
    document.body.classList.remove("is-loading");
    window.setTimeout(() => el.remove(), 700);
  };
  const started = performance.now();
  const minMs = 1100;
  const go = () => {
    window.setTimeout(hide, Math.max(0, minMs - (performance.now() - started)));
  };
  if (document.readyState === "complete") go();
  else window.addEventListener("load", go, { once: true });
}

dismissLoader();
