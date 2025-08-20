"use client";
import { useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ query: input }),
    });
    const data = await res.json();
    setMessages((prev) => [...prev, { role: "user", text: input }, { role: "assistant", text: data.answer }]);
    setInput("");
  };

  return (
    <div className="border rounded p-4 h-[80vh] flex flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <p className="p-2 m-1 rounded bg-gray-200 inline-block">{m.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          className="border flex-1 p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
        />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
