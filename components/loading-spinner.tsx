"use client";

import { ImageStreamStatus } from "@/lib/utils";

export function LoadingSpinner({ status }: { status?: ImageStreamStatus }) {
  return (
    <div className="absolute h-full w-full bg-background/80 backdrop-blur-sm z-10 top-0 flex items-start justify-center">
      <div className="flex flex-col items-center space-y-6 pt-16">
        <div className="relative">
          {/* Main spinner */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary border-r-primary" />
          
          {/* Inner pulse */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
          
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 blur-sm animate-pulse" />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground animate-pulse">
            {status?.regular ? "Finding exact matches" : "Searching with AI"}
          </p>
          <p className="text-sm text-muted-foreground">
            {status
              ? status?.regular
                ? "Looking for direct image matches..."
                : "Using semantic understanding to find similar content..."
              : "Processing your search..."}
          </p>
        </div>
        
        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
