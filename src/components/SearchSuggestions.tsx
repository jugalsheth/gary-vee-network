'use client';

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Clock, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchSuggestion {
  query: string;
  count: number;
  type: 'popular' | 'recent' | 'suggestion';
}

interface SearchSuggestionsProps {
  searchQuery: string;
  onSuggestionClick: (query: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export function SearchSuggestions({ 
  searchQuery, 
  onSuggestionClick, 
  isVisible, 
  onClose 
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Popular search terms based on common patterns
  const popularSearches: SearchSuggestion[] = [
    { query: 'tier1', count: 45, type: 'popular' },
    { query: 'new york', count: 32, type: 'popular' },
    { query: 'entrepreneur', count: 28, type: 'popular' },
    { query: 'investor', count: 25, type: 'popular' },
    { query: 'tech', count: 22, type: 'popular' },
    { query: 'married', count: 18, type: 'popular' },
    { query: 'kids', count: 15, type: 'popular' },
    { query: 'workout', count: 12, type: 'popular' }
  ];

  // Recent searches (would come from localStorage in real app)
  const recentSearches: SearchSuggestion[] = [
    { query: 'john', count: 1, type: 'recent' },
    { query: 'email', count: 1, type: 'recent' },
    { query: 'marketing', count: 1, type: 'recent' }
  ];

  useEffect(() => {
    if (!isVisible || !searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    
    // Simulate API call for search suggestions
    setTimeout(() => {
      const filteredSuggestions = [
        ...popularSearches.filter(s => 
          s.query.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        ...recentSearches.filter(s => 
          s.query.toLowerCase().includes(searchQuery.toLowerCase())
        )
      ].slice(0, 8);

      setSuggestions(filteredSuggestions);
      setLoading(false);
    }, 100);
  }, [searchQuery, isVisible]);

  if (!isVisible || (!searchQuery.trim() && suggestions.length === 0)) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'popular': return <TrendingUp className="w-3 h-3" />;
      case 'recent': return <Clock className="w-3 h-3" />;
      default: return <Search className="w-3 h-3" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'popular': return 'default';
      case 'recent': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg mt-1 max-h-80 overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
          Finding suggestions...
        </div>
      ) : suggestions.length > 0 ? (
        <div className="p-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => {
                onSuggestionClick(suggestion.query);
                onClose();
              }}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                {getIcon(suggestion.type)}
                <span className="text-sm">{suggestion.query}</span>
              </div>
              <div className="flex items-center gap-2">
                {suggestion.type === 'popular' && (
                  <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs">
                    {suggestion.count} results
                  </Badge>
                )}
                <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs">
                  {suggestion.type}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      ) : searchQuery.trim() && (
        <div className="p-4 text-center text-muted-foreground">
          <Search className="w-4 h-4 mx-auto mb-2 opacity-50" />
          No suggestions found for "{searchQuery}"
        </div>
      )}
      
      {/* Quick actions */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3 h-3" />
          <span>Quick actions:</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          <button
            onClick={() => onSuggestionClick('tier1')}
            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Tier 1
          </button>
          <button
            onClick={() => onSuggestionClick('married')}
            className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            Married
          </button>
          <button
            onClick={() => onSuggestionClick('kids')}
            className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
          >
            Has Kids
          </button>
        </div>
      </div>
    </div>
  );
}
