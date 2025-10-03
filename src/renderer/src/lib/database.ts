/**
 * Database Service Layer for Scribe
 * 
 * This module handles all database operations using SQLite.
 * Provides CRUD operations for notes, folders, and tags.
 */

import Database from 'better-sqlite3'
import { join } from 'path'
import { 
  Note, 
  Folder, 
  Tag, 
  CreateNoteData, 
  UpdateNoteData, 
  SearchFilters, 
  DatabaseStats 
} from './models'
import { EncryptionService } from './encryption'

export class DatabaseService {
  private db: Database.Database
  private encryptionKey?: string

  constructor(databasePath?: string) {
    // Use a default path for now - this will be improved in Phase 4
    const dbPath = databasePath || 'scribe.db'
    
    // Initialize SQLite database
    this.db = new Database(dbPath)
    this.initializeDatabase()
  }

  /**
   * Initialize database schema
   */
  private initializeDatabase(): void {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON')

    // Create tables
    this.db.exec(`
      -- Folders table
      CREATE TABLE IF NOT EXISTS folders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Tags table
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Notes table
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT DEFAULT '[]', -- JSON array of tag names
        pinned BOOLEAN DEFAULT 0,
        folder_id INTEGER,
        encrypted BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder_id);
      CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
      CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at);
      CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at);
    `)

    // Create default folder if none exists
    const folderCount = this.db.prepare('SELECT COUNT(*) as count FROM folders').get() as { count: number }
    if (folderCount.count === 0) {
      this.db.prepare('INSERT INTO folders (name, color) VALUES (?, ?)')
        .run('General', '#3b82f6')
    }
  }

  /**
   * Set encryption key for sensitive data
   */
  setEncryptionKey(key: string): void {
    this.encryptionKey = key
  }

  /**
   * Create a new note
   */
  createNote(data: CreateNoteData): Note {
    const { title, content, tags = [], pinned = false, folder_id, encrypted = false } = data
    
    // Encrypt content if encryption is enabled
    let finalContent = content
    if (encrypted && this.encryptionKey) {
      finalContent = EncryptionService.encrypt(content, this.encryptionKey)
    }

    const stmt = this.db.prepare(`
      INSERT INTO notes (title, content, tags, pinned, folder_id, encrypted)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(title, finalContent, JSON.stringify(tags), pinned, folder_id, encrypted)
    
    return this.getNoteById(result.lastInsertRowid as number)!
  }

  /**
   * Get note by ID
   */
  getNoteById(id: number): Note | null {
    const stmt = this.db.prepare('SELECT * FROM notes WHERE id = ?')
    const row = stmt.get(id) as any

    if (!row) return null

    // Decrypt content if encrypted
    let content = row.content
    if (row.encrypted && this.encryptionKey) {
      try {
        content = EncryptionService.decrypt(row.content, this.encryptionKey)
      } catch (error) {
        console.error('Failed to decrypt note content:', error)
        content = '[Encrypted - Decryption Failed]'
      }
    }

    return {
      id: row.id,
      title: row.title,
      content,
      tags: JSON.parse(row.tags || '[]'),
      pinned: Boolean(row.pinned),
      created_at: row.created_at,
      updated_at: row.updated_at,
      folder_id: row.folder_id,
      encrypted: Boolean(row.encrypted)
    }
  }

  /**
   * Get all notes with optional filtering
   */
  getNotes(filters: SearchFilters = {}): Note[] {
    let query = 'SELECT * FROM notes WHERE 1=1'
    const params: any[] = []

    if (filters.query) {
      query += ' AND (title LIKE ? OR content LIKE ?)'
      const searchTerm = `%${filters.query}%`
      params.push(searchTerm, searchTerm)
    }

    if (filters.pinned !== undefined) {
      query += ' AND pinned = ?'
      params.push(filters.pinned)
    }

    if (filters.folder_id) {
      query += ' AND folder_id = ?'
      params.push(filters.folder_id)
    }

    if (filters.tags && filters.tags.length > 0) {
      query += ' AND ('
      filters.tags.forEach((tag, index) => {
        if (index > 0) query += ' OR '
        query += 'tags LIKE ?'
        params.push(`%"${tag}"%`)
      })
      query += ')'
    }

    query += ' ORDER BY pinned DESC, updated_at DESC'

    const stmt = this.db.prepare(query)
    const rows = stmt.all(...params) as any[]

    return rows.map(row => {
      // Decrypt content if encrypted
      let content = row.content
      if (row.encrypted && this.encryptionKey) {
        try {
          content = EncryptionService.decrypt(row.content, this.encryptionKey)
        } catch (error) {
          console.error('Failed to decrypt note content:', error)
          content = '[Encrypted - Decryption Failed]'
        }
      }

      return {
        id: row.id,
        title: row.title,
        content,
        tags: JSON.parse(row.tags || '[]'),
        pinned: Boolean(row.pinned),
        created_at: row.created_at,
        updated_at: row.updated_at,
        folder_id: row.folder_id,
        encrypted: Boolean(row.encrypted)
      }
    })
  }

  /**
   * Update a note
   */
  updateNote(data: UpdateNoteData): Note | null {
    const { id, title, content, tags, pinned, folder_id, encrypted } = data
    
    // Get current note to check if content changed
    const currentNote = this.getNoteById(id)
    if (!currentNote) return null

    // Prepare update fields
    const updateFields: string[] = []
    const params: any[] = []

    if (title !== undefined) {
      updateFields.push('title = ?')
      params.push(title)
    }

    if (content !== undefined) {
      let finalContent = content
      if (encrypted && this.encryptionKey) {
        finalContent = EncryptionService.encrypt(content, this.encryptionKey)
      }
      updateFields.push('content = ?')
      params.push(finalContent)
    }

    if (tags !== undefined) {
      updateFields.push('tags = ?')
      params.push(JSON.stringify(tags))
    }

    if (pinned !== undefined) {
      updateFields.push('pinned = ?')
      params.push(pinned)
    }

    if (folder_id !== undefined) {
      updateFields.push('folder_id = ?')
      params.push(folder_id)
    }

    if (encrypted !== undefined) {
      updateFields.push('encrypted = ?')
      params.push(encrypted)
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    const query = `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ?`
    const stmt = this.db.prepare(query)
    stmt.run(...params)

    return this.getNoteById(id)
  }

  /**
   * Delete a note
   */
  deleteNote(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM notes WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  /**
   * Get all folders
   */
  getFolders(): Folder[] {
    const stmt = this.db.prepare('SELECT * FROM folders ORDER BY name')
    return stmt.all() as Folder[]
  }

  /**
   * Create a new folder
   */
  createFolder(name: string, color?: string): Folder {
    const stmt = this.db.prepare('INSERT INTO folders (name, color) VALUES (?, ?)')
    const result = stmt.run(name, color)
    
    return this.getFolderById(result.lastInsertRowid as number)!
  }

  /**
   * Get folder by ID
   */
  getFolderById(id: number): Folder | null {
    const stmt = this.db.prepare('SELECT * FROM folders WHERE id = ?')
    return stmt.get(id) as Folder | null
  }

  /**
   * Get all tags
   */
  getTags(): Tag[] {
    const stmt = this.db.prepare('SELECT * FROM tags ORDER BY name')
    return stmt.all() as Tag[]
  }

  /**
   * Create or get existing tag
   */
  createTag(name: string, color?: string): Tag {
    // Try to get existing tag first
    const existingTag = this.getTagByName(name)
    if (existingTag) return existingTag

    const stmt = this.db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)')
    const result = stmt.run(name, color)
    
    return this.getTagById(result.lastInsertRowid as number)!
  }

  /**
   * Get tag by name
   */
  getTagByName(name: string): Tag | null {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE name = ?')
    return stmt.get(name) as Tag | null
  }

  /**
   * Get tag by ID
   */
  getTagById(id: number): Tag | null {
    const stmt = this.db.prepare('SELECT * FROM tags WHERE id = ?')
    return stmt.get(id) as Tag | null
  }

  /**
   * Get database statistics
   */
  getStats(): DatabaseStats {
    const totalNotes = this.db.prepare('SELECT COUNT(*) as count FROM notes').get() as { count: number }
    const totalFolders = this.db.prepare('SELECT COUNT(*) as count FROM folders').get() as { count: number }
    const totalTags = this.db.prepare('SELECT COUNT(*) as count FROM tags').get() as { count: number }
    const pinnedNotes = this.db.prepare('SELECT COUNT(*) as count FROM notes WHERE pinned = 1').get() as { count: number }
    const encryptedNotes = this.db.prepare('SELECT COUNT(*) as count FROM notes WHERE encrypted = 1').get() as { count: number }

    return {
      total_notes: totalNotes.count,
      total_folders: totalFolders.count,
      total_tags: totalTags.count,
      pinned_notes: pinnedNotes.count,
      encrypted_notes: encryptedNotes.count
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close()
  }
}
