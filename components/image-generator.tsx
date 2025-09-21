"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert } from "./ui/alert";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccess(false);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const result = await response.json();
      console.log("API response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Generation failed");
      }

      setSuccess(true);
      setPrompt(""); // Clear prompt after successful generation
      // refresh server components to show the new image
      router.refresh();
    } catch (error: any) {
      console.error("Generation error:", error);
      // Attempt to extract detailed error from API response if available
      let errorMsg = "Failed to generate image";
      if (error.message) {
        errorMsg = error.message;
      }
      setError(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="relative group">
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg blur-sm 
                        opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
          ></div>
          <Input
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={generating}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !generating && prompt.trim()) {
                handleGenerate();
              }
            }}
            className="relative bg-background/50 backdrop-blur-sm border-border/50 
                     focus:border-primary/50 focus:ring-2 focus:ring-primary/20 
                     transition-all duration-200 placeholder:text-muted-foreground/70"
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
                   transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25
                   disabled:opacity-50 disabled:transform-none disabled:shadow-none"
        >
          {generating ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-t-white border-r-white border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <span>Creating magic...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
              <span>Generate Image</span>
            </div>
          )}
        </Button>
      </div>

      {error && (
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
            <div className="ml-2">{error}</div>
          </Alert>
        </div>
      )}

      {success && (
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
              Image generated successfully! Check your gallery.
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}
