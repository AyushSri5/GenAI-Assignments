'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Youtube, Image, Download, Upload, X, FileImage } from 'lucide-react';

const ThumbnailGenerator = () => {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content, isUser = false, isSystem = false, hasFiles = false, files = [], generatedImage = null) => {
    const newMessage = {
      id: Date.now(),
      content,
      isUser,
      isSystem,
      hasFiles,
      files,
      generatedImage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentInput.trim() && uploadedFiles.length === 0) return;
    
    setIsLoading(true);
    let uploadedImageUrls = [];

    try {
      // Upload files to ImageKit if any
      if (uploadedFiles.length > 0) {
        setIsUploading(true);
        uploadedImageUrls = await uploadFilesToImageKit(uploadedFiles);
        setIsUploading(false);
      }

      const messageContent = currentInput || "I've uploaded some reference images for my thumbnail";
      addMessage(messageContent, true, false, uploadedFiles.length > 0, uploadedFiles);
      
      // Prepare API request body
      const requestBody = {
        query: currentInput,
        image_url: uploadedImageUrls,
        timestamp: new Date().toISOString()
      };

      // Log the request body (you can send this to your API)
      console.log('API Request Body:', requestBody);
      
      // Call your thumbnail generation API
      const apiResponse = await sendToAPI(requestBody);
      
      // Check if API returned thumbnail URL
      if (apiResponse?.message?.url) {
        const thumbnailData = {
          url: apiResponse.message.url,
          fileName: apiResponse.message.file_name || 'thumbnail.jpeg',
          contentType: apiResponse.message.content_type || 'image/jpeg',
          fileSize: apiResponse.message.file_size
        };
        
        addMessage(
          "🎉 Your custom YouTube thumbnail is ready! Click the image to view it full-size or use the download button to save it.",
          false,
          true,
          false,
          [],
          thumbnailData
        );
      } else {
        addMessage("I've generated your thumbnail concept! Here's what I recommend for your video.", false, true);
      }
      
      setCurrentInput('');
      setUploadedFiles([]);

    } catch (error) {
      console.error('Error processing request:', error);
      setIsLoading(false);
      setIsUploading(false);
      addMessage("Sorry, there was an error processing your request. Please try again.", false, true);
    } finally {
      setIsLoading(false);
    }
  };

  // File upload handlers
  const handleFileUpload = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    const fileObjects = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file)
    }));

    setUploadedFiles(prev => [...prev, ...fileObjects]);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ImageKit upload function
  const uploadFilesToImageKit = async (files) => {
    const IMAGEKIT_PUBLIC_KEY = process.env.IMAGE_KIT_PUBLIC_KEY; // Replace with your ImageKit public key
    const IMAGEKIT_UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload';

    const uploadPromises = files.map(async (fileObj) => {
      const formData = new FormData();
      formData.append('file', fileObj.file);
      formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
      formData.append('fileName', fileObj.name);

      try {
        const response = await fetch(IMAGEKIT_UPLOAD_URL, {
          method: 'POST',
          headers: {
            Authorization: process.env.AUTH_TOKEN 
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return {
          originalName: fileObj.name,
          imageKitUrl: result.url,
          fileId: result.fileId,
          filePath: result.filePath,
          width: result.width,
          height: result.height,
          size: result.size
        };
      } catch (error) {
        console.error(`Error uploading ${fileObj.name}:`, error);
        throw error;
      }
    });

    return Promise.all(uploadPromises);
  };

  // Send data to your API
  const sendToAPI = async (requestBody) => {
    const API_ENDPOINT = '/api/chat'; // Replace with your API endpoint
    
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  };

// Download image function
  const downloadImage = async (imageUrl, fileName = 'thumbnail.jpeg') => {
  console.log("Downloading image:", imageUrl, fileName);

  try {
    // ✅ Try normal fetch first (no `no-cors`!)
    const response = await fetch(imageUrl, {
      method: "GET",
      headers: {
        // Add auth headers if needed
        // Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // ✅ Convert to Blob
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // ✅ Create a temporary <a> to download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    // ✅ Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log("Download finished ✅");
  } catch (error) {
    console.error("Direct download failed:", error);

    // 🔁 Fallback: just open in a new tab
    const link = document.createElement("a");
    link.href = imageUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Could not auto-download due to CORS. Opened in new tab instead.");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <Youtube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Thumbnail Generator</h1>
              <p className="text-gray-400 text-sm">AI-powered YouTube thumbnail creator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-6 py-8 min-h-[calc(100vh-140px)]">
        <div className="flex flex-col h-full">
          
          {/* Welcome Screen */}
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-2xl mx-auto">
                <div className="mb-8 relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                  Create Stunning YouTube Thumbnails
                </h2>
                
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Tell me about your video, upload reference images, and I'll create the perfect thumbnail that gets clicks and stands out from the crowd.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                    <Image className="w-8 h-8 text-red-400 mb-2" />
                    <h3 className="font-semibold mb-1">AI-Generated</h3>
                    <p className="text-sm text-gray-400">Custom thumbnails made just for your content</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                    <Upload className="w-8 h-8 text-pink-400 mb-2" />
                    <h3 className="font-semibold mb-1">Upload Images</h3>
                    <p className="text-sm text-gray-400">Add reference images to guide the design</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                    <Download className="w-8 h-8 text-blue-400 mb-2" />
                    <h3 className="font-semibold mb-1">High Quality</h3>
                    <p className="text-sm text-gray-400">Download in perfect YouTube dimensions</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="flex-1 space-y-6 mb-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}
                >
                  <div className={`max-w-2xl px-6 py-4 rounded-2xl ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                      : message.isSystem
                      ? 'bg-blue-500/10 border border-blue-500/20 text-blue-100'
                      : 'bg-gray-800/50 border border-gray-700/50 text-gray-100'
                  }`}>
                    {!message.isUser && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">AI Assistant</span>
                      </div>
                    )}
                    <p className="leading-relaxed">{message.content}</p>
                    
                    {/* Generated Thumbnail Display */}
                    {message.generatedImage && (
                      <div className="mt-4">
                        <div className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-700/50 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300">
                            <img 
                              src={message.generatedImage.url} 
                              alt="Generated YouTube Thumbnail"
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                              onClick={() => window.open(message.generatedImage.url, '_blank')}
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                              <div className="text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                                Click to view full size
                              </div>
                            </div>
                          </div>
                          
                          {/* Download Button */}
                          <div className="mt-3 flex items-center gap-2 relative z-10">
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("Download clicked ✅");
      downloadImage(message.generatedImage.url, message.generatedImage.fileName);
    }}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all duration-200 hover:scale-105"
  >
    <Download className="w-4 h-4" />
    <span className="font-medium">Download Thumbnail</span>
  </button>
</div>
                          
                          {/* Thumbnail Info */}
                          <div className="mt-2 text-xs text-gray-400 bg-gray-800/30 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <span>📐 Optimized for YouTube (1280×720)</span>
                              <span>✨ Ready to upload</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* File attachments display */}
                    {message.hasFiles && message.files && message.files.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {message.files.map((file) => (
                          <div key={file.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-700/50 border border-gray-600/50">
                              <img 
                                src={file.preview} 
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-white text-center px-2 truncate">
                                {file.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-500">
                  <div className="max-w-2xl px-6 py-4 rounded-2xl bg-gray-800/50 border border-gray-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium text-red-400">AI Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                      </div>
                      <span className="text-gray-400 text-sm">
                        {isUploading ? 'Uploading images...' : 'Generating your thumbnail...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* File Upload Area */}
          {uploadedFiles.length > 0 && (
            <div className="mb-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileImage className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Uploaded Files ({uploadedFiles.length})</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-700/50 border border-gray-600/50">
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10 shadow-lg"
                        title="Remove file"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                        {file.name}
                      </div>
                      <div className="absolute top-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="relative">
            {/* Drag and Drop Overlay */}
            {isDragOver && (
              <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-400 rounded-2xl flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-blue-400 font-medium">Drop your images here</p>
                </div>
              </div>
            )}
            
            <div 
              className="flex items-end gap-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-2xl backdrop-blur-sm transition-colors duration-200"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex-1">
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  placeholder={messages.length === 0 ? "Describe your YouTube video or upload reference images..." : "Ask for changes or generate a new thumbnail..."}
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none max-h-32 min-h-[24px]"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
              </div>
              
              {/* File Upload Button */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 bg-gray-700/50 hover:bg-gray-700/70 rounded-xl transition-all duration-200 hover:scale-105 group"
                  title="Upload images"
                >
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </button>
                
                <button
                  type="submit"
                  disabled={(!currentInput.trim() && uploadedFiles.length === 0) || isLoading || isUploading}
                  className="p-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 hover:scale-105"
                  title={isUploading ? 'Uploading files...' : 'Send message'}
                >
                  {isUploading ? (
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
            
            {/* File Upload Help Text */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              <span>Drop images here or click </span>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                browse
              </button>
              <span> • Max 10MB per file • PNG, JPG, WEBP supported</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailGenerator;