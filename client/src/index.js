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

callBackendAPI()
  .then(
    (body) =>
      (document.getElementsByTagName("html")[0].innerHTML = body.original)
  )
  .then((body) => {
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementsByClassName("main-left left")[0]
    );
  });

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
