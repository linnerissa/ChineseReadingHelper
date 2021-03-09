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

const getNewsSourceInChinese = function () {
  console.log("GetNewsSource");
  const fetch = require("node-fetch");
  return fetch("http://www.xinhuanet.com/politics/2021-02/17/c_1127107606.htm")
    .then((data) => data.text())
    .catch((error) => {
      console.log("Failed to get news source in chinese", error);
    });
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
  return { segmentedBody, startIndices };
};

const applyPinYinToChunk = (segmentedChunk) => {
  const pinyin = require("pinyin");
  pronunciation = pinyin(segmentedChunk).join(" ");
  return pronunciation;
};

const applyTranslationToBody = async (textBody) => {
  console.log("Translating");
  const fetch = require("node-fetch");
  const res = await fetch("http://localhost:5000/translate", {
    method: "POST",
    body: JSON.stringify({
      q: textBody,
      source: "zh",
      target: "en",
    }),
    headers: { "Content-Type": "application/json" },
  }).catch((err) => console.log("failed to translate %s", err));
  const response = await res.json();
  return response;
};

const applyPinYinAndTranslation = async (segmentedBodyAndIndices) => {
  segmentedBody = segmentedBodyAndIndices["segmentedBody"];
  indices = segmentedBodyAndIndices["startIndices"];
  //translation = await applyTranslationToBody(segmentedBody);
  segmentedBodyAndPinyin = new Array(segmentedBody.length);
  for (i = 0; i < segmentedBody.length; i++) {
    chunk = segmentedBody[i];
    segmentedBodyAndPinyin[i] = [
      chunk,
      applyPinYinToChunk(chunk),
      indices[i],
      // translation["translatedText"][i],
    ];
  }
  console.log("returning segemented body and pinyin");
  return segmentedBodyAndPinyin;
};

app.get("/news", (req, res) => {
  getNewsSourceInChinese()
    .then(parseHTMLBody)
    .then(segmentBody)
    .then(applyPinYinAndTranslation)
    .then((data) => res.send({ webpageBody: data }));
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
