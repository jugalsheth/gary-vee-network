'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/ThemeProvider'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="transition-all duration-300 hover:scale-105"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 transition-all duration-300 rotate-0" />
      ) : (
        <Sun className="h-4 w-4 transition-all duration-300 rotate-0" />
      )}
      <span className="sr-only">
        {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      </span>
    </Button>
  )
} 