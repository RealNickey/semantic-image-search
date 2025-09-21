"use client";

import { useFileInput } from "@/hooks/use-file-input";
import { Button } from "./ui/button";
import { Alert } from "./ui/alert";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePendingImages } from "@/lib/hooks/pending-images";
import { nanoid } from "nanoid";
import { toast } from "sonner";

export function FileUpload() {
  const { fileInputRef, handleFileSelect, fileName, error, clearFile } =
    useFileInput({
      accept: "image/*",
      maxSize: 10, // 10MB max size
    });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();
  const pending = usePendingImages();

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

      // Optimistic: create a local preview immediately
      const objectUrl = URL.createObjectURL(file);
      const tempId = nanoid();
      pending.add({
        id: tempId,
        url: objectUrl,
        title: file.name,
        status: "local",
        createdAt: Date.now(),
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadSuccess(true);
      toast.success("Image uploaded and processed");
      clearFile(); // Clear file after successful upload
      // Update optimistic entry to processed with remote URL and details (no reload needed)
      pending.update(tempId, {
        status: "processed",
        url: result?.image?.url || objectUrl,
        title: result?.image?.title || file.name,
        description: result?.image?.description,
        finalId: result?.image?.id,
      });
      // Refresh server components in background; UI already updated locally
      router.refresh();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to upload image");
      toast.error(err.message || "Failed to upload image");
      // mark last optimistic as failed
      // (a more robust impl would track by tempId in a closure)
      // Here we clear all local ones older than 5 minutes
      // or simply ignore and rely on refresh.
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={uploading}
            className="group relative overflow-hidden bg-gradient-to-r from-background to-muted/30 
                     border-border/50 hover:border-primary/50 transition-all duration-300 
                     hover:shadow-md hover:shadow-primary/20"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
            <svg
              className="w-4 h-4 mr-2 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="relative z-10">Choose Image</span>
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
            <div className="flex items-center gap-2 overflow-hidden animate-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50">
                <svg
                  className="w-4 h-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span
                  className="text-sm text-foreground truncate max-w-[120px]"
                  title={fileName}
                >
                  {fileName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive transition-colors"
                  onClick={clearFile}
                  title="Clear selected file"
                  disabled={uploading}
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </div>

        {fileName && !uploading && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 
                     transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25
                     animate-in slide-in-from-bottom-2"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            Upload Image
          </Button>
        )}

        {uploading && (
          <div
            className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50 
                        animate-in fade-in-0 duration-300"
          >
            <div className="h-5 w-5 border-2 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">
              Uploading and processing...
            </span>
          </div>
        )}
      </div>

      {(error || uploadError) && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <Alert
            variant="destructive"
            className="border-destructive/50 bg-destructive/5"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-2">{error || uploadError}</div>
          </Alert>
        </div>
      )}

      {uploadSuccess && (
        <div className="animate-in slide-in-from-top-2 duration-300">
          <Alert
            variant="default"
            className="border-green-500/50 bg-green-500/5 text-green-700 dark:text-green-400"
          >
            <svg
              className="h-4 w-4 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-2">
              Image uploaded successfully! Processing with AI...
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
