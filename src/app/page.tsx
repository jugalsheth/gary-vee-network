'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { ContactCard } from '@/components/ContactCard'
import { ContactGridSkeleton } from '@/components/ContactCardSkeleton'
import { AddContactModal } from '@/components/AddContactModal'
import { EditContactModal } from '@/components/EditContactModal'
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal'
import { AIChat } from '@/components/AIChat'
import { AdvancedSearch, type FilterState } from '@/components/AdvancedSearch'
import { ImportModal } from '@/components/ImportModal'
import { ExportButton } from '@/components/ExportButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import { BulkOperations } from '@/components/BulkOperations'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/components/AuthProvider'
import { NetworkVisualization } from '@/components/NetworkVisualization'
import { ConnectionModal } from '@/components/ConnectionModal'
import { NetworkInsights } from '@/components/NetworkInsights'
import { VoiceNotesDemo } from '@/components/VoiceNotesDemo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Phone, MapPin, Instagram, Edit2, Trash2, X, Users, Star, Target, Network, Plus, Upload, Grid, List, BarChart3, Mic, ChevronLeft, ChevronRight } from 'lucide-react'
import { getTeamColor } from '@/lib/auth'
import { exportContactsToCSV } from '@/lib/importExport'
import { toast } from 'sonner';
import type { Contact, Connection } from '@/lib/types'
import { initializeSampleData } from '@/lib/sampleData'
import { CommandPalette } from '@/components/CommandPalette';
import { useTheme } from '@/components/ThemeProvider';
import { createContext, useContext } from 'react';
import type { GlobalContactState } from '@/lib/types';
import { calculateGlobalAnalytics, applyGlobalFilters, paginateResults } from '@/lib/utils';
import { loadAllContacts } from '@/lib/importExport';
import HeaderAnalytics from '@/components/HeaderAnalytics';
import debounce from 'lodash/debounce';

// --- GLOBAL CONTACT CONTEXT ---
const GlobalContactContext = createContext<GlobalContactState | undefined>(undefined);
export const useGlobalContacts = () => useContext(GlobalContactContext);

function GlobalContactProvider({ children }: { children: React.ReactNode }) {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [currentPageContacts, setCurrentPageContacts] = useState<Contact[]>([]);
  const [globalAnalytics, setGlobalAnalytics] = useState<any>(null);
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 30, totalPages: 1, totalFilteredResults: 0 });
  const [globalFilters, setGlobalFilters] = useState({ selectedTiers: [], selectedTeams: [], hasKids: null, isMarried: null, locations: [], dateRange: null, customFilters: {} });
  // Add globalSearch state as needed

  // Load all contacts on mount
  useEffect(() => {
    loadAllContacts().then(data => {
      setAllContacts(data);
      setFilteredContacts(data);
      setPagination(p => ({ ...p, totalFilteredResults: data.length, totalPages: Math.ceil(data.length / p.itemsPerPage) }));
      setGlobalAnalytics(calculateGlobalAnalytics(data));
      setCurrentPageContacts(paginateResults(data, 1, 30));
    });
  }, []);

  // Recalculate analytics and pagination when filteredContacts changes
  useEffect(() => {
    setGlobalAnalytics(calculateGlobalAnalytics(allContacts));
    setPagination(p => ({ ...p, totalFilteredResults: filteredContacts.length, totalPages: Math.ceil(filteredContacts.length / p.itemsPerPage) }));
    setCurrentPageContacts(paginateResults(filteredContacts, pagination.currentPage, pagination.itemsPerPage));
  }, [allContacts, filteredContacts, pagination.currentPage, pagination.itemsPerPage]);

  const value: GlobalContactState = {
    allContacts,
    filteredContacts,
    currentPageContacts,
    globalAnalytics,
    pagination,
    globalSearch: { query: '', results: [], isSearching: false, searchMetrics: { query: '', resultCount: 0, searchTime: 0, topMatches: [], searchCategories: {} } },
    globalFilters
  };

  return <GlobalContactContext.Provider value={value}>{children}</GlobalContactContext.Provider>;
}

function ContactGrid({ contacts, onEdit, onDelete }: { contacts: Contact[], onEdit: (c: Contact) => void, onDelete: (id: string) => void }) {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No contacts found</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
      {contacts.map((contact, index) => (
        <div
          key={contact.id}
          className="animate-slideInUp opacity-0"
          style={{ 
            animationDelay: `${index * 100}ms`,
            animationFillMode: 'forwards'
          }}
        >
          <ContactCard
            contact={contact}
            onEdit={onEdit}
            onDelete={() => onDelete(contact.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Counting animation component
interface CountingNumberProps {
  end: number;
  duration?: number;
}
const CountingNumber: React.FC<CountingNumberProps> = ({ end, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | undefined;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
};

// Enhanced analytics card with counter and progress bar
interface AnalyticsCardProps {
  icon: React.ElementType;
  count: number;
  label: string;
  gradient: string;
  delay?: number;
}
const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ icon: Icon, count, label, gradient, delay = 0 }) => (
  <div 
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 group cursor-pointer"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="ml-4 flex-1">
        <div className="text-3xl font-bold text-gray-900 dark:text-white transition-all duration-300 group-hover:scale-105">
          <CountingNumber end={count} duration={1000} />
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {label}
        </div>
      </div>
      {/* Animated chevron */}
      <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300" />
    </div>
    {/* Progress bar animation */}
    <div className="mt-4 bg-gray-100 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
      <div 
        className={`h-full bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left`}
      />
    </div>
  </div>
);

// Replace PremiumHeader with animated analytics cards
interface PremiumHeaderProps {
  contacts: Contact[];
}
const PremiumHeader: React.FC<PremiumHeaderProps> = ({ contacts }) => {
  const tier1Count = contacts.filter((c: Contact) => c.tier === 'tier1').length;
  const tier2Count = contacts.filter((c: Contact) => c.tier === 'tier2').length;
  const tier3Count = contacts.filter((c: Contact) => c.tier === 'tier3').length;
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <AnalyticsCard icon={Users} count={contacts.length} label="Total Contacts" gradient="from-blue-500 to-blue-600" delay={0} />
          <AnalyticsCard icon={Star} count={tier1Count} label="Tier 1 Contacts" gradient="from-pink-500 to-pink-600" delay={100} />
          <AnalyticsCard icon={Target} count={tier2Count} label="Tier 2 Contacts" gradient="from-yellow-500 to-yellow-600" delay={200} />
          <AnalyticsCard icon={Network} count={tier3Count} label="Tier 3 Contacts" gradient="from-green-500 to-green-600" delay={300} />
        </div>
      </div>
    </div>
  );
};

// Enhanced search with suggestions and animations
interface PremiumSearchBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  contacts: Contact[];
}
const PremiumSearchBar: React.FC<PremiumSearchBarProps> = ({ searchQuery, setSearchQuery, contacts }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Contact[]>([]);

  const generateSuggestions = useCallback((query: string) => {
    if (!query.trim()) return [];
    const filtered = contacts
      .filter(contact => 
        contact.name.toLowerCase().includes(query.toLowerCase()) ||
        contact.email?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5);
    return filtered;
  }, [contacts]);

  useEffect(() => {
    const newSuggestions = generateSuggestions(searchQuery);
    setSuggestions(newSuggestions);
    setShowSuggestions(searchQuery.length > 0 && newSuggestions.length > 0);
  }, [searchQuery, generateSuggestions]);

  return (
    <div className="relative">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 group-focus-within:scale-110 transition-all duration-300" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search across all ${contacts.length} contacts...`}
          className="block w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 shadow-sm hover:shadow-lg focus:shadow-xl group-hover:border-gray-300"
        />
        {/* Enhanced clear button */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center group/clear"
          >
            <div className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
              <X className="h-4 w-4 text-gray-400 group-hover/clear:text-gray-600 transition-colors duration-200" />
            </div>
          </button>
        )}
      </div>
      {/* Live suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-slideDown">
          <div className="p-2">
            <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-2 font-medium">
              Quick Results ({suggestions.length})
            </div>
            {suggestions.map((contact, index) => (
              <button
                key={contact.id}
                onClick={() => {
                  setSearchQuery(contact.name);
                  setShowSuggestions(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  contact.tier === 'tier1' ? 'bg-pink-500' :
                  contact.tier === 'tier2' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}>
                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {contact.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {contact.email}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const { user, logout } = useAuth()
  const { toggleTheme } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [showVoiceNotesDemo, setShowVoiceNotesDemo] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'bulk' | 'network' | 'insights'>('grid')
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    searchText: '',
    tier: 'all',
    hasKids: null,
    isMarried: null,
    location: 'all',
    interests: []
  })
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters]);

  // Debounced search to reduce filtering frequency
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setFilteredContacts(contacts);
        return;
      }
      const filtered = contacts.filter(contact =>
        contact.name?.toLowerCase().includes(query.toLowerCase()) ||
        contact.email?.toLowerCase().includes(query.toLowerCase()) ||
        contact.notes?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredContacts(filtered);
    }, 300),
    [contacts]
  );

  // Update search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Pagination controls component
  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-t border-gray-700">
      <div className="text-sm text-gray-400">
        Showing {startIndex + 1} to {Math.min(endIndex, filteredContacts.length)} of {filteredContacts.length} contacts
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-gray-400">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  const global = useGlobalContacts();

  // Scroll and highlight logic
  const scrollToAndHighlightContact = (contactId: string) => {
    const el = document.querySelector(`[data-contact-id='${contactId}']`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-blue-400', 'transition');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-blue-400', 'transition');
      }, 2000);
    }
  };

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching contacts...');
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setContacts(data);
        setFilteredContacts(data);
      } else {
        console.error('API returned non-array data:', data);
        setContacts([]);
        setFilteredContacts([]);
        setError('Invalid data format received');
      }
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setContacts([]);
      setFilteredContacts([]);
      setError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Use fetchContacts on mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  useEffect(() => {
    console.log('🔍 Page component mounted');
    console.log('🔍 Import modal state:', showImportModal);
  }, []);
  useEffect(() => {
    console.log('🔍 Import modal state changed:', showImportModal);
  }, [showImportModal]);

  const handleImportClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔘 IMPORT BUTTON CLICKED!');
    console.log('🔍 Current timestamp:', new Date().toISOString());
    console.log('🔍 About to set showImportModal to true');
    setShowImportModal(true);
    console.log('✅ setShowImportModal(true) called');
  };

  const handleImportComplete = (count: number) => {
    console.log('✅ Import completed:', count, 'contacts');
    setShowImportModal(false);
    fetchContacts();
  };

  // TEST BUTTON for debugging
  const testModalOpen = () => {
    console.log('🧪 TEST: Opening import modal');
    setShowImportModal(true);
  };

  useEffect(() => {
    console.log('Contacts state updated:', contacts);
    console.log('FilteredContacts state updated:', filteredContacts);
  }, [contacts, filteredContacts]);

  const handleAddContact = useCallback(async (contact: Contact) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      })
      const newContact = await res.json()
      setContacts(prev => [...prev, newContact])
      setFilteredContacts(prev => [...prev, newContact])
      setShowAddModal(false)
      
      // Track milestone
      // trackContactMilestone(contacts.length + 1) // This line was removed as per the new_code
    } catch (error) {
      console.error('Error adding contact:', error)
      toast.error('Failed to add contact');
    }
  }, [contacts.length])

  // Fix update contact error
  const handleUpdateContact = async (contactId: string, updates: Partial<Contact>) => {
    if (!contactId) {
      console.error('Contact ID is required for update');
      return;
    }
    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        throw new Error('Failed to update contact');
      }
      const result = await response.json();
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...result } : c));
      setFilteredContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...result } : c));
      toast.success('Contact updated successfully');
      return result;
    } catch (error) {
      console.error('Failed to update contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      console.log('🗑️ UI: Deleting contact...', id);
      const response = await fetch('/api/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete contact');
      }
      console.log('✅ UI: Contact deleted successfully');
      setContacts(prev => prev.filter(c => c.id !== id));
      setFilteredContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact deleted successfully');
    } catch (error: any) {
      console.error('❌ UI: Delete failed:', error);
      toast.error(`Failed to delete contact: ${error.message}`);
    }
  };

  // Handler for confirming delete (DeleteConfirmationModal expects onConfirm: (contact: Contact) => void)
  const handleConfirmDeleteContact = (contact: Contact) => {
    handleDeleteContact(contact.id);
    setSelectedContacts(prev => prev.filter(c => c.id !== contact.id));
    
    // Show success toast
    if (contact.id) {
      // showSuccessToast.contactDeleted(contact.id) // This line was removed as per the new_code
    }
  };

  // Handler for bulk delete (BulkOperations expects onDeleteContacts: (ids: string[]) => void)
  const handleBulkDeleteContacts = useCallback((contactIds: string[]) => {
    try {
      contactIds.forEach(id => {
        handleDeleteContact(id);
      })
      setContacts(prev => prev.filter(c => !contactIds.includes(c.id)))
      setFilteredContacts(prev => prev.filter(c => !contactIds.includes(c.id)))
      setSelectedContacts(prev => prev.filter(c => !contactIds.includes(c.id)))
    } catch (error) {
      console.error('Error bulk deleting contacts:', error)
      alert('Failed to delete some contacts')
    }
  }, [handleDeleteContact])

  const handleAddConnection = useCallback((contactId: string, connection: Connection) => {
    try {
      const updatedContact = contacts.find(c => c.id === contactId)
      if (!updatedContact) return

      const newContact = {
        ...updatedContact,
        connections: [...(updatedContact.connections || []), connection],
        updatedAt: new Date()
      }

      handleUpdateContact(contactId, newContact);
    } catch (error) {
      console.error('Error adding connection:', error)
      alert('Failed to add connection')
    }
  }, [contacts, handleUpdateContact])

  const handleRemoveConnection = useCallback((contactId: string, targetContactId: string) => {
    try {
      const updatedContact = contacts.find(c => c.id === contactId)
      if (!updatedContact) return

      const newContact = {
        ...updatedContact,
        connections: (updatedContact.connections || []).filter(c => c.contactId !== targetContactId),
        updatedAt: new Date()
      }

      handleUpdateContact(contactId, newContact);
    } catch (error) {
      console.error('Error removing connection:', error)
      alert('Failed to remove connection')
    }
  }, [contacts, handleUpdateContact])

  const handleManageConnections = useCallback((contact: Contact) => {
    setSelectedContact(contact)
    setShowConnectionModal(true)
  }, [])

  // Handler for bulk update (BulkOperations expects onUpdateContacts: (ids: string[], updates: Partial<Contact>) => void)
  const handleBulkUpdateContacts = useCallback((contactIds: string[], updates: Partial<Contact>) => {
    try {
      const updatedContacts = contacts.map(contact => {
        if (contactIds.includes(contact.id)) {
          const updated = { ...contact, ...updates, updatedAt: new Date() }
          handleUpdateContact(contact.id, updated);
          return updated
        }
        return contact
      })
      
      setContacts(updatedContacts)
      setFilteredContacts(updatedContacts)
      setSelectedContacts(prev => prev.map(contact => {
        if (contactIds.includes(contact.id)) {
          return { ...contact, ...updates, updatedAt: new Date() }
        }
        return contact
      }))
    } catch (error) {
      console.error('Error bulk updating contacts:', error)
      alert('Failed to update some contacts')
    }
  }, [contacts, handleUpdateContact])

  const handleImportContacts = useCallback((importedContacts: Contact[]) => {
    try {
      // Add imported contacts to localStorage and state
      importedContacts.forEach(contact => {
        fetch('/api/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contact)
        })
      })
      
      setContacts(prev => [...prev, ...importedContacts])
      setFilteredContacts(prev => [...prev, ...importedContacts])
      
      // Show success toast
      // showSuccessToast.contactsImported(importedContacts.length) // This line was removed as per the new_code
    } catch (error) {
      console.error('Error importing contacts:', error)
      toast.error('Failed to import contacts');
    }
  }, [])

  const handleFilterChange = useCallback((filtered: Contact[]) => {
    setFilteredContacts(filtered)
  }, [])

  // Wrapper for EditContactModal onUpdate
  const handleEditContactModalUpdate = (contact: Contact) => {
    handleUpdateContact(contact.id, contact);
  };

  // Ensure handleEditContact is defined as a function
  const handleEditContact = (contact: Contact) => {
    console.log('Editing contact:', contact);
    setSelectedContact(contact);
    setShowEditModal(true);
  };

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  // Virtualized visible contacts for grid
  const visibleContacts = useMemo(() => {
    return filteredContacts.slice(visibleRange.start, visibleRange.end);
  }, [filteredContacts, visibleRange]);

  return (
    <GlobalContactProvider>
      <ProtectedRoute>
        <CommandPalette
          setShowAddModal={setShowAddModal}
          setShowImportModal={setShowImportModal}
          contacts={contacts}
          exportContacts={() => exportContactsToCSV(contacts)}
          toggleTheme={toggleTheme}
          scrollToAndHighlightContact={scrollToAndHighlightContact}
          setShowEditModal={setShowEditModal}
          setSelectedContact={setSelectedContact}
        />
        <div className="min-h-screen premium-bg transition-colors duration-300">
          {/* Header */}
          <header className="glass-card shadow-modern border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
            <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold gradient-text transition-colors duration-300">Gary Vee Network</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Enterprise relationship management</p>
                  </div>
                </div>
              
              <div className="flex items-center gap-2">
                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-2 mr-4">
                    <Badge className={`text-xs ${getTeamColor(user.team)}`}>
                      {user.team}
                    </Badge>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {user.username}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={logout}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Logout
                    </Button>
                  </div>
                )}
                
                {/* Theme Toggle */}
                <ThemeToggle />
                
                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 px-3"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'bulk' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('bulk')}
                    className="h-8 px-3"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'network' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('network')}
                    className="h-8 px-3"
                  >
                    <Network className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'insights' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('insights')}
                    className="h-8 px-3"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Import/Export Buttons */}
                <Button
                  onClick={handleImportClick}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  type="button"
                  disabled={false}
                >
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </Button>
                
                <ExportButton contacts={filteredContacts} />
                
                {/* Voice Notes Demo Button */}
                <Button
                  onClick={() => setShowVoiceNotesDemo(true)}
                  variant="outline"
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Mic className="w-4 h-4" />
                  Voice Demo
                </Button>
                
                {/* Add Contact Button */}
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Contact
                </Button>
              </div> {/* closes .flex.items-center.gap-2 */}
            </div> {/* closes .flex.items-center.justify-between.h-20 */}
          </div> {/* closes .max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6 */}
        </header>
          {/* Premium Analytics Header */}
          <PremiumHeader contacts={contacts} />
          {/* Enhanced Premium Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 mb-4">
            <PremiumSearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} contacts={contacts} />
          </div>
          {/* Remove or comment out the old analytics bar and HeaderAnalytics usage */}
          {/* <div className="glass-card border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300">
            <div className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="hidden md:block">
                    {global?.globalAnalytics && (
                      <HeaderAnalytics globalAnalytics={global.globalAnalytics} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="hidden sm:inline">Last updated: {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

        {/* Main Content */}
        <main className="max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6 py-8">
          <div className="space-y-8">
            {/* Search and Filters */}
            {/* <AdvancedSearch
              contacts={contacts}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
              onActiveFiltersChange={setActiveFilters}
            /> */}

            {/* Contact Display - RESTORED */}
            {viewMode === 'grid' && (
              loading ? (
                <div className="text-center py-12">
                  <div className="text-gray-400">Loading contacts...</div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 px-6 py-6">
                    {paginatedContacts.map((contact, index) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        onEdit={handleEditContact}
                        onDelete={() => handleDeleteContact(contact.id)}
                      />
                    ))}
                  </div>
                  <PaginationControls />
                </>
              )
            )}

            {viewMode === 'bulk' && (
              <BulkOperations
                contacts={filteredContacts}
                selectedContacts={selectedContacts}
                onSelectionChange={setSelectedContacts}
                onDeleteContacts={handleBulkDeleteContacts}
                onUpdateContacts={handleBulkUpdateContacts}
              />
            )}

            {viewMode === 'network' && (
              <NetworkVisualization
                contacts={contacts}
                onContactSelect={handleManageConnections}
                selectedContactId={selectedContact?.id}
              />
            )}

            {viewMode === 'insights' && (
              <NetworkInsights
                contacts={contacts}
                onContactSelect={handleManageConnections}
                onAddConnection={(contact1, contact2) => {
                  // Create a connection object from contact2
                  const newConnection: Connection = {
                    contactId: contact2.id,
                    strength: 'medium',
                    type: 'business',
                    createdAt: new Date()
                  };
                  handleAddConnection(contact1.id, newConnection);
                }}
              />
            )}

            {/* Empty State */}
            {(global?.filteredContacts.length === 0 && global?.allContacts.length > 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">No contacts match your current filters.</p>
              </div>
            )}

            {global?.allContacts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">No contacts yet. Add your first contact to get started!</p>
              </div>
            )}
          </div>
        </main>

        {/* AI Chat */}
        <AIChat contacts={filteredContacts} />

                {/* Modals */}
          <AddContactModal
            open={showAddModal}
            onOpenChange={setShowAddModal}
            onAdd={async () => {
              await fetchContacts();
            }}
          />
          
          {/* Voice Notes Demo Modal */}
          {showVoiceNotesDemo && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-semibold">Voice Notes Demo</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setShowVoiceNotesDemo(false)}
                    className="h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
                <VoiceNotesDemo />
              </div>
            </div>
          )}

        <EditContactModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          contact={selectedContact}
          onUpdate={handleUpdateContact}
        />

        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          contact={selectedContact}
          onConfirm={handleConfirmDeleteContact}
        />

        {/* Import Modal with debug logging */}
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportComplete={handleImportComplete}
        />
        {/* Debug info bar */}
        <div style={{position: 'fixed', bottom: '10px', left: '10px', background: 'black', color: 'white', padding: '5px', fontSize: '12px', zIndex: 9999}}>
          Modal State: {showImportModal ? 'OPEN' : 'CLOSED'}
        </div>

        <ConnectionModal
          open={showConnectionModal}
          onOpenChange={setShowConnectionModal}
          contact={selectedContact}
          allContacts={contacts}
          onAddConnection={handleAddConnection}
          onRemoveConnection={handleRemoveConnection}
        />
        </div>
      </ProtectedRoute>
    </GlobalContactProvider>
  )
}
