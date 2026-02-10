export default function Loading() {
    return (
        <div className="flex flex-col gap-6 pb-20">
            {/* Search Header Skeleton */}
            <section className="sticky top-14 z-40 bg-muted/30 pt-4 pb-2 backdrop-blur-sm">
                <div className="flex gap-2">
                    <div className="relative flex-1 h-10 bg-muted animate-pulse rounded-full" />
                    <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
                </div>
            </section>

            {/* Items Grid Skeleton */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="rounded-xl border bg-card shadow overflow-hidden">
                        <div className="p-4 pb-2 space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
                            </div>
                            <div className="h-3 w-24 bg-muted animate-pulse rounded mt-1" />
                        </div>
                        <div className="p-4 pt-2 space-y-2">
                            <div className="h-4 w-full bg-muted animate-pulse rounded" />
                            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                            <div className="flex gap-1 mt-2">
                                <div className="h-5 w-10 bg-muted animate-pulse rounded" />
                                <div className="h-5 w-10 bg-muted animate-pulse rounded" />
                            </div>
                        </div>
                        <div className="p-4 pt-0">
                            <div className="h-9 w-full bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}
