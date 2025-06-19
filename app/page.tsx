import { CardGridSkeleton } from "@/components/card-grid-skeleton";
import { SearchBox } from "@/components/search-box";
import { SuspendedImageSearch } from "@/components/suspended-image-search";
import { FileUpload } from "@/components/file-upload";
import { ImageGenerator } from "@/components/image-generator";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = (await searchParams).q;
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="w-64 bg-muted/30 p-4 border-r flex flex-col justify-between">
        <div>
          <h1 className="font-semibold text-2xl mb-4">Semantic Search</h1>
          <div className="pt-2">
            <SearchBox query={query} />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Generate Image</h3>
            <ImageGenerator />
          </div>
          <div>
            <h3 className="font-medium mb-2">Upload Image</h3>
            <FileUpload />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Suspense fallback={<CardGridSkeleton />} key={query}>
          <SuspendedImageSearch query={query} />
        </Suspense>
      </main>
    </div>
  );
}
