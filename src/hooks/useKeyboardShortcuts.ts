import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onSearch: () => void;
  onAddContact: () => void;
  onToggleTheme: () => void;
  onExport: () => void;
  onImport: () => void;
  onClearSearch: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onToggleFilters: () => void;
  onQuickActions: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    // Command/Ctrl + Key combinations
    if (event.metaKey || event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 'k':
          event.preventDefault();
          config.onSearch();
          break;
        case 'n':
          event.preventDefault();
          config.onAddContact();
          break;
        case 'e':
          event.preventDefault();
          config.onExport();
          break;
        case 'i':
          event.preventDefault();
          config.onImport();
          break;
        case 'j':
          event.preventDefault();
          config.onToggleTheme();
          break;
        case 'f':
          event.preventDefault();
          config.onToggleFilters();
          break;
        case 'a':
          event.preventDefault();
          config.onQuickActions();
          break;
      }
    }

    // Single key shortcuts (when not typing)
    if (!event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
      switch (event.key.toLowerCase()) {
        case 'escape':
          config.onClearSearch();
          break;
        case 'arrowright':
        case 'l':
          config.onNextPage();
          break;
        case 'arrowleft':
        case 'h':
          config.onPrevPage();
          break;
        case 'r':
          window.location.reload();
          break;
        case '?':
          showKeyboardShortcutsHelp();
          break;
      }
    }

    // Alt + Key combinations
    if (event.altKey && !event.metaKey && !event.ctrlKey) {
      switch (event.key.toLowerCase()) {
        case 's':
          event.preventDefault();
          config.onSearch();
          break;
        case 'a':
          event.preventDefault();
          config.onAddContact();
          break;
        case 't':
          event.preventDefault();
          config.onToggleTheme();
          break;
      }
    }
  }, [config]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Show keyboard shortcuts help
  const showKeyboardShortcutsHelp = () => {
    const shortcuts = [
      { key: '⌘/Ctrl + K', description: 'Focus search' },
      { key: '⌘/Ctrl + N', description: 'Add new contact' },
      { key: '⌘/Ctrl + E', description: 'Export contacts' },
      { key: '⌘/Ctrl + I', description: 'Import contacts' },
      { key: '⌘/Ctrl + J', description: 'Toggle theme' },
      { key: '⌘/Ctrl + F', description: 'Toggle filters' },
      { key: '⌘/Ctrl + A', description: 'Quick actions' },
      { key: 'Alt + S', description: 'Focus search' },
      { key: 'Alt + A', description: 'Add contact' },
      { key: 'Alt + T', description: 'Toggle theme' },
      { key: 'Escape', description: 'Clear search' },
      { key: '→ or L', description: 'Next page' },
      { key: '← or H', description: 'Previous page' },
      { key: 'R', description: 'Refresh page' },
      { key: '?', description: 'Show this help' }
    ];

    const helpText = shortcuts.map(s => `${s.key}: ${s.description}`).join('\n');
    alert(`Keyboard Shortcuts:\n\n${helpText}`);
  };

  return { showKeyboardShortcutsHelp };
}

// Enhanced keyboard shortcuts for contact cards
export function useContactCardShortcuts(
  contact: any,
  onEdit: (contact: any) => void,
  onDelete: (contact: any) => void,
  onMessage: (contact: any) => void,
  onCall: (contact: any) => void,
  onEmail: (contact: any) => void
) {
  const handleContactKeyDown = useCallback((event: KeyboardEvent) => {
    // Only trigger when contact card is focused
    if (!event.target?.closest('[data-contact-id]')) return;

    const contactId = (event.target as Element).closest('[data-contact-id]')?.getAttribute('data-contact-id');
    if (contactId !== contact.id) return;

    switch (event.key.toLowerCase()) {
      case 'e':
        event.preventDefault();
        onEdit(contact);
        break;
      case 'd':
        event.preventDefault();
        onDelete(contact);
        break;
      case 'm':
        event.preventDefault();
        onMessage(contact);
        break;
      case 'c':
        event.preventDefault();
        if (contact.phone) onCall(contact);
        break;
      case 'a':
        event.preventDefault();
        if (contact.email) onEmail(contact);
        break;
      case 'enter':
      case ' ':
        event.preventDefault();
        // Navigate to contact
        break;
    }
  }, [contact, onEdit, onDelete, onMessage, onCall, onEmail]);

  useEffect(() => {
    document.addEventListener('keydown', handleContactKeyDown);
    return () => {
      document.removeEventListener('keydown', handleContactKeyDown);
    };
  }, [handleContactKeyDown]);
}

// Global keyboard shortcuts manager
export class KeyboardShortcutsManager {
  private shortcuts: Map<string, () => void> = new Map();
  private isEnabled = true;

  register(key: string, callback: () => void) {
    this.shortcuts.set(key, callback);
  }

  unregister(key: string) {
    this.shortcuts.delete(key);
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isEnabled) return;

    // Don't trigger when typing in input fields
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = this.getKeyString(event);
    const callback = this.shortcuts.get(key);
    
    if (callback) {
      event.preventDefault();
      callback();
    }
  };

  private getKeyString(event: KeyboardEvent): string {
    const parts = [];
    
    if (event.metaKey) parts.push('cmd');
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    
    parts.push(event.key.toLowerCase());
    
    return parts.join('+');
  }

  attach() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  detach() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

// Predefined shortcut sets
export const SHORTCUT_SETS = {
  navigation: {
    'cmd+k': 'Focus search',
    'cmd+n': 'Add contact',
    'cmd+e': 'Export',
    'cmd+i': 'Import',
    'cmd+j': 'Toggle theme',
    'escape': 'Clear search',
    'arrowright': 'Next page',
    'arrowleft': 'Previous page'
  },
  contact: {
    'e': 'Edit contact',
    'd': 'Delete contact',
    'm': 'Message contact',
    'c': 'Call contact',
    'a': 'Email contact',
    'enter': 'Navigate to contact'
  },
  global: {
    'r': 'Refresh page',
    '?': 'Show help',
    'cmd+/': 'Toggle command palette'
  }
};
