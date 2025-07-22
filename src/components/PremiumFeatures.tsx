"use client";
import { useState, useMemo } from 'react';
import { 
  Eye, Clock, Grid3X3, List, CheckSquare, ChevronDown, ChevronUp, 
  Network 
} from 'lucide-react';
import type { Contact } from '@/lib/types';

// SAFE utility functions with error handling
const isRecent = (dateValue: Date | string | undefined): boolean => {
  try {
    if (!dateValue) return false;
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  } catch (error) {
    console.error('isRecent error:', error);
    return false;
  }
};

const needsFollowup = (contact: Contact): boolean => {
  try {
    if (!contact.createdAt) return false;
    const created = typeof contact.createdAt === 'string' ? new Date(contact.createdAt) : contact.createdAt;
    if (isNaN(created.getTime())) return false;
    const now = new Date();
    const daysSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated > 30;
  } catch (error) {
    console.error('needsFollowup error:', error);
    return false;
  }
};

// Component 1: Smart Filter Pills
interface SmartFilterPillsProps {
  contacts?: Contact[];
  onFilterApply?: (filter: string) => void;
}
const SmartFilterPills = ({ contacts = [], onFilterApply = () => {} }: SmartFilterPillsProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const smartSuggestions = useMemo(() => {
    try {
      if (!Array.isArray(contacts)) return [];
      
      return [
        { 
          label: "Recent Additions", 
          filter: "recent", 
          count: contacts.filter((c: Contact) => isRecent(c?.createdAt)).length,
          color: "blue" 
        },
        { 
          label: "High Influence", 
          filter: "influence", 
          count: contacts.filter((c: Contact) => (c?.followerCount || 0) > 10000).length,
          color: "purple" 
        },
        { 
          label: "Needs Follow-up", 
          filter: "followup", 
          count: contacts.filter((c: Contact) => needsFollowup(c)).length,
          color: "orange" 
        },
        { 
          label: "Same Location", 
          filter: "location", 
          count: contacts.filter((c: Contact) => c?.city === "New York" || (typeof c?.location === 'string' && c?.location?.includes("New York"))).length,
          color: "green" 
        }
      ];
    } catch (error) {
      console.error('SmartFilterPills error:', error);
      return [];
    }
  }, [contacts]);

  const handleFilterClick = (filterType: string) => {
    try {
      setActiveFilters(prev => 
        prev.includes(filterType) 
          ? prev.filter(f => f !== filterType)
          : [...prev, filterType]
      );
      onFilterApply(filterType);
    } catch (error) {
      console.error('Filter click error:', error);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {smartSuggestions.map((suggestion) => (
        <button
          key={suggestion.filter}
          onClick={() => handleFilterClick(suggestion.filter)}
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
            activeFilters.includes(suggestion.filter)
              ? `bg-${suggestion.color}-500 text-white shadow-lg`
              : `bg-gray-700 text-gray-300 hover:bg-${suggestion.color}-500/20 hover:text-${suggestion.color}-400`
          }`}
        >
          <span>{suggestion.label}</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
            {suggestion.count}
          </span>
        </button>
      ))}
    </div>
  );
};

// Component 2: Quick Actions Toolbar  
interface QuickActionsToolbarProps {
  contacts?: Contact[];
  onBulkAction?: (action: string) => void;
}
const QuickActionsToolbar = ({ contacts = [], onBulkAction = () => {} }: QuickActionsToolbarProps) => (
  <div className="flex items-center justify-between mt-4">
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-4 text-sm text-gray-400">
        <div className="flex items-center space-x-1">
          <Eye className="w-4 h-4" />
          <span>Viewing {contacts?.length || 0}</span>
        </div>
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>Updated {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center space-x-2">
      <div className="flex bg-gray-700 rounded-lg p-1">
        <button className="p-1.5 bg-gray-600 rounded text-white">
          <Grid3X3 className="w-4 h-4" />
        </button>
        <button className="p-1.5 text-gray-400 hover:text-white">
          <List className="w-4 h-4" />
        </button>
      </div>

      <div className="relative group">
        <button className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 hover:text-white transition-colors">
          <CheckSquare className="w-4 h-4" />
          <span>Bulk Actions</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-50">
          <div className="p-2 space-y-1">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
              Export Selected
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
              Bulk Edit Tier
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
              Add to Campaign
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded">
              Bulk Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Component 3: Network Insights Widget
interface NetworkInsightsWidgetProps {
  contacts?: Contact[];
}
const NetworkInsightsWidget = ({ contacts = [] }: NetworkInsightsWidgetProps) => {
  const [showInsights, setShowInsights] = useState(false);
  
  const insights = useMemo(() => {
    try {
      if (!Array.isArray(contacts)) return {
        strongestConnections: 0,
        growthRate: '+0% this month',
        topLocations: ['N/A'],
        networkHealth: '0%'
      };

      return {
        strongestConnections: contacts.filter((c: Contact) => c?.tier === 'tier1').length,
        growthRate: '+12% this month',
        topLocations: ['New York', 'California', 'Florida'],
        networkHealth: '87%'
      };
    } catch (error) {
      console.error('NetworkInsights error:', error);
      return {
        strongestConnections: 0,
        growthRate: 'Error',
        topLocations: ['Error'],
        networkHealth: 'Error'
      };
    }
  }, [contacts]);

  return (
    <div className="mt-6 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Network Intelligence</h3>
            <p className="text-gray-400 text-sm">AI-powered insights about your connections</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInsights(!showInsights)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {showInsights ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {showInsights && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{insights.strongestConnections}</div>
            <div className="text-xs text-gray-400">Core Network</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{insights.growthRate}</div>
            <div className="text-xs text-gray-400">Growth Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">3</div>
            <div className="text-xs text-gray-400">Top Cities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{insights.networkHealth}</div>
            <div className="text-xs text-gray-400">Health Score</div>
          </div>
        </div>
      )}
    </div>
  );
};

export { SmartFilterPills, QuickActionsToolbar, NetworkInsightsWidget }; 