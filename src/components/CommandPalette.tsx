"use client";
import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Button } from './ui/button';
import { HapticFeedback } from '@/lib/utils';
import type { Contact } from '@/lib/types';

interface CommandPaletteProps {
  setShowAddModal: (open: boolean) => void;
  setShowImportModal: (open: boolean) => void;
  contacts: Contact[];
  exportContacts: () => void;
  toggleTheme: () => void;
  scrollToAndHighlightContact: (id: string) => void;
  setShowEditModal: (open: boolean) => void;
  setSelectedContact: (contact: Contact) => void;
}

const QUICK_ACTIONS = [
  { label: 'Add Contact', action: 'add' },
  { label: 'Export Data', action: 'export' },
  { label: 'Switch Theme', action: 'theme' },
  { label: 'Import Contacts', action: 'import' },
];

// Helper type guard
function isQuickAction(item: Contact | { label: string; action: string }): item is { label: string; action: string } {
  return typeof (item as { label?: unknown }).label === 'string' && typeof (item as { action?: unknown }).action === 'string';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  setShowAddModal,
  setShowImportModal,
  contacts,
  exportContacts,
  toggleTheme,
  scrollToAndHighlightContact,
  setShowEditModal,
  setSelectedContact,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<(Contact | { label: string; action: string })[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = new Fuse(contacts, {
    keys: ['name', 'email', 'location', 'notes', 'interests'],
    threshold: 0.3,
  });

  // Centralized close handler
  const handleClose = () => {
    setOpen(false);
    setQuery('');
    setSelected(0);
    console.log('🚪 Command palette closed and state reset');
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => {
          const newOpen = !o;
          if (!newOpen) {
            setQuery('');
            setSelected(0);
            console.log('🔄 Cmd+K closed palette, state reset');
          }
          return newOpen;
        });
        HapticFeedback.light();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults(QUICK_ACTIONS);
      setSelected(0);
      return;
    }
    const fuseResults = fuse.search(query).map(r => r.item);
    setResults(fuseResults.length ? fuseResults : [{ label: 'No results', action: 'none' }]);
    setSelected(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      HapticFeedback.light();
    }
    if (e.key === 'ArrowDown') {
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      HapticFeedback.medium();
      handleSelect(results[selected]);
    } else if (e.key === 'Escape') {
      handleClose();
      HapticFeedback.notification();
    }
  };

  const handleSelect = (item: Contact | { label: string; action: string }) => {
    HapticFeedback.medium();
    if (isQuickAction(item)) {
      if (item.action === 'add') {
        setShowAddModal(true);
      } else if (item.action === 'export') {
        exportContacts();
      } else if (item.action === 'theme') {
        toggleTheme();
      } else if (item.action === 'import') {
        setShowImportModal(true);
      }
    } else if (item.name && item.id) {
      scrollToAndHighlightContact(item.id);
      setSelectedContact(item);
      setShowEditModal(true);
    }
    handleClose();
  };

  return (
    <div
      style={{ display: open ? 'flex' : 'none' }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="glass-premium shadow-premium rounded-xl w-full max-w-lg mx-auto p-4">
        <input
          ref={inputRef}
          className="w-full p-3 rounded-lg bg-white/80 dark:bg-gray-900/80 text-lg outline-none mb-2"
          placeholder="Type a command or search contacts..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Command palette search"
        />
        <ul className="max-h-72 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-800">
          {results.map((item, i) => (
            <li
              key={isQuickAction(item) ? item.label : item.name || i}
              className={`p-3 cursor-pointer rounded-lg transition-all ${i === selected ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
              onMouseEnter={() => setSelected(i)}
              onClick={() => handleSelect(item)}
            >
              {isQuickAction(item) ? (
                <span className="font-semibold">{item.label}</span>
              ) : (
                <span>
                  <span className="font-semibold">{item.name}</span>
                  {item.email && <span className="ml-2 text-xs text-gray-500">{item.email}</span>}
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-2 text-xs text-gray-400 flex justify-between">
          <span>Cmd+K to open • Esc to close • ↑↓ to navigate</span>
          {query && <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>}
        </div>
      </div>
    </div>
  );
}; 