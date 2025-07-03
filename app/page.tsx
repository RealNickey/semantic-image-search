import { CardGridSkeleton } from "@/components/card-grid-skeleton";
import { SearchBox } from "@/components/search-box";
import { SuspendedImageSearch } from "@/components/suspended-image-search";
import { FileUpload } from "@/components/file-upload";
import { ImageGenerator } from "@/components/image-generator";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q;
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Left Sidebar */}
      <aside className="w-80 bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out shadow-lg">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Semantic Search
              </h1>
              <p className="text-sm text-muted-foreground">AI-powered image discovery</p>
            </div>
          </div>
          <SearchBox query={query} />
        </div>
        
        <div className="flex-1 p-6 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <h3 className="font-semibold text-lg">Generate Image</h3>
            </div>
            <div className="pl-4">
              <ImageGenerator />
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <h3 className="font-semibold text-lg">Upload Image</h3>
            </div>
            <div className="pl-4">
              <FileUpload />
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-border/50 bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Powered by AI • Built with Next.js
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <Suspense fallback={<CardGridSkeleton />} key={query}>
            <SuspendedImageSearch query={query} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
