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

export const ImageSearch = ({
  images,
  query,
}: {
  images: DBImage[];
  query?: string;
}) => {
  const { isPending } = useSharedTransition();

  if (isPending) return <CardGridSkeleton />;

  if (images.length === 0) {
    return <NoImagesFound query={query ?? ""} />;
  }

  return <ImageGrid images={images} />;
};

const ImageGrid = ({ images }: { images: DBImage[] }) => {
  const { items: pending } = usePendingImages();
  const processedFinalIds = new Set(
    pending
      .filter((p) => p.status === "processed" && p.finalId)
      .map((p) => p.finalId as string)
  );
  const filtered = images.filter((img) => !processedFinalIds.has(img.id));
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
                </div>
              </div>
            </MorphingDialogTrigger>
            <MorphingDialogContainer>
              <MorphingDialogContent className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-border/50 bg-card sm:w-[620px] rounded-2xl">
                <MorphingDialogImage
                  src={p.url}
                  alt={p.title || "Uploading image"}
                  className="w-full h-auto"
                />
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
            transition={{ type: "spring", bounce: 0.05, duration: 0.25 }}
          >
            <MorphingDialogTrigger className="block">
              <ImageCard image={image} similarity={image.similarity} />
            </MorphingDialogTrigger>
            <MorphingDialogContainer>
              <MorphingDialogContent className="pointer-events-auto relative flex h-auto w-full flex-col overflow-hidden border border-border/50 bg-card sm:w-[720px] rounded-2xl">
                <MorphingDialogImage
                  src={image.path}
                  alt={image.title}
                  className="w-full h-auto"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                  <p className="text-sm text-muted-foreground">
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
