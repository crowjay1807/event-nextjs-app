'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Gift, Hash } from 'lucide-react';
import { EventItem } from '@/lib/types';

interface SearchBarProps {
  onSearch: (query: string, filter: 'all' | 'items' | 'name') => void;
  events: EventItem[];
}

export default function SearchBar({ onSearch, events }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'items' | 'name'>('all');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    type: 'name' | 'item';
    value: string;
    eventName?: string;
  }>>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Quick search tags
  const quickSearchTags = [
    { label: 'Hourly', query: 'hour' },
    { label: 'Ruud', query: 'ruud' },
    { label: 'WC', query: 'wc' },
    { label: 'Jewels', query: 'jewel' },
    { label: 'Rare Items', query: 'rare' },
    { label: 'Crystal', query: 'crystal' },
    { label: 'Box', query: 'box' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const newSuggestions: typeof suggestions = [];
      const lowerQuery = query.toLowerCase();

      // Filter suggestions based on current filter mode
      if (filter === 'name' || filter === 'all') {
        // Search in event names
        events.forEach(event => {
          if (event.name.toLowerCase().includes(lowerQuery)) {
            if (!newSuggestions.find(s => s.value === event.name)) {
              newSuggestions.push({ type: 'name', value: event.name });
            }
          }
        });
      }

      if (filter === 'items' || filter === 'all') {
        // Search in items
        const itemSet = new Set<string>();
        events.forEach(event => {
          event.items.forEach(item => {
            if (item.toLowerCase().includes(lowerQuery) && !itemSet.has(item)) {
              itemSet.add(item);
              newSuggestions.push({ 
                type: 'item', 
                value: item,
                eventName: event.name 
              });
            }
          });
        });
      }

      setSuggestions(newSuggestions.slice(0, 8));
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, filter, events]);

  const handleSearch = (newQuery: string, newFilter?: 'all' | 'items' | 'name') => {
    const searchQuery = newQuery !== undefined ? newQuery : query;
    const searchFilter = newFilter !== undefined ? newFilter : filter;
    
    setQuery(searchQuery);
    if (newFilter) setFilter(newFilter);
    
    onSearch(searchQuery, searchFilter);
    
    // Show suggestions when changing filter
    if (newFilter && searchQuery.length > 0) {
      setShowSuggestions(true);
    }
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('', filter);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    setQuery(suggestion.value);
    
    // Set appropriate filter based on suggestion type
    const newFilter = suggestion.type === 'name' ? 'name' : 'items';
    handleSearch(suggestion.value, newFilter);
    setShowSuggestions(false);
  };

  const handleQuickSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    handleSearch(searchQuery, 'all');
  };

  const getIcon = (type: 'name' | 'item') => {
    switch (type) {
      case 'name':
        return <Hash className="w-4 h-4 text-blue-400" />;
      case 'item':
        return <Gift className="w-4 h-4 text-green-400" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mb-8">
      {/* Quick Search Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs text-gray-500">Quick search:</span>
        {quickSearchTags.map(tag => (
          <button
            key={tag.label}
            onClick={() => handleQuickSearch(tag.query)}
            className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 transition-colors"
          >
            {tag.label}
          </button>
        ))}
      </div>

      <div ref={searchRef} className="relative">
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                onFocus={() => query.length > 0 && setShowSuggestions(true)}
                placeholder="Search invasion names or rewards..."
                className="block w-full pl-10 pr-10 py-3 text-sm text-white bg-gray-800 rounded-lg border border-gray-700 focus:border-gray-500 focus:outline-none placeholder-gray-500"
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleSearch(query, 'all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleSearch(query, 'name')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'name'
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Invasion Name
              </button>
              <button
                onClick={() => handleSearch(query, 'items')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'items'
                    ? 'bg-gray-700 text-white border border-gray-600'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                Items
              </button>
            </div>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-gray-900 rounded-lg border border-gray-700 shadow-xl search-suggestions">
            <div className="p-2">
              {/* Show filter info */}
              <div className="px-3 py-1 text-xs text-gray-500 border-b border-gray-800 mb-2">
                {filter === 'name' && 'Invasion Names'}
                {filter === 'items' && 'Item Rewards'}
                {filter === 'all' && 'All Results'}
              </div>
              
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-800 rounded-lg transition-colors text-left"
                >
                  {getIcon(suggestion.type)}
                  <div className="flex-1">
                    <span className="text-sm text-white">{suggestion.value}</span>
                    {suggestion.eventName && filter === 'all' && (
                      <span className="text-xs text-gray-500 ml-2">in {suggestion.eventName}</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 capitalize">
                    {suggestion.type === 'name' ? 'Invasion' : 'Item'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
