import React, { useState, useEffect } from "react";
import "./SpeechComponent.css";

const SpeechComponent = () => {
  const [listening, setListening] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [processing, setProcessing] = useState(false);

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

  // Initial setup to get or set chatId and chats
  useEffect(() => {
    const storedChatId = sessionStorage.getItem("chatId");
    const storedChats = JSON.parse(sessionStorage.getItem("chats")) || [];
    
    if (storedChatId) {
      setChatId(storedChatId);
    } else {
      fetchChatId();
    }

    setChats(storedChats);
  }, []);

  const startListening = () => {
    if (!chatId) {
      console.error("Chat ID is not available.");
      return;
    }

    setListening(true);

    const recognition = new window.webkitSpeechRecognition();

    recognition.onresult = (event) => {
      setProcessing(true);
      const speechToText = event.results[0][0].transcript;

      fetch(`${import.meta.env.VITE_APP_BACKEND_API}/api/chats/${chatId}/converse/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ "user_text": speechToText }),
      })
        .then((response) => response.json())
        .then((data) => {
          
          const synth = window.speechSynthesis;
          const utterThis = new SpeechSynthesisUtterance(data.ai_text);
          synth.speak(utterThis);

          // Update chat history
          const newChats = [...chats, { user: speechToText, ai: data.ai_text }];
          setChats(newChats);
          sessionStorage.setItem("chats", JSON.stringify(newChats));
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
      <div className="chat-history">
        {chats.map((chat, index) => (
          <div key={index}>
            <div>User: {chat.user}</div>
            <br/>
            <div>AI: {chat.ai}</div>

            <br/>
          </div>
        ))}
      </div>
      <button onClick={startListening}>
        {listening ? "Listening..." : processing ? "Processing.." : "Speak"}
      </button>
      {/* <p>{text}</p> */}
    </div>
  );
};

export default SpeechComponent;
