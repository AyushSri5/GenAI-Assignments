"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [persona, setPersona] = useState("hitesh");
  const [messages, setMessages] = useState<{ [key: string]: { sender: string; text: string }[] }>({ hitesh: [], piyush: [] });
  const [input, setInput] = useState("");
  const [typingMessage, setTypingMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => ({
      ...prev,
      [persona]: [...prev[persona], { sender: "user", text: input }]
    }));

    const userMessage = input;
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ persona, message: userMessage })
    });

    const data = await res.json();

    // Typing animation
    let index = 0;
    setTypingMessage("");
    const interval = setInterval(() => {
      if (index < data.text.length) {
        setTypingMessage((prev) => prev + data.text[index]);
        index++;
      } else {
        clearInterval(interval);
        setMessages((prev) => ({
          ...prev,
          [persona]: [...prev[persona], { sender: "ai", text: data.text as string }]
        }));
        setTypingMessage("");
      }
    }, 30);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMessage, persona]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-center gap-4">
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${persona === "hitesh" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          onClick={() => setPersona("hitesh")}
        >
          Hitesh
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold ${persona === "piyush" ? "bg-green-500 text-white" : "bg-gray-200"}`}
          onClick={() => setPersona("piyush")}
        >
          Piyush
        </button>
      </header>

      {/* Chat window */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages[persona].map((msg, i) => (
          <div
            key={i}
            className={`max-w-[70%] p-3 rounded-lg shadow ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-white text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {typingMessage && (
          <div className="bg-white text-gray-800 p-3 rounded-lg shadow max-w-[70%]">
            {typingMessage}
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input box */}
      <footer className="p-4 bg-white shadow flex gap-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${persona === "hitesh" ? "Hitesh" : "Piyush"}...`}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Send
        </button>
      </footer>
    </div>
  );
}
