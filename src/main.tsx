import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Modal from "react-modal";
import { Provider } from "react-redux";
import App from "./App.tsx";
import "./assets/css/index.css";
import { store } from "./store/index.ts";

Modal.setAppElement("#root");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
