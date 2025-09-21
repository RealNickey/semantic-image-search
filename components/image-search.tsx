"use client";
import { ImageCard } from "./image-card";
import { DBImage } from "@/lib/db/schema";
import { NoImagesFound } from "./no-images-found";
import { useSharedTransition } from "@/lib/hooks/use-shared-transition";
import { CardGridSkeleton } from "./card-grid-skeleton";
import { usePendingImages } from "@/lib/hooks/pending-images";
import {
  MorphingDialog,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTrigger,
} from "./ui/morphing-dialog";
import Image from "next/image";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useMemo, useRef, useState } from "react";

export const ImageSearch = ({
  images,
  query,
}: {
  images: DBImage[];
  query?: string;
}) => {
  const { isPending } = useSharedTransition();
  // Client cache recent images to enable instant local filtering
  const cacheKey = "images-cache";
  const [clientImages, setClientImages] = useState<DBImage[] | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    // hydrate from sessionStorage on mount
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) setClientImages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    // persist latest server images for next interactions
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(images));
    } catch {}
  }, [images]);

  // Choose base images (use cache if server returned none and no query)
  const baseImages: DBImage[] =
    images.length === 0 && !query && clientImages && clientImages.length
      ? clientImages
      : images;

  // Local, instant filter by title/description while server revalidates
  const maybeLocallyFiltered = useMemo(() => {
    if (!query || query.length < 3) return baseImages;
    const q = query.toLowerCase();
    return baseImages.filter(
      (img) =>
        img.title.toLowerCase().includes(q) ||
        img.description.toLowerCase().includes(q)
    );
  }, [baseImages, query]);

  if (isPending) return <CardGridSkeleton />;

  if (maybeLocallyFiltered.length === 0) {
    return <NoImagesFound query={query ?? ""} />;
  }

  return <ImageGrid images={maybeLocallyFiltered} />;
};

const ImageGrid = ({ images }: { images: DBImage[] }) => {
  const { items: pending } = usePendingImages();
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const handleRemove = (id: string) =>
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  const processedFinalIds = new Set(
    pending
      .filter((p) => p.status === "processed" && p.finalId)
      .map((p) => p.finalId as string)
  );
  const filtered = images.filter(
    (img) => !processedFinalIds.has(img.id) && !removedIds.has(img.id)
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {pending.map((p, index) => (
        <div
          key={"pending_" + p.id}
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <MorphingDialog
            transition={{ type: "spring", bounce: 0.05, duration: 0.25 }}
          >
            <MorphingDialogTrigger className="block">
              <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg transition-all duration-500">
                <div className="relative aspect-[4/5]">
                  <Image
                    src={p.url}
                    alt={p.title || "Uploading image"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {p.status !== "processed" && (
                    <div className="absolute inset-0 bg-black/30 flex items-end">
                      <div className="w-full p-4 space-y-2">
                        <Skeleton className="h-4 w-3/4 bg-white/30" />
                        <Skeleton className="h-3 w-1/2 bg-white/20" />
                      </div>
                    </div>
                  )}
                  {p.status === "processed" && (
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out
                      flex flex-col justify-end p-6 text-white"
                    >
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2">
                          {p.title}
                        </h3>
                        {p.description && (
                          <p className="text-sm text-white/90 line-clamp-3 mb-3">
                            {p.description}
                          </p>
                        )}
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
                  )}
                </div>
                {/* No separate metadata block; overlay matches saved cards */}
              </div>
            </MorphingDialogTrigger>
            <MorphingDialogContainer>
              <MorphingDialogContent className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-border/50 bg-card sm:w-[520px] max-w-[92vw] max-h-[88vh] rounded-xl">
                <MorphingDialogImage
                  src={p.url}
                  alt={p.title || "Uploading image"}
                  className="w-full h-auto"
                />
                {p.status === "processed" && (
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                    {p.description && (
                      <p className="text-sm text-muted-foreground break-words line-clamp-8">
                        {p.description}
                      </p>
                    )}
                  </div>
                )}
              </MorphingDialogContent>
            </MorphingDialogContainer>
          </MorphingDialog>
        </div>
      ))}
      {filtered.map((image, index) => (
        <div
          key={"image_" + image.id}
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <MorphingDialog
            transition={{ type: "spring", bounce: 0.06, duration: 0.22 }}
          >
            <MorphingDialogTrigger className="block">
              <ImageCard
                image={image}
                similarity={image.similarity}
                onRemove={handleRemove}
              />
            </MorphingDialogTrigger>
            <MorphingDialogContainer>
              <MorphingDialogContent className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-border/50 bg-card sm:w-[560px] max-w-[92vw] max-h-[88vh] rounded-xl">
                <MorphingDialogImage
                  src={image.path}
                  alt={image.title}
                  className="w-full h-auto"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                  <p className="text-sm text-muted-foreground break-words line-clamp-8">
                    {image.description}
                  </p>
                </div>
              </MorphingDialogContent>
            </MorphingDialogContainer>
          </MorphingDialog>
        </div>
      ))}
    </div>
  );
};
