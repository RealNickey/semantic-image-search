"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert } from "./ui/alert";
import { useState } from "react";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
      <div className="space-y-2">
        <Input
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={generating}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !generating) {
              handleGenerate();
            }
          }}
        />
        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="w-full"
        >
          {generating ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Generating...</span>
            </div>
          ) : (
            "Generate Image"
          )}
        </Button>
      </div>

      {error && <Alert variant="destructive">{error}</Alert>}

      {success && <Alert variant="default">Image generated successfully</Alert>}
    </div>
  );
}
