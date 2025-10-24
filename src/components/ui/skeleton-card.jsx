import React from 'react';
import { Card, CardContent } from './card';
import { Skeleton } from './skeleton';

export function SkeletonCard({ className = '' }) {
  return (
    <Card className={`${className} animate-pulse`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-16 w-16 rounded-2xl" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <Skeleton className="h-20 w-20 mx-auto rounded-3xl" />
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="grid gap-6">
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="h-64 w-full">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <Skeleton className="h-6 w-40 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-pulse">
          <CardContent className="p-8">
            <Skeleton className="h-6 w-36 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border animate-pulse">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      ))}
    </div>
  );
}
