/**
 * Search Bar Component for Scribe
 * 
 * Provides real-time search with filters and suggestions
 */

import React, { useState, useEffect } from 'react'
import { Search, Filter, X, Tag, Folder, Calendar } from 'lucide-react'

interface SearchBarProps {
  query: string
  onQueryChange: (query: string) => void
  onFilterChange: (filters: SearchFilters) => void
  availableTags: string[]
  availableFolders: Array<{ id: number; name: string; color?: string }>
  isDarkMode: boolean
}

interface SearchFilters {
  tags?: string[]
  folder?: number
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all'
  pinned?: boolean
}

export default function SearchBar({
  query,
  onQueryChange,
  onFilterChange,
  availableTags,
  availableFolders,
  isDarkMode
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Generate search suggestions
  useEffect(() => {
    if (query.trim()) {
      const allSuggestions = [
        ...availableTags.map(tag => `tag:${tag}`),
        ...availableFolders.map(folder => `folder:${folder.name}`),
        'pinned:true',
        'pinned:false',
        'date:today',
        'date:week',
        'date:month'
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(allSuggestions)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query, availableTags, availableFolders])

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    onQueryChange(newQuery)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion)
    setShowSuggestions(false)
  }

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFilterChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fluent-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-20 py-2 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md bg-white dark:bg-fluent-gray-800 text-fluent-gray-800 dark:text-fluent-gray-100 placeholder-fluent-gray-500 dark:placeholder-fluent-gray-400 focus:outline-none focus:ring-2 focus:ring-fluent-blue-500"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-1 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded transition-colors"
              title="Clear filters"
            >
              <X className="w-4 h-4 text-fluent-gray-500" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded transition-colors ${
              showFilters 
                ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-600' 
                : 'hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 text-fluent-gray-500'
            }`}
            title="Advanced filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-40 mt-1 bg-white dark:bg-fluent-gray-800 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 text-fluent-gray-800 dark:text-fluent-gray-100 flex items-center gap-2"
            >
              {suggestion.startsWith('tag:') && <Tag className="w-4 h-4 text-fluent-blue-600" />}
              {suggestion.startsWith('folder:') && <Folder className="w-4 h-4 text-fluent-green-600" />}
              {suggestion.startsWith('pinned:') && <Calendar className="w-4 h-4 text-fluent-yellow-600" />}
              {suggestion.startsWith('date:') && <Calendar className="w-4 h-4 text-fluent-purple-600" />}
              <span className="text-sm">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-fluent-gray-800 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md shadow-lg p-4">
          <div className="space-y-4">
            <h3 className="font-medium text-fluent-gray-800 dark:text-fluent-gray-100">Advanced Filters</h3>
            
            {/* Tags Filter */}
            <div>
              <label className="block text-sm font-medium text-fluent-gray-700 dark:text-fluent-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const currentTags = filters.tags || []
                      const newTags = currentTags.includes(tag)
                        ? currentTags.filter(t => t !== tag)
                        : [...currentTags, tag]
                      handleFilterChange({ tags: newTags.length > 0 ? newTags : undefined })
                    }}
                    className={`px-2 py-1 rounded text-sm transition-colors ${
                      filters.tags?.includes(tag)
                        ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700 dark:text-fluent-blue-300'
                        : 'bg-fluent-gray-100 dark:bg-fluent-gray-700 text-fluent-gray-700 dark:text-fluent-gray-300 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Folder Filter */}
            <div>
              <label className="block text-sm font-medium text-fluent-gray-700 dark:text-fluent-gray-300 mb-2">
                Folder
              </label>
              <select
                value={filters.folder || ''}
                onChange={(e) => handleFilterChange({ 
                  folder: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                className="w-full px-3 py-2 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded bg-white dark:bg-fluent-gray-800 text-fluent-gray-800 dark:text-fluent-gray-100"
              >
                <option value="">All folders</option>
                {availableFolders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-fluent-gray-700 dark:text-fluent-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange || 'all'}
                onChange={(e) => handleFilterChange({ 
                  dateRange: e.target.value as any || undefined 
                })}
                className="w-full px-3 py-2 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded bg-white dark:bg-fluent-gray-800 text-fluent-gray-800 dark:text-fluent-gray-100"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </div>

            {/* Pinned Filter */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={filters.pinned === true}
                  onChange={(e) => handleFilterChange({ 
                    pinned: e.target.checked ? true : undefined 
                  })}
                  className="rounded border-fluent-gray-300 dark:border-fluent-gray-600"
                />
                <span className="text-sm text-fluent-gray-700 dark:text-fluent-gray-300">
                  Pinned notes only
                </span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
