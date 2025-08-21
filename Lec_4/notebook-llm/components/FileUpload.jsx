"use client";
import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    setFile(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 border border-gray-200 flex flex-col items-center gap-4">
        
        {/* Heading */}
        <h2 className="text-xl font-semibold text-gray-700">Upload Your File</h2>

        {/* File Input */}
        <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 text-gray-700 rounded-lg shadow-inner cursor-pointer hover:bg-gray-100 transition">
          <span className="text-sm">Choose a file</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <p className="mt-2 text-sm text-green-600 font-medium truncate max-w-[90%]">
              {file.name}
            </p>
          )}
        </label>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all shadow-md"
        >
          {file ? "Upload File" : "Select a File First"}
        </button>
      </div>
    </div>
  );
}
