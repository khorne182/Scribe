/**
 * Export Service for Scribe
 * 
 * Handles exporting notes to various formats: PDF, Markdown, HTML, Plain Text
 */

import jsPDF from 'jspdf'
import { Note } from './models'

export interface ExportOptions {
  format: 'pdf' | 'markdown' | 'html' | 'txt'
  includeMetadata?: boolean
  includeTags?: boolean
  includeTimestamps?: boolean
  filename?: string
}

export class ExportService {
  /**
   * Export a single note
   */
  static exportNote(note: Note, options: ExportOptions): void {
    const filename = options.filename || this.generateFilename(note.title, options.format)
    
    switch (options.format) {
      case 'pdf':
        this.exportToPDF(note, filename, options)
        break
      case 'markdown':
        this.exportToMarkdown(note, filename, options)
        break
      case 'html':
        this.exportToHTML(note, filename, options)
        break
      case 'txt':
        this.exportToText(note, filename, options)
        break
    }
  }

  /**
   * Export multiple notes
   */
  static exportNotes(notes: Note[], options: ExportOptions): void {
    const filename = options.filename || `scribe-notes-${new Date().toISOString().split('T')[0]}`
    
    switch (options.format) {
      case 'pdf':
        this.exportMultipleToPDF(notes, filename, options)
        break
      case 'markdown':
        this.exportMultipleToMarkdown(notes, filename, options)
        break
      case 'html':
        this.exportMultipleToHTML(notes, filename, options)
        break
      case 'txt':
        this.exportMultipleToText(notes, filename, options)
        break
    }
  }

  /**
   * Export to PDF
   */
  private static exportToPDF(note: Note, filename: string, options: ExportOptions): void {
    const doc = new jsPDF()
    
    // Add title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(note.title, 20, 30)
    
    // Add metadata if requested
    let yPosition = 50
    if (options.includeMetadata) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      
      if (options.includeTimestamps) {
        doc.text(`Created: ${new Date(note.created_at).toLocaleDateString()}`, 20, yPosition)
        yPosition += 10
        doc.text(`Updated: ${new Date(note.updated_at).toLocaleDateString()}`, 20, yPosition)
        yPosition += 10
      }
      
      if (options.includeTags && note.tags.length > 0) {
        doc.text(`Tags: ${note.tags.join(', ')}`, 20, yPosition)
        yPosition += 10
      }
      
      yPosition += 10
    }
    
    // Add content
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    
    // Split content into lines and add to PDF
    const lines = doc.splitTextToSize(note.content, 170)
    doc.text(lines, 20, yPosition)
    
    // Save the PDF
    doc.save(filename)
  }

  /**
   * Export multiple notes to PDF
   */
  private static exportMultipleToPDF(notes: Note[], filename: string, options: ExportOptions): void {
    const doc = new jsPDF()
    let isFirstPage = true
    
    notes.forEach((note, index) => {
      if (!isFirstPage) {
        doc.addPage()
      }
      
      // Add note title
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text(note.title, 20, 30)
      
      // Add metadata if requested
      let yPosition = 50
      if (options.includeMetadata) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        if (options.includeTimestamps) {
          doc.text(`Created: ${new Date(note.created_at).toLocaleDateString()}`, 20, yPosition)
          yPosition += 8
          doc.text(`Updated: ${new Date(note.updated_at).toLocaleDateString()}`, 20, yPosition)
          yPosition += 8
        }
        
        if (options.includeTags && note.tags.length > 0) {
          doc.text(`Tags: ${note.tags.join(', ')}`, 20, yPosition)
          yPosition += 8
        }
        
        yPosition += 10
      }
      
      // Add content
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      
      const lines = doc.splitTextToSize(note.content, 170)
      doc.text(lines, 20, yPosition)
      
      isFirstPage = false
    })
    
    doc.save(filename)
  }

  /**
   * Export to Markdown
   */
  private static exportToMarkdown(note: Note, filename: string, options: ExportOptions): void {
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
   * Export multiple notes to Markdown
   */
  private static exportMultipleToMarkdown(notes: Note[], filename: string, options: ExportOptions): void {
    let content = `# Scribe Notes Export\n\n`
    content += `**Export Date:** ${new Date().toLocaleDateString()}\n`
    content += `**Total Notes:** ${notes.length}\n\n`
    content += '---\n\n'
    
    notes.forEach((note, index) => {
      content += `## ${note.title}\n\n`
      
      if (options.includeMetadata) {
        if (options.includeTimestamps) {
          content += `**Created:** ${new Date(note.created_at).toLocaleDateString()}\n`
          content += `**Updated:** ${new Date(note.updated_at).toLocaleDateString()}\n`
        }
        
        if (options.includeTags && note.tags.length > 0) {
          content += `**Tags:** ${note.tags.map(tag => `#${tag}`).join(' ')}\n`
        }
        
        content += '\n'
      }
      
      content += note.content
      content += '\n\n---\n\n'
    })
    
    this.downloadFile(content, filename, 'text/markdown')
  }

  /**
   * Export to HTML
   */
  private static exportToHTML(note: Note, filename: string, options: ExportOptions): void {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${note.title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .tags { color: #007acc; }
        .content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>${note.title}</h1>`
    
    if (options.includeMetadata) {
      html += `\n    <div class="metadata">`
      
      if (options.includeTimestamps) {
        html += `\n        <p><strong>Created:</strong> ${new Date(note.created_at).toLocaleDateString()}</p>`
        html += `\n        <p><strong>Updated:</strong> ${new Date(note.updated_at).toLocaleDateString()}</p>`
      }
      
      if (options.includeTags && note.tags.length > 0) {
        html += `\n        <p><strong>Tags:</strong> <span class="tags">${note.tags.map(tag => `#${tag}`).join(' ')}</span></p>`
      }
      
      html += `\n    </div>`
    }
    
    html += `\n    <div class="content">${this.escapeHtml(note.content)}</div>
</body>
</html>`
    
    this.downloadFile(html, filename, 'text/html')
  }

  /**
   * Export multiple notes to HTML
   */
  private static exportMultipleToHTML(notes: Note[], filename: string, options: ExportOptions): void {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scribe Notes Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        h2 { color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 40px; }
        .metadata { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .tags { color: #007acc; }
        .content { white-space: pre-wrap; margin-bottom: 30px; }
        .note-separator { border-top: 2px solid #007acc; margin: 40px 0; }
    </style>
</head>
<body>
    <h1>Scribe Notes Export</h1>
    <div class="metadata">
        <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Notes:</strong> ${notes.length}</p>
    </div>`
    
    notes.forEach((note, index) => {
      html += `\n    <h2>${note.title}</h2>`
      
      if (options.includeMetadata) {
        html += `\n    <div class="metadata">`
        
        if (options.includeTimestamps) {
          html += `\n        <p><strong>Created:</strong> ${new Date(note.created_at).toLocaleDateString()}</p>`
          html += `\n        <p><strong>Updated:</strong> ${new Date(note.updated_at).toLocaleDateString()}</p>`
        }
        
        if (options.includeTags && note.tags.length > 0) {
          html += `\n        <p><strong>Tags:</strong> <span class="tags">${note.tags.map(tag => `#${tag}`).join(' ')}</span></p>`
        }
        
        html += `\n    </div>`
      }
      
      html += `\n    <div class="content">${this.escapeHtml(note.content)}</div>`
      
      if (index < notes.length - 1) {
        html += `\n    <div class="note-separator"></div>`
      }
    })
    
    html += `\n</body>\n</html>`
    
    this.downloadFile(html, filename, 'text/html')
  }

  /**
   * Export to Plain Text
   */
  private static exportToText(note: Note, filename: string, options: ExportOptions): void {
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
   * Export multiple notes to Plain Text
   */
  private static exportMultipleToText(notes: Note[], filename: string, options: ExportOptions): void {
    let content = `Scribe Notes Export\n${'='.repeat(20)}\n\n`
    content += `Export Date: ${new Date().toLocaleDateString()}\n`
    content += `Total Notes: ${notes.length}\n\n`
    content += `${'='.repeat(50)}\n\n`
    
    notes.forEach((note, index) => {
      content += `${note.title}\n${'='.repeat(note.title.length)}\n\n`
      
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
      content += `\n\n${'='.repeat(50)}\n\n`
    })
    
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

  /**
   * Escape HTML
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}
