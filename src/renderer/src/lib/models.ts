/**
 * Database Models and TypeScript Interfaces for Scribe
 * 
 * This file defines all the data structures used throughout the application.
 * These interfaces ensure type safety and consistency across the app.
 */

export interface Note {
  id: number
  title: string
  content: string
  tags: string[]
  pinned: boolean
  created_at: string
  updated_at: string
  folder_id?: number
  encrypted: boolean
}

export interface Folder {
  id: number
  name: string
  color?: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  color?: string
  created_at: string
}

export interface DatabaseConfig {
  path: string
  encryption_key?: string
}

export interface CreateNoteData {
  title: string
  content: string
  tags?: string[]
  pinned?: boolean
  folder_id?: number
  encrypted?: boolean
}

export interface UpdateNoteData {
  id: number
  title?: string
  content?: string
  tags?: string[]
  pinned?: boolean
  folder_id?: number
  encrypted?: boolean
}

export interface SearchFilters {
  query?: string
  tags?: string[]
  folder_id?: number
  pinned?: boolean
  date_from?: string
  date_to?: string
}

export interface DatabaseStats {
  total_notes: number
  total_folders: number
  total_tags: number
  pinned_notes: number
  encrypted_notes: number
}
