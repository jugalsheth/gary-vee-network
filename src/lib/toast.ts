import { toast } from 'sonner'

// Toast configuration
const TOAST_CONFIG = {
  duration: 3000,
  position: 'top-right' as const,
}

// Success toasts
export const showSuccessToast = {
  contactAdded: (contactName: string) => {
    toast.success('✅ Contact added successfully!', {
      description: `${contactName} has been added to your network`,
      ...TOAST_CONFIG,
    })
  },

  contactUpdated: (contactName: string) => {
    toast.success('📝 Contact updated successfully!', {
      description: `${contactName} has been updated`,
      ...TOAST_CONFIG,
    })
  },

  contactDeleted: (contactName: string) => {
    toast.success('🗑️ Contact deleted successfully!', {
      description: `${contactName} has been removed from your network`,
      ...TOAST_CONFIG,
    })
  },

  contactsImported: (count: number) => {
    toast.success('📥 Contacts imported successfully!', {
      description: `${count} contact${count !== 1 ? 's' : ''} added to your network`,
      ...TOAST_CONFIG,
    })
  },

  contactsExported: (count: number) => {
    toast.success('📤 Contacts exported successfully!', {
      description: `${count} contact${count !== 1 ? 's' : ''} exported to CSV`,
      ...TOAST_CONFIG,
    })
  },

  aiQueryCompleted: (resultCount?: number) => {
    const message = resultCount 
      ? `🤖 Found ${resultCount} matching contact${resultCount !== 1 ? 's' : ''}!`
      : '🤖 AI query completed!'
    
    toast.success(message, {
      description: 'Your network analysis is ready',
      ...TOAST_CONFIG,
    })
  },

  ocrProcessed: () => {
    toast.success('📸 Contact information extracted!', {
      description: 'Review and edit the extracted data',
      ...TOAST_CONFIG,
    })
  },

  voiceNoteSaved: () => {
    toast.success('🎤 Voice note saved!', {
      description: 'Your voice note has been transcribed and saved',
      ...TOAST_CONFIG,
    })
  },

  loginSuccess: (username: string, team: string) => {
    toast.success('👋 Welcome back!', {
      description: `Signed in as ${username} (${team})`,
      ...TOAST_CONFIG,
    })
  },

  logoutSuccess: () => {
    toast.success('🚪 Logged out successfully!', {
      description: 'See you later!',
      ...TOAST_CONFIG,
    })
  },

  bulkOperation: (action: string, count: number) => {
    toast.success(`🔄 ${action} completed!`, {
      description: `${count} contact${count !== 1 ? 's' : ''} affected`,
      ...TOAST_CONFIG,
    })
  },

  milestone: (message: string) => {
    toast.success('🎉 Milestone reached!', {
      description: message,
      duration: 4000,
      position: 'top-right' as const,
    })
  },
}

// Error toasts
export const showErrorToast = {
  contactAddFailed: () => {
    toast.error('❌ Failed to add contact', {
      description: 'Please try again or check your input',
      ...TOAST_CONFIG,
    })
  },

  contactUpdateFailed: () => {
    toast.error('❌ Failed to update contact', {
      description: 'Please try again',
      ...TOAST_CONFIG,
    })
  },

  contactDeleteFailed: () => {
    toast.error('❌ Failed to delete contact', {
      description: 'Please try again',
      ...TOAST_CONFIG,
    })
  },

  importFailed: (error?: string) => {
    toast.error('❌ Import failed', {
      description: error || 'Please check your file format and try again',
      ...TOAST_CONFIG,
    })
  },

  exportFailed: () => {
    toast.error('❌ Export failed', {
      description: 'Please try again',
      ...TOAST_CONFIG,
    })
  },

  aiQueryFailed: () => {
    toast.error('❌ AI query failed', {
      description: 'Please try again or rephrase your question',
      ...TOAST_CONFIG,
    })
  },

  loginFailed: () => {
    toast.error('❌ Login failed', {
      description: 'Please check your credentials and try again',
      ...TOAST_CONFIG,
    })
  },

  permissionDenied: () => {
    toast.error('🚫 Access restricted', {
      description: 'You don\'t have permission for this action',
      ...TOAST_CONFIG,
    })
  },

  generalError: (message: string) => {
    toast.error('❌ Something went wrong', {
      description: message,
      ...TOAST_CONFIG,
    })
  },
}

// Info toasts
export const showInfoToast = {
  loading: (message: string) => {
    toast.loading(message, {
      ...TOAST_CONFIG,
    })
  },

  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      ...TOAST_CONFIG,
    })
  },
}

// Milestone tracking
let contactCount = 0

export const trackContactMilestone = (newCount: number) => {
  contactCount = newCount
  
  // Milestone celebrations
  if (contactCount === 1) {
    showSuccessToast.milestone('Your first contact! 🎉 Welcome to Gary Vee Network!')
  } else if (contactCount === 10) {
    showSuccessToast.milestone('10 contacts! Your network is growing! 🌱')
  } else if (contactCount === 25) {
    showSuccessToast.milestone('25 contacts! You\'re building something special! 💪')
  } else if (contactCount === 50) {
    showSuccessToast.milestone('50 contacts! You\'re a networking pro! 🚀')
  } else if (contactCount === 100) {
    showSuccessToast.milestone('100 contacts! Legendary network builder! 👑')
  }
} 