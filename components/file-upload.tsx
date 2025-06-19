'use client';

import { useFileInput } from "@/hooks/use-file-input";
import { Button } from "./ui/button";
import { Alert } from "./ui/alert";
import { useState, useEffect } from "react";

export function FileUpload() {
  const { fileInputRef, handleFileSelect, fileName, error, clearFile } = useFileInput({
    accept: "image/*",
    maxSize: 10 // 10MB max size
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (uploadSuccess) {
      timeoutId = setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [uploadSuccess]);

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      setUploadError("No file selected");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      
      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadSuccess(true);
      clearFile(); // Clear file after successful upload
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="secondary"
          disabled={uploading}
        >
          Choose Image
        </Button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          aria-label="Choose image file"
        />
        {fileName && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-sm text-muted-foreground truncate max-w-[150px]" title={fileName}>
              {fileName}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={clearFile}
              title="Clear selected file"
              disabled={uploading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        )}
        
        {fileName && !uploading && (
          <Button 
            onClick={handleUpload} 
            disabled={uploading}
          >
            Upload
          </Button>
        )}
        
        {uploading && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
            <span className="text-sm">Uploading...</span>
          </div>
        )}
      </div>
      
      {(error || uploadError) && (
        <Alert variant="destructive">
          {error || uploadError}
        </Alert>
      )}
      
      {uploadSuccess && (
        <Alert variant="default">
          Image uploaded successfully
        </Alert>
      )}
    </div>
  );
}
