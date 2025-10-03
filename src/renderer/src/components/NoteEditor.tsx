/**
 * Enhanced Note Editor Component for Scribe
 * 
 * This component provides a rich text editing experience with
 * auto-save, formatting options, and keyboard shortcuts.
 */

import React, { useState, useEffect, useRef } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Link, 
  Image, 
  Save,
  Pin,
  PinOff,
  Trash2,
  MoreVertical
} from 'lucide-react'
import { Note } from '../lib/models'

interface NoteEditorProps {
  note: Note | null
  onUpdate: (updatedNote: Note) => void
  onDelete?: (noteId: number) => void
  onPin?: (noteId: number, pinned: boolean) => void
}

export default function NoteEditor({ 
  note, 
  onUpdate, 
  onDelete, 
  onPin 
}: NoteEditorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

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
      }
    }, 1000) // Auto-save after 1 second of inactivity

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

  const handleSave = () => {
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
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
    
    // Ctrl+B for bold (placeholder for future rich text)
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault()
      // Future: Apply bold formatting
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
      {/* Editor Header */}
      <div className="px-6 py-4 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              onKeyDown={handleKeyDown}
              className="text-2xl font-semibold text-fluent-gray-800 dark:text-fluent-gray-100 bg-transparent border-none outline-none w-full placeholder-fluent-gray-400"
              placeholder="Note title..."
            />
          </div>
          <div className="flex items-center space-x-2">
            {isEditing && (
              <div className="flex items-center text-xs text-fluent-gray-500 dark:text-fluent-gray-400">
                <div className="w-2 h-2 bg-fluent-blue-500 rounded-full mr-2 animate-pulse" />
                Saving...
              </div>
            )}
            <button
              onClick={() => onPin?.(note.id, !note.pinned)}
              className={`p-2 rounded-md transition-colors ${
                note.pinned 
                  ? 'bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-600 dark:text-fluent-blue-400' 
                  : 'hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 text-fluent-gray-600 dark:text-fluent-gray-300'
              }`}
              title={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              {note.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSave}
              className="p-2 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded-md transition-colors text-fluent-gray-600 dark:text-fluent-gray-300"
              title="Save note (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFormatting(!showFormatting)}
              className="p-2 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded-md transition-colors text-fluent-gray-600 dark:text-fluent-gray-300"
              title="Formatting options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        {showFormatting && (
          <div className="flex items-center space-x-1 p-2 bg-fluent-gray-50 dark:bg-fluent-gray-800 rounded-md mb-4">
            <button className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded transition-colors" title="Bold (Ctrl+B)">
              <Bold className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded transition-colors" title="Italic (Ctrl+I)">
              <Italic className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded transition-colors" title="Underline (Ctrl+U)">
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-fluent-gray-300 dark:bg-fluent-gray-600 mx-2" />
            <button className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded transition-colors" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded transition-colors" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-fluent-gray-300 dark:bg-fluent-gray-600 mx-2" />
            <button className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded transition-colors" title="Add Link">
              <Link className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 rounded transition-colors" title="Add Image">
              <Image className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
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
          <div className="flex items-center space-x-2">
            {note.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs bg-fluent-gray-200 dark:bg-fluent-gray-700 text-fluent-gray-700 dark:text-fluent-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <textarea
          ref={contentRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          className="w-full h-full px-6 py-4 text-fluent-gray-800 dark:text-fluent-gray-100 bg-transparent resize-none outline-none leading-relaxed"
          placeholder="Start writing your note here...

You can use:
• Bullet points
• **Bold text** (future feature)
• *Italic text* (future feature)
• # Headers (future feature)

All changes are saved automatically."
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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onDelete?.(note.id)}
              className="p-2 hover:bg-fluent-red-100 dark:hover:bg-fluent-red-900/20 rounded-md transition-colors text-fluent-red-600 dark:text-fluent-red-400"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
