'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Contact } from '@/lib/types'
import { exportContactsToCSV } from '@/lib/importExport'

interface ExportButtonProps {
  contacts: Contact[]
  disabled?: boolean
}

export function ExportButton({ contacts, disabled }: ExportButtonProps) {
  const handleExport = () => {
    if (contacts.length === 0) {
      alert('No contacts to export')
      return
    }
    
    try {
      exportContactsToCSV(contacts)
    } catch (error) {
      console.error('Export error:', error)
      alert(`Error exporting contacts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport}
      disabled={disabled || contacts.length === 0}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      Export ({contacts.length})
    </Button>
  )
} 