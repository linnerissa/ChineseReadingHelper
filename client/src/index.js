import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

async function callBackendAPI() {
  const response = await fetch("/news", {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }
  return body;
}

callBackendAPI().then((body) => {
  ReactDOM.render(
    <React.StrictMode>
      <App body={body} />
    </React.StrictMode>,
    document.getElementById("root")
  );
});

reportWebVitals();
