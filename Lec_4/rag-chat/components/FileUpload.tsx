"use client";
import { useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e) => {
    e.preventDefault();
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
    <div className="flex flex-col gap-2 items-center">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        onClick={(e) => handleUpload(e)}
        className="bg-green-500 text-white p-2 rounded"
      >
        Upload
      </button>
    </div>
  );
}
