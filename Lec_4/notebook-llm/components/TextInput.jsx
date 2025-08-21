"use client";
import { useState } from "react";

export default function TextAndYouTubeInput() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const handleTextSubmit = async () => {
    await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    setText("");
  };

  const handleYouTubeSubmit = async () => {
    await fetch("/api/youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    setUrl("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 bg-gray-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col gap-6">
        
        {/* Text Input Section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-700">Enter Your Text</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type something meaningful..."
            className="w-full h-28 resize-none rounded-lg border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!text.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all shadow-md"
          >
            {text.trim() ? "Submit Text" : "Enter some text first"}
          </button>
        </div>

        <hr className="border-gray-200" />

        {/* YouTube URL Section */}
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-700">Upload YouTube URL</h2>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube link here..."
            className="w-full rounded-lg border border-gray-300 p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
          />
          <button
            onClick={handleYouTubeSubmit}
            disabled={!url.trim()}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all shadow-md"
          >
            {url.trim() ? "Upload YouTube" : "Enter a YouTube URL"}
          </button>
        </div>
      </div>
    </div>
  );
}
