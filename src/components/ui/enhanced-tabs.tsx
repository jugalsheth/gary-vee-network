"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"
import { ChevronRight, ExternalLink } from "lucide-react"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'default' | 'pills' | 'underline' | 'cards'
    size?: 'sm' | 'md' | 'lg'
  }
>(({ className, variant = 'default', size = 'md', ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center"
  
  const variantClasses = {
    default: "h-10 rounded-md bg-muted p-1 text-muted-foreground",
    pills: "h-auto rounded-full bg-gray-100 dark:bg-gray-800 p-1 text-muted-foreground",
    underline: "h-12 border-b border-gray-200 dark:border-gray-700 bg-transparent p-0 text-muted-foreground",
    cards: "h-auto rounded-xl bg-gray-100 dark:bg-gray-800 p-2 text-muted-foreground gap-2"
  }
  
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  }

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'default' | 'pills' | 'underline' | 'cards'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
    badge?: string | number
    description?: string
  }
>(({ className, variant = 'default', size = 'md', icon, badge, description, children, ...props }, ref) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variantClasses = {
    default: "rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    pills: "rounded-full px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md data-[state=active]:scale-105",
    underline: "border-b-2 border-transparent px-4 py-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent",
    cards: "rounded-lg px-4 py-3 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-lg data-[state=active]:scale-105 flex flex-col items-center gap-2"
  }
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm",
    lg: "text-base px-4 py-2"
  }

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {variant === 'cards' ? (
        <div className="flex flex-col items-center gap-2">
          {icon && <div className="w-6 h-6">{icon}</div>}
          <div className="text-center">
            <div className="font-medium">{children}</div>
            {description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </div>
            )}
          </div>
          {badge && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {badge}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {icon && <div className="w-4 h-4">{icon}</div>}
          <span>{children}</span>
          {badge && (
            <div className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] flex items-center justify-center">
              {badge}
            </div>
          )}
        </div>
      )}
    </TabsPrimitive.Trigger>
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    variant?: 'default' | 'animated' | 'fade'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const baseClasses = "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  
  const variantClasses = {
    default: "mt-2",
    animated: "mt-2 animate-in fade-in-0 slide-in-from-top-2 duration-300",
    fade: "mt-2 animate-in fade-in-0 duration-200"
  }

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

// Enhanced tab group with navigation
interface TabGroupProps {
  tabs: Array<{
    value: string
    label: string
    icon?: React.ReactNode
    badge?: string | number
    description?: string
    content: React.ReactNode
    disabled?: boolean
  }>
  variant?: 'default' | 'pills' | 'underline' | 'cards'
  size?: 'sm' | 'md' | 'lg'
  defaultValue?: string
  onValueChange?: (value: string) => void
  className?: string
  showNavigation?: boolean
}

export function TabGroup({ 
  tabs, 
  variant = 'default', 
  size = 'md', 
  defaultValue,
  onValueChange,
  className,
  showNavigation = false
}: TabGroupProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue || tabs[0]?.value)
  const [direction, setDirection] = React.useState<'forward' | 'backward'>('forward')

  const handleValueChange = (value: string) => {
    const currentIndex = tabs.findIndex(tab => tab.value === activeTab)
    const newIndex = tabs.findIndex(tab => tab.value === value)
    
    setDirection(newIndex > currentIndex ? 'forward' : 'backward')
    setActiveTab(value)
    onValueChange?.(value)
  }

  const handleNext = () => {
    const currentIndex = tabs.findIndex(tab => tab.value === activeTab)
    const nextIndex = (currentIndex + 1) % tabs.length
    handleValueChange(tabs[nextIndex].value)
  }

  const handlePrevious = () => {
    const currentIndex = tabs.findIndex(tab => tab.value === activeTab)
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1
    handleValueChange(tabs[prevIndex].value)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <Tabs value={activeTab} onValueChange={handleValueChange}>
        <div className="flex items-center justify-between">
          <TabsList variant={variant} size={size}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                variant={variant}
                size={size}
                icon={tab.icon}
                badge={tab.badge}
                description={tab.description}
                disabled={tab.disabled}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {showNavigation && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Previous tab"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Next tab"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            variant="animated"
            className={cn(
              "transition-all duration-300",
              direction === 'forward' ? 'animate-in slide-in-from-right-4' : 'animate-in slide-in-from-left-4'
            )}
          >
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent } 