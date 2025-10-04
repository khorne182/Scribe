/**
 * Import Service for Scribe
 * 
 * Handles importing notes from various formats and sources
 */

import { Note, CreateNoteData } from './models'

export interface ImportOptions {
  preserveMetadata?: boolean
  addPrefix?: string
  targetFolder?: number
  defaultTags?: string[]
}

export interface ImportResult {
  success: boolean
  imported: number
  failed: number
  errors: string[]
  notes: Note[]
}

export class ImportService {
  /**
   * Import from file
   */
  static async importFromFile(file: File, options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [],
      notes: []
    }

    try {
      const content = await this.readFileContent(file)
      const notes = this.parseFileContent(content, file.name, options)
      
      result.notes = notes
      result.imported = notes.length
      result.success = true
    } catch (error) {
      result.errors.push(`Failed to import ${file.name}: ${error}`)
      result.failed = 1
    }

    return result
  }

  /**
   * Import from multiple files
   */
  static async importFromFiles(files: File[], options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [],
      notes: []
    }

    for (const file of files) {
      try {
        const fileResult = await this.importFromFile(file, options)
        result.notes.push(...fileResult.notes)
        result.imported += fileResult.imported
        result.failed += fileResult.failed
        result.errors.push(...fileResult.errors)
      } catch (error) {
        result.errors.push(`Failed to import ${file.name}: ${error}`)
        result.failed++
      }
    }

    result.success = result.imported > 0
    return result
  }

  /**
   * Import from folder (recursive)
   */
  static async importFromFolder(folder: FileList, options: ImportOptions = {}): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      failed: 0,
      errors: [],
      notes: []
    }

    const files = Array.from(folder)
    const supportedFiles = files.filter(file => this.isSupportedFile(file))

    for (const file of supportedFiles) {
      try {
        const fileResult = await this.importFromFile(file, options)
        result.notes.push(...fileResult.notes)
        result.imported += fileResult.imported
        result.failed += fileResult.failed
        result.errors.push(...fileResult.errors)
      } catch (error) {
        result.errors.push(`Failed to import ${file.name}: ${error}`)
        result.failed++
      }
    }

    result.success = result.imported > 0
    return result
  }

  /**
   * Read file content
   */
  private static readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string || '')
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsText(file)
    })
  }

  /**
   * Parse file content based on file type
   */
  private static parseFileContent(content: string, filename: string, options: ImportOptions): Note[] {
    const extension = this.getFileExtension(filename)
    
    switch (extension) {
      case 'md':
      case 'markdown':
        return this.parseMarkdown(content, filename, options)
      case 'txt':
        return this.parseText(content, filename, options)
      case 'html':
      case 'htm':
        return this.parseHTML(content, filename, options)
      case 'json':
        return this.parseJSON(content, filename, options)
      default:
        return this.parseText(content, filename, options)
    }
  }

  /**
   * Parse Markdown content
   */
  private static parseMarkdown(content: string, filename: string, options: ImportOptions): Note[] {
    const lines = content.split('\n')
    const notes: Note[] = []
    let currentNote: Partial<CreateNoteData> = {
      title: this.getTitleFromFilename(filename),
      content: '',
      tags: options.defaultTags || []
    }

    let inCodeBlock = false
    let codeBlockContent: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Handle code blocks
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // End of code block
          currentNote.content += '```\n' + codeBlockContent.join('\n') + '\n```\n'
          codeBlockContent = []
          inCodeBlock = false
        } else {
          // Start of code block
          inCodeBlock = true
          currentNote.content += line + '\n'
        }
        continue
      }

      if (inCodeBlock) {
        codeBlockContent.push(line)
        continue
      }

      // Handle headers
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 0
        const title = line.replace(/^#+\s*/, '').trim()
        
        if (level === 1 && title) {
          // New note
          if (currentNote.content.trim()) {
            notes.push(this.createNoteFromData(currentNote))
          }
          currentNote = {
            title: title,
            content: '',
            tags: options.defaultTags || []
          }
        } else {
          currentNote.content += line + '\n'
        }
      } else {
        currentNote.content += line + '\n'
      }
    }

    // Add the last note
    if (currentNote.content.trim()) {
      notes.push(this.createNoteFromData(currentNote))
    }

    return notes
  }

  /**
   * Parse plain text content
   */
  private static parseText(content: string, filename: string, options: ImportOptions): Note[] {
    const title = this.getTitleFromFilename(filename)
    const noteData: CreateNoteData = {
      title: options.addPrefix ? `${options.addPrefix} ${title}` : title,
      content: content.trim(),
      tags: options.defaultTags || [],
      folder_id: options.targetFolder
    }

    return [this.createNoteFromData(noteData)]
  }

  /**
   * Parse HTML content
   */
  private static parseHTML(content: string, filename: string, options: ImportOptions): Note[] {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    
    // Extract title
    const titleElement = doc.querySelector('title') || doc.querySelector('h1')
    const title = titleElement?.textContent?.trim() || this.getTitleFromFilename(filename)
    
    // Extract content
    const body = doc.querySelector('body')
    const contentText = body ? this.extractTextFromHTML(body) : content
    
    const noteData: CreateNoteData = {
      title: options.addPrefix ? `${options.addPrefix} ${title}` : title,
      content: contentText.trim(),
      tags: options.defaultTags || [],
      folder_id: options.targetFolder
    }

    return [this.createNoteFromData(noteData)]
  }

  /**
   * Parse JSON content
   */
  private static parseJSON(content: string, filename: string, options: ImportOptions): Note[] {
    try {
      const data = JSON.parse(content)
      
      if (Array.isArray(data)) {
        return data.map(item => this.createNoteFromData({
          title: item.title || this.getTitleFromFilename(filename),
          content: item.content || '',
          tags: [...(options.defaultTags || []), ...(item.tags || [])],
          folder_id: options.targetFolder
        }))
      } else {
        return [this.createNoteFromData({
          title: data.title || this.getTitleFromFilename(filename),
          content: data.content || '',
          tags: [...(options.defaultTags || []), ...(data.tags || [])],
          folder_id: options.targetFolder
        })]
      }
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  }

  /**
   * Extract text from HTML element
   */
  private static extractTextFromHTML(element: Element): string {
    let text = ''
    
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent || ''
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        text += this.extractTextFromHTML(node as Element)
      }
    }
    
    return text
  }

  /**
   * Create note from data
   */
  private static createNoteFromData(data: CreateNoteData): Note {
    return {
      id: Date.now() + Math.random(),
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      folder_id: data.folder_id,
      encrypted: false
    }
  }

  /**
   * Get title from filename
   */
  private static getTitleFromFilename(filename: string): string {
    return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
  }

  /**
   * Get file extension
   */
  private static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Check if file is supported
   */
  private static isSupportedFile(file: File): boolean {
    const supportedExtensions = ['md', 'markdown', 'txt', 'html', 'htm', 'json']
    const extension = this.getFileExtension(file.name)
    return supportedExtensions.includes(extension)
  }
}
