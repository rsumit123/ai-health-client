import React, { useState } from "react";
import "./SpeechComponent.css";

const SpeechComponent = () => {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);

  const startListening = () => {
    setListening(true);

    const recognition = new window.webkitSpeechRecognition();

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript; //getting text from webkit
      setText(speechToText);

      fetch(`${import.meta.env.VITE_APP_BACKEND_API}/api/process_speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: speechToText }),
      })
        .then((response) => response.json())
        .then((data) => {
          const synth = window.speechSynthesis;
          const utterThis = new SpeechSynthesisUtterance(data.text);
          synth.speak(utterThis);
        });
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <div className="speech-component">
      <button onClick={startListening}>
        {listening ? "Listening..." : "Speak"}
      </button>
      <p>{text}</p>
    </div>
  );
};

export default SpeechComponent;
