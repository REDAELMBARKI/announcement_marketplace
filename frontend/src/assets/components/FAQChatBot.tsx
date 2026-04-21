import React, { useState } from "react";
import "../../css/faq.css";

export default function FAQChatBot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello I'm Chati! Ask me anything about LetUsDonate.uk",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/ask-faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg }),
      });

      if (res.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Please wait about 1 minute before asking again.",
          },
        ]);

        setLoading(true);
        setTimeout(() => setLoading(false), 60000);
        return;
      }

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `Error: ${res.status} ${res.statusText}`,
          },
        ]);
        return;
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.answer || "Sorry, no response received." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "There was a problem connecting to the AI. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cb-frame">
      {/* Send mssg to chat bot */}
      <div className="cb-messages">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`cb-msg ${msg.sender === "user" ? "cb-user" : "cb-bot"}`}
          >
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="cb-msg cb-bot">
            <span className="typing">Thinking...</span>
          </div>
        )}
      </div>

      {/* User input */}
      <div className="cb-input-bar">
        <input
          className="cb-input"
          type="text"
          placeholder="Ask a question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button className="cb-send" onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
