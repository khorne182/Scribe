/**
 * Enhanced Sidebar Component for Scribe
 * 
 * This component provides advanced navigation with folders, tags, and search.
 * Features drag & drop, keyboard shortcuts, and real-time filtering.
 */

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Plus, 
  Star, 
  Folder, 
  Tag, 
  Moon, 
  Sun, 
  Settings, 
  Archive,
  Trash2,
  Filter,
  ChevronDown,
  ChevronRight,
  Download,
  Upload
} from 'lucide-react'
import SearchBar from './SearchBar'
import scribeLogo from '../../../../images/scribe-alt.png'
import { SimpleDatabaseService } from '../lib/simpleDatabase'
import { Note, Folder as FolderType, Tag as TagType } from '../lib/models'

interface SidebarProps {
  dbService: SimpleDatabaseService | null
  notes: Note[]
  selectedNote: Note | null
  searchQuery: string
  isDarkMode: boolean
  onNoteSelect: (note: Note) => void
  onSearchChange: (query: string) => void
  onToggleDarkMode: () => void
  onCreateNote: () => void
  onFilterChange: (filter: string) => void
  onShowTagManager: () => void
  onShowFolderManager: () => void
  availableTags: string[]
  availableFolders: any[]
  onSearchFilterChange?: (filters: any) => void
  onTagClick?: (tagName: string) => void
  onShowExportDialog?: () => void
  onShowImportDialog?: () => void
}

export default function Sidebar({
  dbService,
  notes,
  selectedNote,
  searchQuery,
  isDarkMode,
  onNoteSelect,
  onSearchChange,
  onToggleDarkMode,
  onCreateNote,
  onFilterChange,
  onShowTagManager,
  onShowFolderManager,
  availableTags,
  availableFolders,
  onSearchFilterChange,
  onTagClick
}: SidebarProps) {
  const [folders, setFolders] = useState<FolderType[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Load folders and tags
  useEffect(() => {
    if (dbService) {
      setFolders(dbService.getFolders())
      setTags(dbService.getTags())
    }
  }, [dbService])

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    onFilterChange(filter)
  }

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const getFilteredNotes = () => {
    if (!dbService) return notes

    switch (activeFilter) {
      case 'pinned':
        return notes.filter(note => note.pinned)
      case 'recent':
        return notes.slice(0, 10) // Last 10 notes
      case 'all':
      default:
        return notes
    }
  }

  const filteredNotes = getFilteredNotes()

  return (
    <div className="w-80 bg-fluent-gray-50 dark:bg-fluent-gray-800 border-r border-fluent-gray-200 dark:border-fluent-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <img src={scribeLogo} alt="Scribe" className="w-6 h-6" />
            <h1 className="text-lg font-semibold text-fluent-gray-800 dark:text-fluent-gray-100">Scribe</h1>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={onToggleDarkMode}
              className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-fluent-gray-600 dark:text-fluent-gray-300" /> : <Moon className="w-4 h-4 text-fluent-gray-600" />}
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
              title="Filters"
            >
              <Filter className="w-4 h-4 text-fluent-gray-600 dark:text-fluent-gray-300" />
            </button>
            <button 
              onClick={onShowTagManager}
              className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
              title="Manage Tags"
            >
              <Tag className="w-4 h-4 text-fluent-gray-600 dark:text-fluent-gray-300" />
            </button>
            <button 
              onClick={onShowFolderManager}
              className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
              title="Manage Folders"
            >
              <Folder className="w-4 h-4 text-fluent-gray-600 dark:text-fluent-gray-300" />
            </button>
            {/* <button 
              onClick={onShowExportDialog}
              className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
              title="Export Notes"
            >
              <Download className="w-4 h-4 text-fluent-gray-600 dark:text-fluent-gray-300" />
            </button>
            <button 
              onClick={onShowImportDialog}
              className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
              title="Import Notes"
            >
              <Upload className="w-4 h-4 text-fluent-gray-600 dark:text-fluent-gray-300" />
            </button> */}
          </div>
        </div>
        
        <button 
          onClick={onCreateNote}
          className="w-full flex items-center justify-center px-4 py-2 bg-fluent-blue-600 hover:bg-fluent-blue-700 text-white rounded-md font-medium transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
        <SearchBar
          query={searchQuery}
          onQueryChange={onSearchChange}
          onFilterChange={onSearchFilterChange || (() => {})}
          availableTags={availableTags}
          availableFolders={availableFolders}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Quick Filters */}
      {showFilters && (
        <div className="p-3 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
          <div className="space-y-1">
            <button
              onClick={() => handleFilterChange('all')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700 dark:text-fluent-blue-300' 
                  : 'text-fluent-gray-700 dark:text-fluent-gray-200 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700'
              }`}
            >
              <Folder className="w-4 h-4 mr-3" />
              All Notes
            </button>
            <button
              onClick={() => handleFilterChange('pinned')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'pinned' 
                  ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700 dark:text-fluent-blue-300' 
                  : 'text-fluent-gray-700 dark:text-fluent-gray-200 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700'
              }`}
            >
              <Star className="w-4 h-4 mr-3" />
              Pinned Notes
            </button>
            <button
              onClick={() => handleFilterChange('recent')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeFilter === 'recent' 
                  ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700 dark:text-fluent-blue-300' 
                  : 'text-fluent-gray-700 dark:text-fluent-gray-200 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700'
              }`}
            >
              <Archive className="w-4 h-4 mr-3" />
              Recent
            </button>
          </div>
        </div>
      )}

      {/* Folders */}
      <div className="p-3 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-fluent-gray-500 dark:text-fluent-gray-400 uppercase tracking-wide">
            Folders
          </h3>
          <button className="p-1 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded">
            <Plus className="w-3 h-3 text-fluent-gray-500" />
          </button>
        </div>
        <div className="space-y-1">
          {folders.map((folder) => (
            <div key={folder.id}>
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center px-2 py-1 text-sm text-fluent-gray-700 dark:text-fluent-gray-200 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded transition-colors"
              >
                {expandedFolders.has(folder.id) ? (
                  <ChevronDown className="w-3 h-3 mr-2" />
                ) : (
                  <ChevronRight className="w-3 h-3 mr-2" />
                )}
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: folder.color || '#6b7280' }}
                />
                <span className="truncate">{folder.name}</span>
              </button>
              {expandedFolders.has(folder.id) && (
                <div className="ml-6 space-y-1">
                  {/* Folder notes would be listed here */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="p-3 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-fluent-gray-500 dark:text-fluent-gray-400 uppercase tracking-wide">
            Tags
          </h3>
          <button className="p-1 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded">
            <Plus className="w-3 h-3 text-fluent-gray-500" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1">
          {availableTags.slice(0, 8).map((tagName, index) => (
            <button
              key={index}
              onClick={() => onTagClick?.(tagName)}
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700 dark:text-fluent-blue-300 hover:bg-fluent-blue-200 dark:hover:bg-fluent-blue-900/40 transition-colors cursor-pointer"
              title={`Filter by tag: ${tagName}`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tagName}
            </button>
          ))}
          {availableTags.length > 8 && (
            <span className="text-xs text-fluent-gray-500 dark:text-fluent-gray-400">
              +{availableTags.length - 8} more
            </span>
          )}
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-fluent-gray-500 dark:text-fluent-gray-400 uppercase tracking-wide px-2">
              {activeFilter === 'all' ? 'All Notes' : 
               activeFilter === 'pinned' ? 'Pinned Notes' : 
               activeFilter === 'recent' ? 'Recent Notes' : 'Notes'}
            </h3>
          </div>
          <div className="space-y-1">
            {filteredNotes.map((note) => (
              <div 
                key={note.id}
                onClick={() => onNoteSelect(note)}
                className={`p-3 rounded-md cursor-pointer transition-colors ${
                  selectedNote?.id === note.id 
                    ? 'bg-fluent-blue-50 dark:bg-fluent-blue-900/20 border border-fluent-blue-200 dark:border-fluent-blue-700' 
                    : 'hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm text-fluent-gray-800 dark:text-fluent-gray-100 truncate flex-1">
                    {note.title}
                  </h4>
                  {note.pinned && <Star className="w-3 h-3 text-fluent-blue-500 fill-current flex-shrink-0 ml-2" />}
                </div>
                <p className="text-xs text-fluent-gray-600 dark:text-fluent-gray-400 line-clamp-2 mb-2">
                  {note.content || 'No content'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-fluent-gray-200 dark:bg-fluent-gray-700 text-fluent-gray-700 dark:text-fluent-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-fluent-gray-500 dark:text-fluent-gray-500">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
