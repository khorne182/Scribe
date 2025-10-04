/**
 * Simple Database Service for Scribe (Restored)
 * 
 * This is the working version that uses localStorage.
 * Restored to fix the broken app after FileSystemService implementation.
 */

import { 
  Note, 
  Folder, 
  Tag, 
  CreateNoteData, 
  UpdateNoteData, 
  SearchFilters, 
  DatabaseStats 
} from './models'

export class SimpleDatabaseService {
  private storageKey = 'scribe-notes'

  constructor() {
    // Initialize with default data if none exists
    if (!this.getNotes().length) {
      this.createNote({
        title: 'Welcome to Scribe',
        content: 'Start writing your first note here...\n\nThis is your personal, offline note-taking space. All your data is stored locally on your computer.',
        tags: ['welcome'],
        pinned: true
      })
    }
  }

  private getNotesFromStorage(): Note[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load notes from storage:', error)
      return []
    }
  }

  private saveNotesToStorage(notes: Note[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notes))
    } catch (error) {
      console.error('Failed to save notes to storage:', error)
    }
  }

  createNote(data: CreateNoteData): Note {
    const notes = this.getNotesFromStorage()
    const newNote: Note = {
      id: Date.now(),
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      pinned: data.pinned || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      folder_id: data.folder_id,
      encrypted: data.encrypted || false
    }
    
    notes.unshift(newNote)
    this.saveNotesToStorage(notes)
    return newNote
  }

  getNoteById(id: number): Note | null {
    const notes = this.getNotesFromStorage()
    return notes.find(note => note.id === id) || null
  }

  getNotes(filters: SearchFilters = {}): Note[] {
    let notes = this.getNotesFromStorage()

    if (filters.query) {
      const query = filters.query.toLowerCase()
      notes = notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      )
    }

    if (filters.pinned !== undefined) {
      notes = notes.filter(note => note.pinned === filters.pinned)
    }

    if (filters.tags && filters.tags.length > 0) {
      notes = notes.filter(note => 
        filters.tags!.some(tag => note.tags.includes(tag))
      )
    }

    return notes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }

  updateNote(data: UpdateNoteData): Note | null {
    const notes = this.getNotesFromStorage()
    const noteIndex = notes.findIndex(note => note.id === data.id)
    
    if (noteIndex === -1) return null

    const updatedNote = {
      ...notes[noteIndex],
      ...data,
      updated_at: new Date().toISOString()
    }

    notes[noteIndex] = updatedNote
    this.saveNotesToStorage(notes)
    return updatedNote
  }

  deleteNote(id: number): boolean {
    const notes = this.getNotesFromStorage()
    const filteredNotes = notes.filter(note => note.id !== id)
    
    if (filteredNotes.length === notes.length) return false
    
    this.saveNotesToStorage(filteredNotes)
    return true
  }

  getFolders(): Folder[] {
    // Simple implementation - return default folder
    return [
      {
        id: 1,
        name: 'General',
        color: '#3b82f6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  createFolder(name: string, color?: string): Folder {
    const folder: Folder = {
      id: Date.now(),
      name,
      color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return folder
  }

  getFolderById(id: number): Folder | null {
    const folders = this.getFolders()
    return folders.find(folder => folder.id === id) || null
  }

  getTags(): Tag[] {
    const notes = this.getNotesFromStorage()
    const allTags = notes.flatMap(note => note.tags)
    
    // Count tag usage
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Get unique tags with usage count
    const uniqueTags = [...new Set(allTags)]
    
    return uniqueTags
      .map((tag, index) => ({
        id: index + 1,
        name: tag,
        created_at: new Date().toISOString(),
        usageCount: tagCounts[tag] || 0
      }))
      .sort((a, b) => {
        // Sort by usage count (descending), then by creation date (ascending)
        if (a.usageCount !== b.usageCount) {
          return b.usageCount - a.usageCount
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      })
  }

  createTag(name: string, color?: string): Tag {
    const tag: Tag = {
      id: Date.now(),
      name,
      color,
      created_at: new Date().toISOString()
    }
    return tag
  }

  getTagByName(name: string): Tag | null {
    const tags = this.getTags()
    return tags.find(tag => tag.name === name) || null
  }

  getTagById(id: number): Tag | null {
    const tags = this.getTags()
    return tags.find(tag => tag.id === id) || null
  }

  getStats(): DatabaseStats {
    const notes = this.getNotesFromStorage()
    return {
      total_notes: notes.length,
      total_folders: this.getFolders().length,
      total_tags: this.getTags().length,
      pinned_notes: notes.filter(note => note.pinned).length,
      encrypted_notes: notes.filter(note => note.encrypted).length
    }
  }

  close(): void {
    // No-op for localStorage
  }
}
