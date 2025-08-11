'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import ContactCard from '@/components/ContactCard';
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
import type { GlobalAnalytics } from '@/lib/types';
import { loadAllContacts } from '@/lib/importExport';
import HeaderAnalytics from '@/components/HeaderAnalytics';
import { debounce } from 'lodash';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewModeTabsPills } from '@/components/ViewModeTabsPills';

// --- GLOBAL CONTACT CONTEXT ---
const GlobalContactContext = createContext<GlobalContactState | undefined>(undefined);
export const useGlobalContacts = () => useContext(GlobalContactContext);

function GlobalContactProvider({ children }: { children: React.ReactNode }) {
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [currentPageContacts, setCurrentPageContacts] = useState<Contact[]>([]);
  const [globalAnalytics, setGlobalAnalytics] = useState<GlobalAnalytics>({
    totalContacts: 0,
    tier1Count: 0,
    tier2Count: 0,
    tier3Count: 0,
    recentlyAdded: 0,
    byLocation: {},
    byTeam: {},
    activityMetrics: {}
  });
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

  // Memoize the context value
  const contextValue = useMemo(() => {
    console.log('🔄 Context value updated - optimized');
    return {
      allContacts,
      filteredContacts,
      currentPageContacts,
      globalAnalytics,
      pagination,
      globalSearch: { query: '', results: [], isSearching: false, searchMetrics: { query: '', resultCount: 0, searchTime: 0, topMatches: [], searchCategories: {} } },
      globalFilters
    };
  }, [allContacts, filteredContacts, currentPageContacts, globalAnalytics, pagination, globalFilters]);

  return <GlobalContactContext.Provider value={contextValue}>{children}</GlobalContactContext.Provider>;
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

// Replace PremiumHeader with backend analytics
const PremiumHeader: React.FC = () => {
  const [analytics, setAnalytics] = useState<{ totalContacts: number; tier1: number; tier2: number; tier3: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/contacts/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load analytics');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse h-24" />
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse h-24" />
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse h-24" />
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 animate-pulse h-24" />
        </div>
      </div>
    );
  }
  if (error || !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-red-500">{error || 'No analytics data'}</div>
      </div>
    );
  }
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <AnalyticsCard icon={Users} count={analytics.totalContacts} label="Total Contacts" gradient="from-blue-500 to-blue-600" delay={0} />
          <AnalyticsCard icon={Star} count={analytics.tier1} label="Tier 1 Contacts" gradient="from-pink-500 to-pink-600" delay={100} />
          <AnalyticsCard icon={Target} count={analytics.tier2} label="Tier 2 Contacts" gradient="from-yellow-500 to-yellow-600" delay={200} />
          <AnalyticsCard icon={Network} count={analytics.tier3} label="Tier 3 Contacts" gradient="from-green-500 to-green-600" delay={300} />
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
  navigateToContact: (contact: Contact) => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
}
const PremiumSearchBar: React.FC<PremiumSearchBarProps> = ({ searchQuery, setSearchQuery, contacts, navigateToContact, showSuggestions, setShowSuggestions }) => {
  const [suggestions, setSuggestions] = useState<Contact[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch suggestions from backend
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/contacts/search?query=${encodeURIComponent(query)}&page=1&limit=5`);
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      const data = await response.json();
      setSuggestions(data.contacts || []);
      setShowSuggestions((data.contacts || []).length > 0);
    } catch (err) {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions(searchQuery);
  }, [searchQuery, fetchSuggestions]);

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
          placeholder={`Search contacts...`}
          className="block w-full pl-12 pr-12 py-4 bg-input border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-ring transition-all duration-300 shadow-sm hover:shadow-lg focus:shadow-xl group-hover:border-gray-300"
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
        <div className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-slideDown">
          <div className="p-2">
            <div className="text-xs text-muted-foreground px-3 py-2 font-medium">
              {loadingSuggestions ? 'Searching...' : `Quick Results (${suggestions.length})`}
            </div>
            {suggestions.map((contact, index) => (
              <button
                key={contact.id}
                onClick={() => {
                  navigateToContact(contact);
                  setShowSuggestions(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-muted rounded-lg transition-colors duration-200 group"
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
                  <div className="text-sm font-medium text-card-foreground">
                    {contact.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contact.email}
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-400 group-hover:text-gray-600">
                  <span>Go to contact</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
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
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  // Add showSuggestions state for search dropdown
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [highlightedContactId, setHighlightedContactId] = useState<string | null>(null);

  // Fetch paginated contacts from backend
  const fetchContacts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/contacts?page=${page}&limit=${itemsPerPage}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      if (data && Array.isArray(data.contacts) && data.pagination) {
        setContacts(data.contacts);
        setFilteredContacts(data.contacts); // For now, filtered = paginated
        setTotalPages(data.pagination.totalPages);
        setTotalItems(data.pagination.totalItems);
      } else {
        setContacts([]);
        setFilteredContacts([]);
        setTotalPages(1);
        setTotalItems(0);
        setError('Invalid data format received');
      }
    } catch (error) {
      setContacts([]);
      setFilteredContacts([]);
      setTotalPages(1);
      setTotalItems(0);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // Fetch contacts when currentPage changes
  useEffect(() => {
    fetchContacts(currentPage);
  }, [fetchContacts, currentPage]);

  // Pagination controls component
  const PaginationControls = () => (
    <div className="flex items-center justify-between p-4 bg-card border-t border-border">
      <div className="text-muted-foreground text-sm">
        Showing page {currentPage} of {totalPages} ({totalItems} contacts)
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage >= totalPages}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      if (error instanceof Error) {
        console.error('Failed to update contact:', error);
      } else {
        console.error('Failed to update contact:', error);
      }
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ UI: Delete failed:', error);
        toast.error(`Failed to delete contact: ${error.message}`);
      } else {
        console.error('❌ UI: Delete failed:', error);
        toast.error('Failed to delete contact: Unknown error');
      }
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

  // Add or remove a connection using the backend API
  const handleAddConnection = async (contactId: string, connection: Connection) => {
    try {
      await fetch(`/api/contacts/${contactId}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetContactId: connection.contactId,
          strength: connection.strength,
          type: connection.type,
          notes: connection.notes,
        })
      });
      // Optionally, refresh contacts or connections here
      toast.success('Connection added!');
      fetchContacts(currentPage);
    } catch (error) {
      toast.error('Failed to add connection');
    }
  };

  const handleRemoveConnection = async (contactId: string, targetContactId: string) => {
    try {
      await fetch(`/api/contacts/${contactId}/connections`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetContactId })
      });
      // Optionally, refresh contacts or connections here
      toast.success('Connection removed!');
      fetchContacts(currentPage);
    } catch (error) {
      toast.error('Failed to remove connection');
    }
  };

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

  // Unique locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const locs = contacts.map(c => c.location).filter((loc): loc is string => Boolean(loc));
    return Array.from(new Set(locs));
  }, [contacts]);

  // Fetch contacts with filters
  const fetchFilteredContacts = useCallback(async (page = 1, tier = tierFilter, location = locationFilter) => {
    setFilterLoading(true);
    setFilterError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(itemsPerPage));
      if (tier && tier !== 'all') params.append('tier', tier);
      if (location && location !== 'all') params.append('location', location);
      const response = await fetch(`/api/contacts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch filtered contacts');
      const data = await response.json();
      setContacts(data.contacts || []);
      setFilteredContacts(data.contacts || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
    } catch (err) {
      setContacts([]);
      setFilteredContacts([]);
      setTotalPages(1);
      setTotalItems(0);
      setFilterError('Failed to fetch filtered contacts');
    } finally {
      setFilterLoading(false);
    }
  }, [itemsPerPage, tierFilter, locationFilter]);

  // Refetch when filters or page change
  useEffect(() => {
    fetchFilteredContacts(currentPage, tierFilter, locationFilter);
  }, [fetchFilteredContacts, currentPage, tierFilter, locationFilter]);

  // Helper to find which page a contact is on
  const findContactPage = async (contactId: string) => {
    try {
      const response = await fetch(`/api/contacts/find-page/${contactId}`);
      if (response.ok) {
        const data = await response.json();
        return data.page;
      }
    } catch (error) {
      console.error('Error finding contact page:', error);
    }
    return 1;
  };

  // Smart navigation to contact
  const navigateToContact = async (contact: Contact) => {
    try {
      console.log('🎯 Navigating to contact:', contact.name);
      setSearchQuery('');
      setShowSuggestions(false);
      setLoading(true);
      const targetPage = await findContactPage(contact.id);
      console.log('📄 Contact is on page:', targetPage);
      setCurrentPage(targetPage);
      // Wait for contacts to load for the new page
      const response = await fetch(`/api/contacts?page=${targetPage}&limit=30`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setFilteredContacts(data.contacts || []);
        setTotalItems(data.total || 0);
      }
      setHighlightedContactId(contact.id);
      setTimeout(() => {
        const contactElement = document.getElementById(`contact-${contact.id}`);
        if (contactElement) {
          contactElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      setTimeout(() => {
        setHighlightedContactId(null);
      }, 3000);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setLoading(false);
    }
  };

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
                      <Badge className={`text-xs ${getTeamColor(user.team)}`}>{user.team}</Badge>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{user.username}</span>
                      <Button variant="ghost" size="sm" onClick={logout} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Logout</Button>
                    </div>
                  )}
                  <ThemeToggle />
                  {/* Enhanced View Mode Tabs - Pills Version */}
                  <ViewModeTabsPills 
                    viewMode={viewMode} 
                    onViewModeChange={setViewMode}
                    className="w-auto"
                    showBadge={true}
                    badgeText="New"
                  />
                  {/* Import/Export Buttons */}
                  <Button onClick={handleImportClick} variant="outline" size="sm" className="flex items-center gap-2" type="button" disabled={false}><Upload className="w-4 h-4" /><span>Import</span></Button>
                  <ExportButton contacts={filteredContacts} />
                  {/* Voice Notes Demo Button */}
                  <Button onClick={() => setShowVoiceNotesDemo(true)} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"><Mic className="w-4 h-4" />Voice Demo</Button>
                  {/* Add Contact Button */}
                  <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2"><Plus className="w-4 h-4" />Add Contact</Button>
                </div> {/* closes .flex.items-center.gap-2 */}
              </div> {/* closes .flex.items-center.justify-between.h-20 */}
            </div> {/* closes .max-w-[95%] mx-auto px-2 sm:px-4 lg:px-6 */}
          </header>
          {/* Premium Analytics Header */}
          <PremiumHeader />
          {/* Enhanced Premium Search Bar */}
          <div className="max-w-7xl mx-auto mt-8 mb-4 flex flex-wrap items-center gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex-1 min-w-[250px]">
              <PremiumSearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                contacts={contacts}
                navigateToContact={navigateToContact}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-28">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="tier1">Tier 1</SelectItem>
                <SelectItem value="tier2">Tier 2</SelectItem>
                <SelectItem value="tier3">Tier 3</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map(loc => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterLoading && <span className="text-sm text-gray-500">Loading...</span>}
            {filterError && <span className="text-sm text-red-500">{filterError}</span>}
          </div>
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
                  <div className="w-full max-w-full overflow-x-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 py-6">
                        {contacts.map((contact, index) => (
                          <ContactCard
                            key={contact.id}
                            contact={contact}
                            onEdit={handleEditContact}
                            onDelete={() => handleDeleteContact(contact.id)}
                            isHighlighted={highlightedContactId === contact.id}
                            id={`contact-${contact.id}`}
                          />
                        ))}
                      </div>
                    <div className="w-full max-w-full">
                      <PaginationControls />
                    </div>
                  </div>
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
