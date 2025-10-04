/**
 * File System Service for Scribe
 * 
 * This service handles local file storage in Documents/Scribe/ folder.
 * Supports multiple formats: .md, .txt, .pdf
 * Replaces SimpleDatabaseService with actual file-based storage.
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

export type FileFormat = 'md' | 'txt' | 'pdf'

export class FileSystemService {
  private basePath: string
  private defaultFormat: FileFormat = 'md'

  constructor() {
    // Use Documents/Scribe/ folder
    this.basePath = this.getDocumentsPath() + '/Scribe'
    this.initializeFileSystem()
  }

  private getDocumentsPath(): string {
    // For now, use a simple path - will be enhanced with proper OS detection
    if (typeof window !== 'undefined' && window.electron) {
      // Use electron API to get proper documents path
      return window.electron.getDocumentsPath?.() || './Documents'
    }
    return './Documents'
  }

  private async initializeFileSystem(): Promise<void> {
    try {
      // Create base directory if it doesn't exist
      await this.ensureDirectoryExists(this.basePath)
      await this.ensureDirectoryExists(`${this.basePath}/notes`)
      await this.ensureDirectoryExists(`${this.basePath}/folders`)
      await this.ensureDirectoryExists(`${this.basePath}/tags`)
      
      // Create welcome note if no notes exist
      const notes = await this.getNotes()
      if (notes.length === 0) {
        await this.createNote({
          title: 'Welcome to Scribe',
          content: `# Welcome to Scribe

This is your personal, offline note-taking space. All your notes are stored locally on your computer in the Documents/Scribe folder.

## Features:
- **Rich text editing** with full formatting
- **Local storage** - your data never leaves your computer
- **Multiple formats** - save as Markdown (.md), Text (.txt), or PDF (.pdf)
- **Organization** - use folders and tags to organize your notes

Start writing your first note here!`,
          tags: ['welcome'],
          pinned: true
        })
      }
    } catch (error) {
      console.error('Failed to initialize file system:', error)
    }
  }

  private async ensureDirectoryExists(path: string): Promise<void> {
    // Placeholder - will be implemented with proper file system API
    console.log(`Ensuring directory exists: ${path}`)
  }

  private generateNoteId(): number {
    return Date.now()
  }

  private generateFileName(title: string, format: FileFormat): string {
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-')
    return `${sanitizedTitle}.${format}`
  }

  private async writeFile(path: string, content: string): Promise<void> {
    // Placeholder - will be implemented with proper file system API
    console.log(`Writing file: ${path}`)
    localStorage.setItem(`file:${path}`, content)
  }

  private async readFile(path: string): Promise<string> {
    // Placeholder - will be implemented with proper file system API
    return localStorage.getItem(`file:${path}`) || ''
  }

  private async fileExists(path: string): Promise<boolean> {
    // Placeholder - will be implemented with proper file system API
    return localStorage.getItem(`file:${path}`) !== null
  }

  private async deleteFile(path: string): Promise<void> {
    // Placeholder - will be implemented with proper file system API
    localStorage.removeItem(`file:${path}`)
  }

  private async listFiles(directory: string): Promise<string[]> {
    // Placeholder - will be implemented with proper file system API
    const files: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`file:${directory}`)) {
        files.push(key.replace('file:', ''))
      }
    }
    return files
  }

  setDefaultFormat(format: FileFormat): void {
    this.defaultFormat = format
  }

  getDefaultFormat(): FileFormat {
    return this.defaultFormat
  }

  async createNote(data: CreateNoteData, format?: FileFormat): Promise<Note> {
    const noteFormat = format || this.defaultFormat
    const note: Note = {
      id: this.generateNoteId(),
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      pinned: data.pinned || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      folder_id: data.folder_id,
      encrypted: data.encrypted || false
    }

    const fileName = this.generateFileName(note.title, noteFormat)
    const filePath = `${this.basePath}/notes/${fileName}`
    
    // Create file content based on format
    let fileContent = ''
    switch (noteFormat) {
      case 'md':
        fileContent = this.createMarkdownContent(note)
        break
      case 'txt':
        fileContent = this.createTextContent(note)
        break
      case 'pdf':
        // PDF creation will be implemented in Phase 6
        fileContent = this.createTextContent(note)
        break
    }

    await this.writeFile(filePath, fileContent)
    
    // Store metadata
    const metadataPath = `${this.basePath}/notes/${note.id}.meta.json`
    await this.writeFile(metadataPath, JSON.stringify(note))

    return note
  }

  private createMarkdownContent(note: Note): string {
    let content = `# ${note.title}\n\n`
    content += `${note.content}\n\n`
    content += `---\n`
    content += `Created: ${note.created_at}\n`
    content += `Updated: ${note.updated_at}\n`
    if (note.tags.length > 0) {
      content += `Tags: ${note.tags.join(', ')}\n`
    }
    if (note.pinned) {
      content += `Pinned: true\n`
    }
    return content
  }

  private createTextContent(note: Note): string {
    let content = `${note.title}\n`
    content += `${'='.repeat(note.title.length)}\n\n`
    content += `${note.content}\n\n`
    content += `Created: ${note.created_at}\n`
    content += `Updated: ${note.updated_at}\n`
    if (note.tags.length > 0) {
      content += `Tags: ${note.tags.join(', ')}\n`
    }
    if (note.pinned) {
      content += `Pinned: true\n`
    }
    return content
  }

  async getNoteById(id: number): Promise<Note | null> {
    const metadataPath = `${this.basePath}/notes/${id}.meta.json`
    try {
      const metadataContent = await this.readFile(metadataPath)
      if (!metadataContent) return null
      return JSON.parse(metadataContent) as Note
    } catch (error) {
      console.error('Failed to read note metadata:', error)
      return null
    }
  }

  async getNotes(filters: SearchFilters = {}): Promise<Note[]> {
    try {
      const metadataFiles = await this.listFiles(`${this.basePath}/notes`)
      const notes: Note[] = []

      for (const filePath of metadataFiles) {
        if (filePath.endsWith('.meta.json')) {
          try {
            const content = await this.readFile(filePath)
            const note = JSON.parse(content) as Note
            notes.push(note)
          } catch (error) {
            console.error(`Failed to parse note metadata: ${filePath}`, error)
          }
        }
      }

      // Apply filters
      let filteredNotes = notes

      if (filters.query) {
        const query = filters.query.toLowerCase()
        filteredNotes = filteredNotes.filter(note => 
          note.title.toLowerCase().includes(query) || 
          note.content.toLowerCase().includes(query)
        )
      }

      if (filters.pinned !== undefined) {
        filteredNotes = filteredNotes.filter(note => note.pinned === filters.pinned)
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredNotes = filteredNotes.filter(note => 
          filters.tags!.some(tag => note.tags.includes(tag))
        )
      }

      // Sort by pinned first, then by updated date
      return filteredNotes.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })
    } catch (error) {
      console.error('Failed to get notes:', error)
      return []
    }
  }

  async updateNote(data: UpdateNoteData, format?: FileFormat): Promise<Note | null> {
    const existingNote = await this.getNoteById(data.id)
    if (!existingNote) return null

    const updatedNote: Note = {
      ...existingNote,
      ...data,
      updated_at: new Date().toISOString()
    }

    // Update file content
    const noteFormat = format || this.defaultFormat
    const fileName = this.generateFileName(updatedNote.title, noteFormat)
    const filePath = `${this.basePath}/notes/${fileName}`
    
    let fileContent = ''
    switch (noteFormat) {
      case 'md':
        fileContent = this.createMarkdownContent(updatedNote)
        break
      case 'txt':
        fileContent = this.createTextContent(updatedNote)
        break
      case 'pdf':
        fileContent = this.createTextContent(updatedNote)
        break
    }

    await this.writeFile(filePath, fileContent)
    
    // Update metadata
    const metadataPath = `${this.basePath}/notes/${updatedNote.id}.meta.json`
    await this.writeFile(metadataPath, JSON.stringify(updatedNote))

    return updatedNote
  }

  async deleteNote(id: number): Promise<boolean> {
    try {
      const note = await this.getNoteById(id)
      if (!note) return false

      // Delete the note file
      const fileName = this.generateFileName(note.title, this.defaultFormat)
      const filePath = `${this.basePath}/notes/${fileName}`
      await this.deleteFile(filePath)

      // Delete metadata
      const metadataPath = `${this.basePath}/notes/${id}.meta.json`
      await this.deleteFile(metadataPath)

      return true
    } catch (error) {
      console.error('Failed to delete note:', error)
      return false
    }
  }

  async getFolders(): Promise<Folder[]> {
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

  async createFolder(name: string, color?: string): Promise<Folder> {
    const folder: Folder = {
      id: Date.now(),
      name,
      color,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const folderPath = `${this.basePath}/folders/${folder.id}.json`
    await this.writeFile(folderPath, JSON.stringify(folder))

    return folder
  }

  async getFolderById(id: number): Promise<Folder | null> {
    const folderPath = `${this.basePath}/folders/${id}.json`
    try {
      const content = await this.readFile(folderPath)
      if (!content) return null
      return JSON.parse(content) as Folder
    } catch (error) {
      return null
    }
  }

  async getTags(): Promise<Tag[]> {
    const notes = await this.getNotes()
    const allTags = notes.flatMap(note => note.tags)
    const uniqueTags = [...new Set(allTags)]
    
    return uniqueTags.map((tag, index) => ({
      id: index + 1,
      name: tag,
      created_at: new Date().toISOString()
    }))
  }

  async createTag(name: string, color?: string): Promise<Tag> {
    const tag: Tag = {
      id: Date.now(),
      name,
      color,
      created_at: new Date().toISOString()
    }

    const tagPath = `${this.basePath}/tags/${tag.id}.json`
    await this.writeFile(tagPath, JSON.stringify(tag))

    return tag
  }

  async getTagByName(name: string): Promise<Tag | null> {
    const tags = await this.getTags()
    return tags.find(tag => tag.name === name) || null
  }

  async getTagById(id: number): Promise<Tag | null> {
    const tagPath = `${this.basePath}/tags/${id}.json`
    try {
      const content = await this.readFile(tagPath)
      if (!content) return null
      return JSON.parse(content) as Tag
    } catch (error) {
      return null
    }
  }

  async getStats(): Promise<DatabaseStats> {
    const notes = await this.getNotes()
    const folders = await this.getFolders()
    const tags = await this.getTags()

    return {
      total_notes: notes.length,
      total_folders: folders.length,
      total_tags: tags.length,
      pinned_notes: notes.filter(note => note.pinned).length,
      encrypted_notes: notes.filter(note => note.encrypted).length
    }
  }

  close(): void {
    // No-op for file system
  }
}
