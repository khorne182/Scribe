import { useState, useEffect } from 'react'
import { SimpleDatabaseService } from './lib/simpleDatabase'
import { Note, CreateNoteData, UpdateNoteData } from './lib/models'
import Sidebar from './components/Sidebar'
import SimpleRichEditor from './components/SimpleRichEditor'
import TagManager from './components/TagManager'
import FolderManager from './components/FolderManager'
import SearchBar from './components/SearchBar'

function App(): React.JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [dbService, setDbService] = useState<SimpleDatabaseService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  
  // Organization features state
  const [showTagManager, setShowTagManager] = useState(false)
  const [showFolderManager, setShowFolderManager] = useState(false)
  const [searchFilters, setSearchFilters] = useState<any>({})
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [availableFolders, setAvailableFolders] = useState<any[]>([])

  // Initialize database on component mount
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database...')
        const db = new SimpleDatabaseService()
        setDbService(db)
        
        // Load existing notes
        const existingNotes = db.getNotes()
        console.log('Loaded notes:', existingNotes.length)
        setNotes(existingNotes)
        
        // Load tags and folders
        const tags = db.getTags()
        const folders = db.getFolders()
        setAvailableTags(tags.map(tag => tag.name))
        setAvailableFolders(folders)
        
        setIsLoading(false)
        console.log('Database initialized successfully')
      } catch (error) {
        console.error('Failed to initialize database:', error)
        setIsLoading(false)
      }
    }

    initializeDatabase()
  }, [])

  useEffect(() => {
    const handleNewNote = () => {
      createNewNote()
    }
    window.electron.ipcRenderer.on('new-note', handleNewNote)
    return () => {
      window.electron.ipcRenderer.removeListener('new-note', handleNewNote)
    }
  }, [dbService])

  const createNewNote = () => {
    console.log('createNewNote called')
    if (!dbService) {
      console.log('No dbService available')
      return
    }

    try {
      console.log('Creating new note...')
      const newNote = dbService.createNote({
        title: 'Untitled Note',
        content: '',
        tags: [],
        pinned: false
      })
      console.log('New note created:', newNote)
      setNotes([newNote, ...notes])
      setSelectedNote(newNote)
      console.log('Note added to state')
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days} days ago`
  }

  const handleNoteUpdate = (updatedNote: Note) => {
    if (!dbService) return

    try {
      const savedNote = dbService.updateNote({
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        tags: updatedNote.tags,
        pinned: updatedNote.pinned
      })

      if (savedNote) {
        setNotes(notes.map(n => n.id === updatedNote.id ? savedNote : n))
        setSelectedNote(savedNote)
        
        // Update available tags when note tags change
        const allTags = dbService.getTags()
        setAvailableTags(allTags.map(tag => tag.name))
      }
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note)
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    // Filter notes based on the selected filter
    if (dbService) {
      let filteredNotes: Note[] = []
      
      switch (filter) {
        case 'pinned':
          filteredNotes = dbService.getNotes({ pinned: true })
          break
        case 'recent':
          filteredNotes = notes.slice(0, 10) // Last 10 notes
          break
        case 'all':
        default:
          filteredNotes = dbService.getNotes()
          break
      }
      
      setNotes(filteredNotes)
    }
  }

  const handleNoteDelete = (noteId: number) => {
    if (!dbService) return

    try {
      const success = dbService.deleteNote(noteId)
      if (success) {
        setNotes(notes.filter(n => n.id !== noteId))
        if (selectedNote?.id === noteId) {
          setSelectedNote(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleNotePin = (noteId: number, pinned: boolean) => {
    if (!dbService) return

    try {
      const updatedNote = dbService.updateNote({
        id: noteId,
        pinned
      })

      if (updatedNote) {
        setNotes(notes.map(n => n.id === noteId ? updatedNote : n))
        if (selectedNote?.id === noteId) {
          setSelectedNote(updatedNote)
        }
      }
    } catch (error) {
      console.error('Failed to pin/unpin note:', error)
    }
  }

  const handleNoteCopy = (note: Note) => {
    if (!dbService) return

    try {
      const copiedNote = dbService.createNote({
        title: `${note.title} (Copy)`,
        content: note.content,
        tags: [...note.tags],
        pinned: false
      })
      setNotes([copiedNote, ...notes])
    } catch (error) {
      console.error('Failed to copy note:', error)
    }
  }

  const handlePrint = () => {
    if (selectedNote) {
      // Phase 6: Implement print functionality
      console.log('Print functionality - Phase 6')
      window.print()
    }
  }

  // Organization functions
  const handleTagRename = (oldName: string, newName: string) => {
    if (!dbService) return
    
    // Update all notes with the old tag
    const updatedNotes = notes.map(note => ({
      ...note,
      tags: note.tags.map(tag => tag === oldName ? newName : tag)
    }))
    
    // Update notes in database
    updatedNotes.forEach(note => {
      dbService.updateNote({
        id: note.id,
        tags: note.tags
      })
    })
    
    setNotes(updatedNotes)
    
    // Update available tags
    setAvailableTags(prev => prev.map(tag => tag === oldName ? newName : tag))
  }

  const handleTagDelete = (tagName: string) => {
    if (!dbService) return
    
    // Remove tag from all notes
    const updatedNotes = notes.map(note => ({
      ...note,
      tags: note.tags.filter(tag => tag !== tagName)
    }))
    
    // Update notes in database
    updatedNotes.forEach(note => {
      dbService.updateNote({
        id: note.id,
        tags: note.tags
      })
    })
    
    setNotes(updatedNotes)
    
    // Update available tags
    setAvailableTags(prev => prev.filter(tag => tag !== tagName))
  }

  const handleFolderCreate = (name: string, color: string) => {
    if (!dbService) return
    
    const newFolder = dbService.createFolder(name, color)
    setAvailableFolders(prev => [...prev, newFolder])
  }

  const handleFolderRename = (id: number, newName: string) => {
    setAvailableFolders(prev => 
      prev.map(folder => 
        folder.id === id ? { ...folder, name: newName } : folder
      )
    )
  }

  const handleFolderDelete = (id: number) => {
    setAvailableFolders(prev => prev.filter(folder => folder.id !== id))
  }

  const handleSearchFilterChange = (filters: any) => {
    setSearchFilters(filters)
    
    if (dbService) {
      const filteredNotes = dbService.getNotes(filters)
      setNotes(filteredNotes)
    }
  }

  // Handle search query changes
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    
    if (dbService) {
      const currentFilters = {
        query: query,
        ...searchFilters
      }
      const filteredNotes = dbService.getNotes(currentFilters)
      setNotes(filteredNotes)
      console.log('Search query:', query, 'Filtered notes:', filteredNotes.length)
    }
  }

  // Refresh available tags from database
  const refreshAvailableTags = () => {
    if (dbService) {
      const tags = dbService.getTags()
      const tagNames = tags.map(tag => tag.name)
      setAvailableTags(tagNames)
      console.log('Refreshed available tags (ranked by usage):', tagNames)
    }
  }

  // Handle tag click for filtering
  const handleTagClick = (tagName: string) => {
    if (dbService) {
      const filteredNotes = dbService.getNotes({ tags: [tagName] })
      setNotes(filteredNotes)
      setSearchQuery(`tag:${tagName}`)
      console.log('Filtered by tag:', tagName, 'Notes:', filteredNotes.length)
    }
  }

  // Simple fallback if components fail to load
  if (isLoading) {
  return (
      <div className="h-screen flex items-center justify-center bg-fluent-gray-50 dark:bg-fluent-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-fluent-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
      </div>
          <h2 className="text-xl font-semibold text-fluent-gray-800 dark:text-fluent-gray-100 mb-2">Loading Scribe...</h2>
          <p className="text-fluent-gray-500 dark:text-fluent-gray-400">Initializing your note-taking app</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        dbService={dbService}
        notes={notes}
        selectedNote={selectedNote}
        searchQuery={searchQuery}
        isDarkMode={isDarkMode}
        onNoteSelect={handleNoteSelect}
        onSearchChange={handleSearchChange}
        onToggleDarkMode={toggleDarkMode}
        onCreateNote={createNewNote}
        onFilterChange={handleFilterChange}
        onShowTagManager={() => setShowTagManager(true)}
        onShowFolderManager={() => setShowFolderManager(true)}
        availableTags={availableTags}
        availableFolders={availableFolders}
        onSearchFilterChange={handleSearchFilterChange}
        onTagClick={handleTagClick}
      />
      
      <SimpleRichEditor
        note={selectedNote}
        onUpdate={handleNoteUpdate}
        onDelete={handleNoteDelete}
        onPin={handleNotePin}
        onCopy={handleNoteCopy}
        onCreate={createNewNote}
        onSave={handleNoteUpdate}
        onPrint={handlePrint}
        availableTags={availableTags}
        onTagsRefresh={refreshAvailableTags}
      />

      {/* Organization Modals */}
      {showTagManager && (
        <TagManager
          tags={availableTags}
          onTagRename={handleTagRename}
          onTagDelete={handleTagDelete}
          onClose={() => setShowTagManager(false)}
        />
      )}

      {showFolderManager && (
        <FolderManager
          folders={availableFolders}
          onCreateFolder={handleFolderCreate}
          onRenameFolder={handleFolderRename}
          onDeleteFolder={handleFolderDelete}
          onClose={() => setShowFolderManager(false)}
        />
      )}
    </div>
  )
}

export default App
