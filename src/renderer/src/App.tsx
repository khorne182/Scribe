import { useState, useEffect } from 'react'
import { SimpleDatabaseService } from './lib/simpleDatabase'
import { Note, CreateNoteData, UpdateNoteData } from './lib/models'
import Sidebar from './components/Sidebar'
import NoteEditor from './components/NoteEditor'

function App(): React.JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [dbService, setDbService] = useState<SimpleDatabaseService | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>('all')

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
    if (!dbService) return

    try {
      const newNote = dbService.createNote({
        title: 'Untitled Note',
        content: '',
        tags: [],
        pinned: false
      })
      setNotes([newNote, ...notes])
      setSelectedNote(newNote)
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
        onSearchChange={setSearchQuery}
        onToggleDarkMode={toggleDarkMode}
        onCreateNote={createNewNote}
        onFilterChange={handleFilterChange}
      />
      
      <NoteEditor
        note={selectedNote}
        onUpdate={handleNoteUpdate}
        onDelete={handleNoteDelete}
        onPin={handleNotePin}
      />
    </div>
  )
}

export default App
