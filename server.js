const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")));
app.use(express.static("public"));
// this line errors...
// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, "client", "build", "index.html"));
// });
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/public", "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));

var nodejieba = require("nodejieba");

const getNewsSourceInChinese = async () => {
  console.log("GetNewsSource");
  const fetch = require("node-fetch");
  article = await fetch(
    "http://www.xinhuanet.com/politics/2021-02/17/c_1127107606.htm"
  )
    .then((data) => data.text())
    .catch((error) => {
      console.log("Failed to get news source in chinese", error);
    });
  return article;
};

const parseHTMLBody = (htmlBody) => {
  console.log("ParseHTMLBody");
  const cheerio = require("cheerio");
  try {
    const $ = cheerio.load(htmlBody);
    const text = $.text($("p"));

    return { parsed: text, original: htmlBody };
  } catch (e) {
    console.log(e);
    throw e;
  }
};

var nodejieba = require("nodejieba");
const segmentBody = (object) => {
  text = object["parsed"];
  segmentedBody = [];
  startIndices = [];
  phraseStartIndex = 0;
  cutRes = nodejieba.cut(text);
  for (index = 0; index < cutRes.length; ++index) {
    startIndices.push(phraseStartIndex);
    segmentedBody.push(cutRes[index]);
    phraseStartIndex += cutRes[index].length;
  }
  return {
    segments: segmentedBody,
    startIndices: startIndices,
    original: object["original"],
  };
};

const applyPinYinToChunk = (segmentedChunk) => {
  const pinyin = require("pinyin");
  pronunciation = pinyin(segmentedChunk).join(" ");
  return pronunciation;
};

const applyTranslation = async (text) => {
  console.log("Translating");
  console.log(text);
  const fetch = require("node-fetch");
  const res = await fetch("http://localhost:5000/translate", {
    method: "POST",
    body: JSON.stringify({
      q: text,
      source: "zh",
      target: "en",
    }),
    headers: { "Content-Type": "application/json" },
  }).catch((err) => console.log("failed to translate %s", err));
  const response = await res.json();
  return response;
};

const applyPinYin = async (object) => {
  segmentedBody = object["segments"];
  indices = object["startIndices"];
  segmentedBodyAndPinyin = new Array(segmentedBody.length);
  for (i = 0; i < segmentedBody.length; i++) {
    chunk = segmentedBody[i];
    startIndex = indices[i];
    segmentedBodyAndPinyin[i] = [
      chunk,
      applyPinYinToChunk(chunk),
      [startIndex, startIndex + chunk.length],
    ];
  }
  console.log("returning segemented body and pinyin");
  return {
    detailedSegments: segmentedBodyAndPinyin,
    original: object["original"],
  };
};

app.get("/news", (req, res) => {
  getNewsSourceInChinese()
    .then(parseHTMLBody)
    .then(segmentBody)
    .then(applyPinYin)
    .then((data) => res.send(data));
});

app.get("/translate", (req, res) => {
  var text = req.query.text;
  applyTranslation(text).then((data) => {
    res.send(data);
    console.log(data);
  });
});
