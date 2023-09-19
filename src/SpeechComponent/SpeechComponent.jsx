import React, { useState, useEffect } from "react";
import "./SpeechComponent.css";

const SpeechComponent = () => {
  const [text, setText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [chatId, setChatId] = useState(null);

  // Function to fetch chatId from API
  const fetchChatId = () => {
    fetch(`${import.meta.env.VITE_APP_BACKEND_API}/api/chats/`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((data) => {
        setChatId(data.id);
        sessionStorage.setItem("chatId", data.id);
      })
      .catch((error) => {
        console.error("Error fetching chat_id:", error);
      });
  };

  // Initial setup to get or set chatId
  useEffect(() => {
    const storedChatId = sessionStorage.getItem("chatId");
    if (storedChatId) {
      setChatId(storedChatId);
    } else {
      fetchChatId();
    }
  }, []);


  const startListening = () => {

    if (!chatId) {
      console.error("Chat ID is not available.");
      return;
    }

    setListening(true);

    const recognition = new window.webkitSpeechRecognition();

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript; //getting text from webkit
      setText(speechToText);

      setProcessing(true);

      fetch(`${import.meta.env.VITE_APP_BACKEND_API}/api/chats/${chatId}/converse/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "user_text": speechToText }),
      })
        .then((response) => response.json())
        .then((data) => {
          setAiResponse(data.ai_text);
          const synth = window.speechSynthesis;
          const utterThis = new SpeechSynthesisUtterance(data.ai_text);
          synth.speak(utterThis);

          setProcessing(false);

          
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
        {listening ? "Listening..." : processing ? "Processing..." : "Speak"}
      </button>
      {aiResponse.length > 0 ? <p>{aiResponse}</p>: null}
      
    </div>
  );
};

export default SpeechComponent;
