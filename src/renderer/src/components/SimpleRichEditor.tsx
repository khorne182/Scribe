/**
 * Simple Rich Editor Component for Scribe
 * 
 * This is a simplified version without Quill.js to avoid import issues.
 * Has all the toolbar features but uses a simple textarea for now.
 */

import React, { useState, useEffect } from 'react'
import { 
  Star,
  Move,
  Copy,
  Plus,
  Save,
  Printer,
  Trash2,
  Download,
  Upload,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal,
  Highlighter,
  Palette
} from 'lucide-react'
import { Note } from '../lib/models'
import TagInput from './TagInput'
import { SimpleExportService } from '../lib/simpleExportService'

interface SimpleRichEditorProps {
  note: Note | null
  onUpdate: (updatedNote: Note) => void
  onDelete?: (noteId: number) => void
  onPin?: (noteId: number, pinned: boolean) => void
  onCopy?: (note: Note) => void
  onCreate?: () => void
  onSave?: () => void
  onPrint?: () => void
  availableTags?: string[]
  onTagsRefresh?: () => void
}

export default function SimpleRichEditor({
  note,
  onUpdate,
  onDelete,
  onPin,
  onCopy,
  onCreate,
  onSave,
  onPrint,
  availableTags = [],
  onTagsRefresh
}: SimpleRichEditorProps) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTextColor, setSelectedTextColor] = useState('#000000')
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('#ffff00')
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    textColor: null as string | null,
    highlightColor: null as string | null
  })
  const [selectedHeading, setSelectedHeading] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  // Update local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    } else {
      setTitle('')
      setContent('')
    }
  }, [note])

  // Auto-save functionality
  useEffect(() => {
    if (!note || !isEditing) return

    const timeoutId = setTimeout(() => {
      if (note && (title !== note.title || content !== note.content)) {
        const updatedNote = {
          ...note,
          title,
          content,
          updated_at: new Date().toISOString()
        }
        onUpdate(updatedNote)
        setIsEditing(false)
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [title, content, note, isEditing, onUpdate])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    setIsEditing(true)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setIsEditing(true)
  }

  // Formatting functions
  const toggleBold = () => {
    setTextFormatting(prev => ({ ...prev, bold: !prev.bold }))
    setIsEditing(true)
  }

  const toggleItalic = () => {
    setTextFormatting(prev => ({ ...prev, italic: !prev.italic }))
    setIsEditing(true)
  }

  const toggleUnderline = () => {
    setTextFormatting(prev => ({ ...prev, underline: !prev.underline }))
    setIsEditing(true)
  }

  const toggleStrikethrough = () => {
    setTextFormatting(prev => ({ ...prev, strikethrough: !prev.strikethrough }))
    setIsEditing(true)
  }

  const insertLink = () => {
    const url = prompt('Enter URL:')
    if (url) {
      const linkText = prompt('Enter link text:') || url
      const linkMarkdown = `[${linkText}](${url})`
      setContent(prev => prev + linkText)
      setIsEditing(true)
    }
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      const altText = prompt('Enter alt text:') || 'Image'
      const imageMarkdown = `![${altText}](${url})`
      setContent(prev => prev + imageMarkdown)
      setIsEditing(true)
    }
  }

  // Handle text selection
  const handleTextSelection = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    const selectedText = target.value.substring(start, end)
    
    setSelectionStart(start)
    setSelectionEnd(end)
    setSelectedText(selectedText)
  }

  // Apply visual highlighting (for display only)
  const applyVisualHighlight = () => {
    if (selectedText && selectionStart !== selectionEnd) {
      // Toggle: if already has this highlight, reset to default
      if (textFormatting.highlightColor === selectedHighlightColor) {
        setTextFormatting(prev => ({ ...prev, highlightColor: null }))
      } else {
        setTextFormatting(prev => ({ ...prev, highlightColor: selectedHighlightColor }))
      }
      setIsEditing(true)
    }
  }

  // Apply markdown highlighting
  const applyMarkdownHighlight = () => {
    if (selectedText && selectionStart !== selectionEnd) {
      const beforeText = content.substring(0, selectionStart)
      const afterText = content.substring(selectionEnd)
      const highlightedText = `<mark style="background-color: ${selectedHighlightColor}">${selectedText}</mark>`
      
      setContent(beforeText + highlightedText + afterText)
      setIsEditing(true)
    }
  }

  // Apply visual text color (for display only)
  const applyVisualTextColor = () => {
    if (selectedText && selectionStart !== selectionEnd) {
      // Toggle: if already has this color, reset to default
      if (textFormatting.textColor === selectedTextColor) {
        setTextFormatting(prev => ({ ...prev, textColor: null }))
      } else {
        setTextFormatting(prev => ({ ...prev, textColor: selectedTextColor }))
      }
      setIsEditing(true)
    }
  }

  // Apply markdown text color
  const applyMarkdownTextColor = () => {
    if (selectedText && selectionStart !== selectionEnd) {
      const beforeText = content.substring(0, selectionStart)
      const afterText = content.substring(selectionEnd)
      const coloredText = `<span style="color: ${selectedTextColor}">${selectedText}</span>`
      
      setContent(beforeText + coloredText + afterText)
      setIsEditing(true)
    }
  }

  // Apply heading formatting
  const applyHeading = (headingLevel: string) => {
    if (selectedText && selectionStart !== selectionEnd) {
      const beforeText = content.substring(0, selectionStart)
      const afterText = content.substring(selectionEnd)
      let formattedText = selectedText
      
      switch (headingLevel) {
        case '1':
          formattedText = `# ${selectedText}`
          break
        case '2':
          formattedText = `## ${selectedText}`
          break
        case '3':
          formattedText = `### ${selectedText}`
          break
        default:
          formattedText = selectedText
      }
      
      setContent(beforeText + formattedText + afterText)
      setIsEditing(true)
    }
  }

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          toggleBold()
          break
        case 'i':
          e.preventDefault()
          toggleItalic()
          break
        case 'u':
          e.preventDefault()
          toggleUnderline()
          break
        case 's':
          e.preventDefault()
          handleSave()
          break
      }
    }
  }

  const handleSave = () => {
    if (note) {
      const updatedNote = {
        ...note,
        title,
        content,
        updated_at: new Date().toISOString()
      }
      onUpdate(updatedNote)
      setIsEditing(false)
      
      // Create downloadable file
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'untitled'}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('File saved:', `${title || 'untitled'}.txt`)
    }
  }

  // Export note in markdown or text format
  const handleExport = () => {
    if (note) {
      const updatedNote = {
        ...note,
        title,
        content,
        updated_at: new Date().toISOString()
      }
      
      try {
        // Export as Markdown by default
        SimpleExportService.exportNote(updatedNote, {
          format: 'markdown',
          includeMetadata: true,
          includeTags: true,
          includeTimestamps: true
        })
        console.log('Note exported as Markdown successfully')
      } catch (error) {
        console.error('Markdown export failed, trying text export:', error)
        try {
          // Fallback to text export
          SimpleExportService.exportNote(updatedNote, {
            format: 'txt',
            includeMetadata: true,
            includeTags: true,
            includeTimestamps: true
          })
          console.log('Note exported as text successfully')
        } catch (textError) {
          console.error('Text export also failed:', textError)
        }
      }
    }
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

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-fluent-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-fluent-gray-200 dark:bg-fluent-gray-700 rounded-full flex items-center justify-center">
            <span className="text-2xl">📝</span>
          </div>
          <h3 className="text-lg font-medium text-fluent-gray-800 dark:text-fluent-gray-100 mb-2">
            Select a note to view
          </h3>
          <p className="text-fluent-gray-500 dark:text-fluent-gray-400">
            Choose a note from the sidebar or create a new one
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-fluent-gray-900">
      {/* Custom Toolbar - Matching the image exactly */}
      <div className="border-b border-fluent-gray-200 dark:border-fluent-gray-700">
        {/* Top Row - File Management */}
        <div className="flex items-center justify-between px-4 py-2 bg-fluent-gray-50 dark:bg-fluent-gray-800">
          <div className="flex items-center space-x-1">
            {/* Pin/Star */}
            <button
              onClick={() => onPin?.(note.id, !note.pinned)}
              className={`p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors ${
                note.pinned ? 'text-fluent-blue-600' : 'text-fluent-blue-600'
              }`}
              title={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Star className="w-4 h-4" fill={note.pinned ? 'currentColor' : 'none'} />
            </button>

            {/* Move */}
            <button
              className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600"
              title="Move note"
            >
              <Move className="w-4 h-4" />
            </button>

            {/* Copy */}
            <button
              onClick={() => note && onCopy?.(note)}
              className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600"
              title="Copy note"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Add */}
            <button
              onClick={() => {
                console.log('Add button clicked, onCreate:', onCreate)
                onCreate?.()
              }}
              className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600"
              title="Create new note"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600"
              title="Save note (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600"
              title="Export note"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Print */}
            <button
              onClick={onPrint}
              className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600"
              title="Print note"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete?.(note.id)}
              className="p-2 rounded hover:bg-fluent-red-100 dark:hover:bg-fluent-red-900/20 transition-colors text-fluent-red-600 dark:text-fluent-red-400"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Auto-save indicator */}
          {isEditing && (
            <div className="flex items-center text-xs text-fluent-gray-500 dark:text-fluent-gray-400">
              <div className="w-2 h-2 bg-fluent-blue-500 rounded-full mr-2 animate-pulse" />
              Saving...
            </div>
          )}
        </div>

        {/* Formatting Toolbar - Second Row */}
        <div className="flex items-center px-4 py-2 bg-white dark:bg-fluent-gray-900 border-t border-fluent-gray-200 dark:border-fluent-gray-700">
          {/* Text Formatting */}
          <div className="flex items-center space-x-1 mr-4">
            <button 
              onClick={toggleBold}
              className={`p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors ${
                textFormatting.bold ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700' : 'text-fluent-blue-600'
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              onClick={toggleItalic}
              className={`p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors ${
                textFormatting.italic ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700' : 'text-fluent-blue-600'
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              onClick={toggleUnderline}
              className={`p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors ${
                textFormatting.underline ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700' : 'text-fluent-blue-600'
              }`}
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button 
              onClick={toggleStrikethrough}
              className={`p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors ${
                textFormatting.strikethrough ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700' : 'text-fluent-blue-600'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 mr-4">
            <button className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center space-x-1 mr-4">
            <button className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600" title="Align Left">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600" title="Align Center">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600" title="Align Right">
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Links and Images */}
          <div className="flex items-center space-x-1 mr-4">
            <button 
              onClick={insertLink}
              className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600" 
              title="Insert Link"
            >
              <Link className="w-4 h-4" />
            </button>
            <button 
              onClick={insertImage}
              className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600" 
              title="Insert Image"
            >
              <Image className="w-4 h-4" />
            </button>
          </div>

          {/* Text Color and Highlighter */}
          <div className="flex items-center space-x-1 mr-4">
            <div className="flex items-center space-x-1">
              <button
                onClick={applyVisualTextColor}
                className={`p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors ${
                  textFormatting.textColor === selectedTextColor 
                    ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700' 
                    : 'text-fluent-blue-600'
                }`}
                title="Apply Visual Text Color"
              >
                <Palette className="w-4 h-4" />
              </button>
              <button
                onClick={applyMarkdownTextColor}
                className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600"
                title="Apply Markdown Text Color"
              >
                <Palette className="w-4 h-4" />
              </button>
              <input
                type="color"
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="w-6 h-6 rounded border border-fluent-gray-300 dark:border-fluent-gray-600 cursor-pointer"
                title="Choose Text Color"
              />
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={applyVisualHighlight}
                className={`p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors ${
                  textFormatting.highlightColor === selectedHighlightColor 
                    ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700' 
                    : 'text-fluent-blue-600'
                }`}
                title="Apply Visual Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <button
                onClick={applyMarkdownHighlight}
                className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600"
                title="Apply Markdown Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </button>
              <input
                type="color"
                value={selectedHighlightColor}
                onChange={(e) => setSelectedHighlightColor(e.target.value)}
                className="w-6 h-6 rounded border border-fluent-gray-300 dark:border-fluent-gray-600 cursor-pointer"
                title="Choose Highlight Color"
              />
            </div>
          </div>

          {/* More Options */}
          <div className="flex items-center space-x-1">
            <select 
              value={selectedHeading}
              onChange={(e) => {
                setSelectedHeading(e.target.value)
                applyHeading(e.target.value)
              }}
              className="text-sm border border-fluent-gray-300 dark:border-fluent-gray-600 rounded px-2 py-1 bg-white dark:bg-fluent-gray-800 text-fluent-gray-800 dark:text-fluent-gray-100"
            >
              <option value="">Normal</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>
            <button className="p-2 rounded hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 transition-colors text-fluent-blue-600" title="More Options">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-6 py-4 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
          className="text-2xl font-semibold text-fluent-gray-800 dark:text-fluent-gray-100 bg-transparent border-none outline-none w-full placeholder-fluent-gray-400"
          placeholder="Note title..."
        />
        {/* Tags Input */}
        <div className="mt-3">
          <TagInput
            tags={note.tags || []}
            availableTags={availableTags}
            onTagsChange={(newTags) => {
              const updatedNote = { ...note, tags: newTags }
              onUpdate(updatedNote)
              // Refresh available tags after adding new ones
              if (onTagsRefresh) {
                setTimeout(() => onTagsRefresh(), 100)
              }
            }}
            placeholder="Add tags..."
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4">
            <span className="text-xs text-fluent-gray-500 dark:text-fluent-gray-400">
              Last edited {formatDate(note.updated_at)}
            </span>
            {note.encrypted && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-fluent-green-100 dark:bg-fluent-green-900/20 text-fluent-green-700 dark:text-fluent-green-300">
                🔒 Encrypted
              </span>
            )}
          </div>
          {isEditing && (
            <span className="text-xs text-fluent-blue-600 dark:text-fluent-blue-400">
              • Editing...
            </span>
          )}
        </div>
      </div>

      {/* Simple Text Editor */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          onSelect={handleTextSelection}
          className="w-full h-full px-6 py-4 text-fluent-gray-800 dark:text-fluent-gray-100 bg-transparent resize-none outline-none leading-relaxed"
          placeholder="Start writing your note here... (Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline, Ctrl+S to save)"
          style={{
            fontWeight: textFormatting.bold ? 'bold' : 'normal',
            fontStyle: textFormatting.italic ? 'italic' : 'normal',
            textDecoration: textFormatting.underline ? 'underline' : 'none',
            textDecorationLine: textFormatting.strikethrough ? 'line-through' : 'none',
            color: textFormatting.textColor || undefined,
            backgroundColor: textFormatting.highlightColor || undefined
          }}
        />
      </div>

      {/* Editor Footer */}
      <div className="px-6 py-3 border-t border-fluent-gray-200 dark:border-fluent-gray-700 bg-fluent-gray-50 dark:bg-fluent-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs text-fluent-gray-500 dark:text-fluent-gray-400">
            <span>Created {formatDate(note.created_at)}</span>
            <span>•</span>
            <span>{content.length} characters</span>
            <span>•</span>
            <span>{content.split('\n').length} lines</span>
          </div>
        </div>
      </div>
    </div>
  )
}
