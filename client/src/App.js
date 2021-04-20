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
      })
      .catch((err) => console.log(err));
  }
  // Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
  callBackendAPI = async () => {
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
  };

  render() {
    return (
      <div class="article">
        {this.state.words.map((item) => (
          <ToolTipButton
            class="wordbutton"
            word={item[0]}
            pronunciation={item[1]}
          />
        ))}
      </div>
    );
  }
}

async function callTranslationAPI(toTranslateText) {
  const response = await fetch("/translate?text=" + toTranslateText, {
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
