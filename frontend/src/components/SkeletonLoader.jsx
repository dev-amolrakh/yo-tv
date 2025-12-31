function ChannelCardSkeleton() {
  return (
    <div className="bg-dark-200 rounded-xl overflow-hidden border border-dark-300 animate-pulse">
      {/* Logo Skeleton */}
      <div className="aspect-video bg-dark-300"></div>

      {/* Info Skeleton */}
      <div className="p-3 sm:p-4 space-y-3">
        {/* Title */}
        <div className="h-4 bg-dark-300 rounded w-3/4"></div>

        {/* Network */}
        <div className="h-3 bg-dark-300 rounded w-1/2"></div>

        {/* Categories */}
        <div className="flex gap-1">
          <div className="h-5 w-16 bg-dark-300 rounded-full"></div>
          <div className="h-5 w-20 bg-dark-300 rounded-full"></div>
        </div>

        {/* Button */}
        <div className="h-10 bg-dark-300 rounded-lg"></div>
      </div>
    </div>
  );
}

function ChannelGridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <ChannelCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export { ChannelCardSkeleton, ChannelGridSkeleton };
