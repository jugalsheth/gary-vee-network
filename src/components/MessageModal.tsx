'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageCircle, Send } from 'lucide-react'
import type { Contact } from '@/lib/types'

interface MessageModalProps {
  contact: Contact | null
  isOpen: boolean
  onClose: () => void
  onSend?: (message: string) => void
  isLoading?: boolean
}

export function MessageModal({
  contact,
  isOpen,
  onClose,
  onSend,
  isLoading = false
}: MessageModalProps) {
  const [message, setMessage] = useState('')

  if (!contact) return null

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleClose = () => {
    setMessage('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Send Message</DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Send a message to {contact.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Contact Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
              {contact.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div>
              <span className="font-medium">{contact.name}</span>
              {contact.email && (
                <p className="text-sm text-gray-500">{contact.email}</p>
              )}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Feature Notice */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Coming Soon:</strong> This messaging feature will be fully functional in a future update, 
              allowing you to send messages directly to your contacts.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isLoading || !message.trim()}
            className="flex-1 sm:flex-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 