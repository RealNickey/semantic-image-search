import { Skeleton } from "@/components/ui/skeleton";

export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {new Array(12).fill("").map((_, i) => (
        <SkeletonCard key={i} delay={i * 100} />
      ))}
    </div>
  );
}

export function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <div 
      className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm 
                     shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10 
                     transition-all duration-500">
        <div className="relative aspect-[4/5]">
          <Skeleton className="w-full h-full rounded-xl bg-gradient-to-br from-muted via-muted/50 to-muted 
                             animate-pulse" 
                   style={{
                     background: 'linear-gradient(45deg, hsl(var(--muted)) 25%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted)) 75%)',
                     backgroundSize: '200% 200%',
                     animation: 'shimmer 2s ease-in-out infinite'
                   }} />
          
          {/* Skeleton content overlay */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-muted-foreground/20" />
            <Skeleton className="h-3 w-1/2 bg-muted-foreground/10" />
          </div>
          
          {/* Skeleton badge */}
          <div className="absolute top-3 right-3">
            <Skeleton className="h-6 w-16 rounded-full bg-muted-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
