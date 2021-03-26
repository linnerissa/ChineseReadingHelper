import React, { Component } from "react";
import "./App.css";
import Tooltip from "@material-ui/core/Tooltip";
import ToggleButton from "@material-ui/lab/ToggleButton";
import fetch from "node-fetch";

class App extends Component {
  state = {
    data: null,
    words: [],
  };

  componentDidMount() {
    // Call our fetch function below once the component mounts
    this.callBackendAPI()
      .then((res) => {
        console.log(res);
        this.setState({ data: res.original, words: res.detailedSegments });
        this.replaceMainBody();
      })
      .catch((err) => console.log(err));
  }
  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
    const response = await fetch("/news");
    const body = await response.json();

    if (response.status !== 200) {
      throw Error(body.message);
    }
    return body;
  };

  render() {
    return <div dangerouslySetInnerHTML={{ __html: this.state.data }} />;
    // return (
    //   <div class="article">
    //     {this.state.words.map((item) => (
    //       <ToolTipButton
    //         class="wordbutton"
    //         word={item[0]}
    //         pronunciation={item[1]}
    //       />
    //     ))}
    //   </div>
    // );
  }

  replaceMainBody() {
    const cheerio = require("cheerio");
    const $ = cheerio.load(this.state.data);
    this.state.words.forEach((item) => {
      //console.log(item);
      // $("p").text(function () {
      //   return $(this)
      //     .text()
      //     .replace(
      //       item[0],
      //       '<div class="article">\
      //       <ToolTipButton\
      //         class="wordbutton"\
      //         word={item[0]}\
      //         pronunciation={item[1]}\
      //       />\
      //     </div>'
      //     );
      // });
      $("p").replaceWith();
    });
    this.setState({ data: $.html() });
  }
}

async function callTranslationAPI(toTranslateText) {
  // var url = new URL("/translate");
  // url.searchParams.append("text", toTranslateText);
  const response = await fetch("/translate?text=" + toTranslateText);
  const body = await response.json();
  if (response.status !== 200) {
    throw Error(body.message);
  }
  return body;
}

function ToolTipButton({ onSelected, word, pronunciation, definition }) {
  const [selected, setSelected] = React.useState(false);
  const [translation, setTranslation] = React.useState("");
  if (pronunciation === word || pronunciation === "") {
    return word;
  }
  return (
    <Tooltip title={pronunciation}>
      <ToggleButton
        size="small"
        selected={selected}
        translation={translation}
        onChange={() => {
          if (translation === "") {
            callTranslationAPI(word).then((res) => {
              setTranslation(res["translatedText"]);
            });
          }
          setSelected(!selected);
        }}
      >
        {/* selected should get definition of word from server */}
        {selected ? translation : word}
      </ToggleButton>
    </Tooltip>
  );
}

export default App;
