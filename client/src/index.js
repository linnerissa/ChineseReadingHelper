import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

async function callBackendAPI() {
  const response = await fetch("/news");
  const body = await response.json();

  if (response.status !== 200) {
    throw Error(body.message);
  }
  return body;
}

callBackendAPI().then(
  (body) => (document.getElementsByTagName("html")[0].innerHTML = body.original)
);
// callBackendAPI().then(replaceTextWithReactButtons);
// .then((body) => {
//   console.log(body);
//   ReactDOM.render(body, document.getElementsByClassName("article"));
// })
// .then((body) => {
//   document.getElementsByTagName("html")[0].innerHTML = body.original;
// });

// function replaceTextWithReactButtons(body) {
//   // body.original body.detailedSegments
//   const cheerio = require("cheerio");
//   console.log(h)
//   const $ = cheerio.load(body.original);
//   body.detailedSegments.forEach((item) => {
//     $("p").text(function () {
//       return $(this)
//         .text()
//         .replace(
//           item[0],
//           '<div class="article">\
//           <ToolTipButton\
//             class="wordbutton"\
//             word={item[0]}\
//             pronunciation={item[1]}\
//           />\
//         </div>'
//         );
//     });
//   });
//   console.log("hello");
//   return $.html();
// }

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
