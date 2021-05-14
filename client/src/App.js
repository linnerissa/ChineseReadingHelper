import React, { Component } from "react";
import "./App.css";
import Tooltip from "@material-ui/core/Tooltip";
import ToggleButton from "@material-ui/lab/ToggleButton";
import fetch from "node-fetch";

class App extends Component {
  render() {
    return (
      <div>
        <h1>{this.props.body.title}</h1>
        <div className="article">
          {this.props.body.detailedSegments.map((item) => (
            <ToolTipButton
              className="wordbutton"
              word={item[0]}
              pronunciation={item[1]}
              key={item[2]}
            />
          ))}
        </div>
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

function format(definition) {
  return definition.replace(/\W/g, "");
}

function ToolTipButton({ word, pronunciation }) {
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
        value={word}
        onChange={() => {
          if (translation === "") {
            callTranslationAPI(word).then((res) => {
              if (
                res &&
                res.translatedText &&
                res.translatedText.basic &&
                res.translatedText.basic.explains &&
                res.translatedText.basic.explains.length > 0
              )
                setTranslation(format(res.translatedText.basic.explains[0]));
            });
          }
          setSelected(!selected);
        }}
      >
        {selected ? translation : word}
      </ToggleButton>
    </Tooltip>
  );
}

export default App;
