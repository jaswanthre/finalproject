import React, { useState } from "react";
import "./ChatWidget.css";

function ChatWidget() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    setIsTyping(value.length > 0); // show dots while typing
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    // Add user message
    setChat((prev) => [...prev, { sender: "You", text: message }]);

    // Reset input + typing
    setMessage("");
    setIsTyping(false);

    // ✅ Send to backend (Flask/Rasa)
    fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
      .then((res) => res.json())
      .then((data) => {
        setChat((prev) => [...prev, { sender: "Bot", text: data.reply }]);
      })
      .catch((err) => console.error("Error:", err));
  };

  return (
    <div className="chat-widget">
      {/* Header */}
      <div className="chat-header">🤖 Crowd Fund Assistant</div>

      {/* Messages */}
      <div className="chat-box">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === "You" ? "user" : "bot"}`}
          >
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>

        {/* Typing dots while user is typing */}
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatWidget;
