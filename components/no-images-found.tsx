export function NoImagesFound({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-16">
      <div className="text-center space-y-6 max-w-md">
        {/* Animated icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted/30 rounded-full animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full">
            <svg 
              className="w-12 h-12 text-muted-foreground animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ animationDelay: '1s' }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">
            No images found
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {query ? (
              <>
                We couldn&apos;t find any images matching <span className="font-semibold text-foreground">&ldquo;{query}&rdquo;</span>. 
                Try a different search term or upload some images to get started.
              </>
            ) : (
              "Upload some images or use the image generator to build your collection."
            )}
          </p>
        </div>
        
        {/* Suggestions */}
        <div className="space-y-3 pt-4">
          <p className="text-sm font-medium text-muted-foreground">Try these suggestions:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full border border-border/50">
              Use simpler terms
            </span>
            <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full border border-border/50">
              Check spelling
            </span>
            <span className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full border border-border/50">
              Try synonyms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
