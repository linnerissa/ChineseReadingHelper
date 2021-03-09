const express = require("express");
const app = express();
const port = process.env.PORT || 5001;

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

var nodejieba = require("nodejieba");
app.get("/segmentation", (req, res) => {
  let phrase = req.query.phrase;
  segmentedPhrase = nodejieba.cut(phrase);
  console.log(segmentedPhrase);
  res.send({ express: segmentedPhrase });
});

var article;
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

    return text;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
// const rePunctuation = /\p{Han}(?<=\p{Block=CJK_Symbols_And_Punctuation})/;

var nodejieba = require("nodejieba");
const segmentBody = (text) => {
  segmentedBody = [];
  startIndices = [];
  phraseStartIndex = 0;
  cutRes = nodejieba.cut(text);
  for (index = 0; index < cutRes.length; ++index) {
    startIndices.push(phraseStartIndex);
    segmentedBody.push(cutRes[index]);
    // record the next start index of the characters
    phraseStartIndex += cutRes[index].length;
  }
  return {
    segments: segmentedBody,
    startIndices: startIndices,
    original: text,
  };
};

const applyPinYinToChunk = (segmentedChunk) => {
  const pinyin = require("pinyin");
  pronunciation = pinyin(segmentedChunk).join(" ");
  return pronunciation;
};

const applyTranslation = async (text) => {
  console.log("Translating");
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

const applyPinYin = async (segmentedBodyAndIndices) => {
  segmentedBody = segmentedBodyAndIndices["segments"];
  indices = segmentedBodyAndIndices["startIndices"];
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
    original: segmentedBodyAndIndices["original"],
  };
};

const replaceWithButtons = function (object) {
  const cheerio = require("cheerio");
  const $ = cheerio.load(article);
  segments = object["detailedSegments"];
  for (i = 0; i < segmentedBody.length; i++) {
    processed = segments[i];
    words = processed[0];
    pronunciation = processed[1];
    // todo nlin figure out jquery syntax.
    $("p").text(function () {
      return $(this).text().replace(words, pronunciation);
    });
    //.replaceWith(pronunciation)
  }
  return $.html();
};

app.get("/news", (req, res) => {
  getNewsSourceInChinese()
    .then(parseHTMLBody)
    .then(segmentBody)
    .then(applyPinYin)
    .then(replaceWithButtons)
    .then((data) =>
      res.send(
        data
        // webpageBody: data["detailedSegments"],
        // original: data["original"],
      )
    );
});

//function CiYu({ word }) {
// //   // const [hovered, sethovered] = React.useState(false);
// //   // const onMouseEnter = () => {
// //   //   sethovered(true);
// //   // };
// //   // const onMouseLeave = () => {
// //   //   sethovered(false);
// //   // };
// //   var pronunciation = PinYin(word);
// //   var definition = Translator(word, "en");

// //   // const [selected, setSelected] = React.useState(false);
// //   // return (
// //   //   <Tooltip title={pronunciation}>
// //   //     {/* <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
// //   //       {hovered ? "nullnullnull" : word}
// //   //     </div> */}
// //   //     <ToggleButton
// //   //       selected={selected}
// //   //       onChange={() => {
// //   //         setSelected(!selected);
// //   //       }}
// //   //     >
// //   //       {selected ? definition : word}
// //   //     </ToggleButton>
// //   //   </Tooltip>
// //   // );
// // }
