/**
 * Simple Export Service for Scribe
 * 
 * Handles exporting notes to Markdown and Text formats only
 * No complex dependencies - just simple file downloads
 */

import { Note } from './models'

export interface SimpleExportOptions {
  format: 'markdown' | 'txt'
  includeMetadata?: boolean
  includeTags?: boolean
  includeTimestamps?: boolean
}

export class SimpleExportService {
  /**
   * Export a single note
   */
  static exportNote(note: Note, options: SimpleExportOptions): void {
    const filename = this.generateFilename(note.title, options.format)
    
    switch (options.format) {
      case 'markdown':
        this.exportToMarkdown(note, filename, options)
        break
      case 'txt':
        this.exportToText(note, filename, options)
        break
    }
  }

  /**
   * Export to Markdown
   */
  private static exportToMarkdown(note: Note, filename: string, options: SimpleExportOptions): void {
    let content = `# ${note.title}\n\n`
    
    if (options.includeMetadata) {
      if (options.includeTimestamps) {
        content += `**Created:** ${new Date(note.created_at).toLocaleDateString()}\n`
        content += `**Updated:** ${new Date(note.updated_at).toLocaleDateString()}\n\n`
      }
      
      if (options.includeTags && note.tags.length > 0) {
        content += `**Tags:** ${note.tags.map(tag => `#${tag}`).join(' ')}\n\n`
      }
    }
    
    content += note.content
    
    this.downloadFile(content, filename, 'text/markdown')
  }

  /**
   * Export to Plain Text
   */
  private static exportToText(note: Note, filename: string, options: SimpleExportOptions): void {
    let content = `${note.title}\n${'='.repeat(note.title.length)}\n\n`
    
    if (options.includeMetadata) {
      if (options.includeTimestamps) {
        content += `Created: ${new Date(note.created_at).toLocaleDateString()}\n`
        content += `Updated: ${new Date(note.updated_at).toLocaleDateString()}\n\n`
      }
      
      if (options.includeTags && note.tags.length > 0) {
        content += `Tags: ${note.tags.join(', ')}\n\n`
      }
    }
    
    content += note.content
    
    this.downloadFile(content, filename, 'text/plain')
  }

  /**
   * Generate filename
   */
  private static generateFilename(title: string, format: string): string {
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '-')
    const timestamp = new Date().toISOString().split('T')[0]
    return `${sanitizedTitle}-${timestamp}.${format}`
  }

  /**
   * Download file
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
