"use client";

import { DBImage } from "@/lib/db/schema";
import Image from "next/image";
import { MatchBadge } from "./match-badge";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Download, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function ImageCard({
  image,
  similarity,
}: {
  image: DBImage;
  similarity?: number;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDownload = async () => {
    try {
      const res = await fetch(image.path, { mode: "cors" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeTitle = image.title.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 40);
      a.href = url;
      a.download = `${safeTitle || "image"}-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to download image. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (
      !confirm(
        `Are you sure you want to delete "${image.title}"? This action cannot be undone.`
      )
    )
      return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/delete-image?id=${image.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        router.refresh();
      } else {
        const error = await response.json();
        alert(`Failed to delete image: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      alert("Failed to delete image. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      className="group relative overflow-hidden rounded-xl border-border/50 bg-card/50 backdrop-blur-sm 
                   shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 
                   transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></div>

      {/* Three dots menu in top right */}
      <div
        className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 
                    transform translate-x-2 group-hover:translate-x-0"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="bg-black/60 hover:bg-black/80 text-white rounded-full p-2 
                             transition-all duration-200 backdrop-blur-sm border border-white/20
                             hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleDownload}
              className="focus:bg-muted/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 
                       focus:bg-red-50 dark:focus:bg-red-950 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Image container */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={image.path}
          alt={image.title}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Overlay with content */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out
                      flex flex-col justify-end p-6 text-white"
        >
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
            <h3 className="text-xl font-bold mb-2 line-clamp-2">
              {image.title}
            </h3>
            <p className="text-sm text-white/90 line-clamp-3 mb-3">
              {image.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-white/70">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>AI Generated Metadata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similarity badge */}
      {similarity && (
        <div
          className="absolute bottom-3 left-3 z-20 transform translate-y-2 opacity-0 
                      group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-200"
        >
          <MatchBadge
            type={similarity === 1 ? "direct" : "semantic"}
            similarity={similarity}
          />
        </div>
      )}

      {/* Animated border */}
      <div
        className="absolute inset-0 rounded-xl border border-transparent bg-gradient-to-r 
                    from-primary/20 via-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(45deg, transparent 30%, rgba(var(--primary) / 0.1), transparent 70%)",
          backgroundSize: "200% 200%",
          animation: "gradient-shift 3s ease infinite",
        }}
      ></div>
    </Card>
  );
}
