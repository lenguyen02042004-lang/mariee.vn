import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-secondary/40">
      <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center gap-5 px-6 max-w-4xl mx-auto text-center">
        <Skeleton className="h-6 w-40 bg-white/20" />
        <Skeleton className="h-12 md:h-16 w-3/4 bg-white/25" />
        <Skeleton className="h-12 md:h-16 w-2/3 bg-white/25" />
        <Skeleton className="h-5 w-1/2 bg-white/15 mt-2" />
        <div className="mt-6 flex gap-4">
          <Skeleton className="h-12 w-48 bg-white/25" />
          <Skeleton className="h-12 w-44 bg-white/15" />
        </div>
      </div>
    </section>
  );
}

export function CouplesSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="text-center mb-12 sm:mb-16 flex flex-col items-center gap-3">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
        ))}
      </div>
    </section>
  );
}

export function JournalSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="flex flex-col gap-3 mb-10 sm:mb-14">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-10 w-96 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-card rounded-2xl overflow-hidden border border-border/40">
            <Skeleton className="aspect-[16/10] w-full rounded-none" />
            <div className="p-5 sm:p-6 flex flex-col gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      <HeroSkeleton />
      <CouplesSkeleton />
      <JournalSkeleton />
    </>
  );
}