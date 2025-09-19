import React, { useState, useEffect, useRef } from "react";
import "./ChatWidget.css";

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [theme, setTheme] = useState("dark"); // 🌗 Theme state
  const [botTyping, setBotTyping] = useState(false);

  const chatBoxRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat, botTyping]);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported 😞");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setMessage(voiceText);
    };
    recognition.start();
  };

  const speak = (text) => {
    const utterance = new window.SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    setChat((prev) => [...prev, { sender: "You", text: message }]);
    setMessage("");
    setBotTyping(true);

    fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then((res) => res.json())
      .then((data) => {
        data.forEach((reply) => {
          if (reply.text) {
            setChat((prev) => [
              ...prev,
              { sender: "Crowdfund Assistant", text: reply.text },
            ]);
            speak(reply.text);
          }
        });
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => setBotTyping(false));
  };

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      if (e.target.closest(".chat-header")) {
        isDragging = true;
        offsetX = e.clientX - widget.getBoundingClientRect().left;
        offsetY = e.clientY - widget.getBoundingClientRect().top;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }
    };

    const onMouseMove = (e) => {
      if (isDragging) {
        widget.style.left = `${e.clientX - offsetX}px`;
        widget.style.top = `${e.clientY - offsetY}px`;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    widget.addEventListener("mousedown", onMouseDown);

    return () => widget.removeEventListener("mousedown", onMouseDown);
  }, []);

  // Theme switching button handler
  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div>
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {isOpen && (
        <div
          className={`chat-widget open ${theme}`}
          ref={widgetRef}
          style={{ position: "fixed", bottom: "90px", right: "20px" }}
        >
          <div className="chat-header">
            <span className="bot-avatar">🤖</span>
            <span>Crowdfund Assistant</span>
            <button className="theme-btn" onClick={handleThemeToggle}>
              {theme === "dark" ? "🌞" : "🌙"}
            </button>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          <div className="chat-box">
            {chat.map((c, i) => (
              <div
                key={i}
                className={c.sender === "You" ? "user-msg" : "bot-msg"}
              >
                <b>
                  {c.sender === "You" ? "You" : "Crowdfund Assistant"}:
                </b>{" "}
                {c.text}
              </div>
            ))}
            {botTyping && (
              <div className="bot-typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type or speak..."
            />
            <button onClick={startListening}>🎤</button>
            <button className="send-btn" onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
