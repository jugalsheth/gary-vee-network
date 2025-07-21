import React from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

export function ContactCardSkeleton() {
  return (
    <Card className="relative flex flex-col gap-4 p-6 shadow-md border-l-4 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      {/* Main Content Area */}
      <div className="flex items-start gap-4">
        {/* Avatar Skeleton */}
        <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
        
        {/* Contact Information */}
        <div className="flex-1 min-w-0">
          {/* Header with Name and Tier Badge */}
          <div className="flex items-center gap-2 flex-wrap pb-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-16" />
          </div>
          
          {/* Contact Details */}
          <div className="flex flex-col gap-2">
            {/* Email, Phone, Relationship */}
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-36" />
            </div>
            
            {/* Personal Info */}
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            
            {/* Interests */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            
            {/* Notes Preview */}
            <div className="mt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons Skeleton */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    </Card>
  )
}

export function ContactGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ContactCardSkeleton key={index} />
      ))}
    </div>
  )
} 