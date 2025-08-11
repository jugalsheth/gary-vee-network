import { useEffect } from 'react'

interface KeyboardShortcutOptions {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  preventDefault?: boolean
}

export function useKeyboardShortcut(
  callback: () => void,
  options: KeyboardShortcutOptions
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const {
        key,
        ctrlKey = false,
        metaKey = false,
        shiftKey = false,
        altKey = false,
        preventDefault = true
      } = options

      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrlKey &&
        event.metaKey === metaKey &&
        event.shiftKey === shiftKey &&
        event.altKey === altKey
      ) {
        if (preventDefault) {
          event.preventDefault()
        }
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [callback, options])
} 