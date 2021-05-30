const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.static(path.join(__dirname, "client", "build")));
app.use(express.static("public"));
app.get("/", (req, res) => {
  console.log("serving build");
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
app.get("/", (req, res) => {
  console.log("serving public");
  res.sendFile(path.join(__dirname, "client/public", "index.html"));
});

app.listen(port, () => console.log(`Listening on port ${port}`));

var nodejieba = require("nodejieba");

const getExampleSite = async () => {
  article = await getNewsSource(
    "http://www.xinhuanet.com/politics/2021-02/17/c_1127107606.htm"
  );
  return article;
};

const getNewsSource = async (xinHuaNetURL) => {
  const fetch = require("node-fetch");
  article = await fetch(xinHuaNetURL)
    .then((data) => data.text())
    .catch((error) => {
      console.log("Failed to get news source in chinese", error);
    });
  return article;
};

const parseHTMLBody = (htmlBody) => {
  const cheerio = require("cheerio");
  try {
    const $ = cheerio.load(htmlBody);
    const text = $.text($("p"));
    const title = $.text($("h1", "div.header.domPC"));
    return { title: title, parsed: text, original: htmlBody };
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
    title: object["title"],
  };
};

const applyPinYinToChunk = (segmentedChunk) => {
  const pinyin = require("pinyin");
  pronunciation = pinyin(segmentedChunk).join(" ");
  return pronunciation;
};

var fanyi = require("fanyi");
const applyTranslation = async (text, res, cb) => {
  fanyi(
    text,
    {
      iciba: false,
      youdao: true,
      dictionaryapi: false,
      say: false,
      color: false,
    },
    undefined,
    (data) => {
      cb(data, res);
    }
  );
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
  return {
    detailedSegments: segmentedBodyAndPinyin,
    original: object["original"],
    title: object["title"],
  };
};

app.get("/news", (req, res) => {
  getExampleSite()
    .then(parseHTMLBody)
    .then(segmentBody)
    .then(applyPinYin)
    .then((data) => res.send(data));
});

app.get("/article", (req, res) => {
  const url = req.query.url;
  console.log("getting hit at article:", url);
  getNewsSource(url) // figure out how to pass in this article
    .then(parseHTMLBody)
    .then(segmentBody)
    .then(applyPinYin)
    .then((data) => res.send(data));
});

app.get("/translate", (req, res) => {
  var text = req.query.text;
  applyTranslation(text, res, (result, res) => {
    res.send({ translatedText: result });
  });
});
