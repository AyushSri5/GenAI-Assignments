"use client";
import { useState } from "react";

export default function TextInput() {
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    setText("");
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text..."
        className="border rounded p-2"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}
