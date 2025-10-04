/**
 * Enhanced Rich Text Editor Component for Scribe
 * 
 * This component provides a full-featured rich text editor matching the toolbar image.
 * Includes all formatting features except collaboration (as requested).
 */

import React, { useRef, useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { 
  Star,
  Move,
  Copy,
  Plus,
  Save,
  Printer,
  Trash2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoreHorizontal
} from 'lucide-react'
import { Note } from '../lib/models'

interface EnhancedRichEditorProps {
  note: Note | null
  onUpdate: (updatedNote: Note) => void
  onDelete?: (noteId: number) => void
  onPin?: (noteId: number, pinned: boolean) => void
  onCopy?: (note: Note) => void
  onCreate?: () => void
  onSave?: () => void
  onPrint?: () => void
}

export default function EnhancedRichEditor({
  note,
  onUpdate,
  onDelete,
  onPin,
  onCopy,
  onCreate,
  onSave,
  onPrint
}: EnhancedRichEditorProps) {
  const quillRef = useRef<ReactQuill>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isEditing, setIsEditing] = useState(false)

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

  const handleContentChange = (value: string) => {
    setContent(value)
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
    onSave?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      handleSave()
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

  // Custom Quill toolbar configuration
  const modules = {
    toolbar: {
      container: '#toolbar',
    },
    clipboard: {
      matchVisual: false,
    }
  }

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align', 'color', 'background',
    'link', 'image', 'code-block', 'blockquote'
  ]

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
              className={`p-2 rounded hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 transition-colors ${
                note.pinned ? 'text-fluent-blue-600' : 'text-fluent-gray-600 dark:text-fluent-gray-300'
              }`}
              title={note.pinned ? 'Unpin note' : 'Pin note'}
            >
              <Star className="w-4 h-4" fill={note.pinned ? 'currentColor' : 'none'} />
            </button>

            {/* Move */}
            <button
              className="p-2 rounded hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 transition-colors text-fluent-gray-600 dark:text-fluent-gray-300"
              title="Move note"
            >
              <Move className="w-4 h-4" />
            </button>

            {/* Copy */}
            <button
              onClick={() => note && onCopy?.(note)}
              className="p-2 rounded hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 transition-colors text-fluent-gray-600 dark:text-fluent-gray-300"
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
              className="p-2 rounded hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 transition-colors text-fluent-gray-600 dark:text-fluent-gray-300"
              title="Create new note"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              className="p-2 rounded hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 transition-colors text-fluent-gray-600 dark:text-fluent-gray-300"
              title="Save note (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
            </button>

            {/* Print */}
            <button
              onClick={onPrint}
              className="p-2 rounded hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-700 transition-colors text-fluent-gray-600 dark:text-fluent-gray-300"
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

        {/* Custom Quill Toolbar - Second Row */}
        <div id="toolbar" className="flex items-center px-4 py-2 bg-white dark:bg-fluent-gray-900 border-t border-fluent-gray-200 dark:border-fluent-gray-700">
          {/* Text Formatting */}
          <div className="flex items-center space-x-1 mr-4">
            <button className="ql-bold p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" title="Bold (Ctrl+B)">
              <Bold className="w-4 h-4" />
            </button>
            <button className="ql-italic p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" title="Italic (Ctrl+I)">
              <Italic className="w-4 h-4" />
            </button>
            <button className="ql-underline p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" title="Underline (Ctrl+U)">
              <Underline className="w-4 h-4" />
            </button>
            <button className="ql-strike p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" title="Strikethrough">
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 mr-4">
            <button className="ql-list p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" value="bullet" title="Bullet List">
              <List className="w-4 h-4" />
            </button>
            <button className="ql-list p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" value="ordered" title="Numbered List">
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Indentation */}
          <div className="flex items-center space-x-1 mr-4">
            <button className="ql-indent p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" value="-1" title="Decrease Indent">
              <Outdent className="w-4 h-4" />
            </button>
            <button className="ql-indent p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" value="+1" title="Increase Indent">
              <Indent className="w-4 h-4" />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center space-x-1 mr-4">
            <button className="ql-align p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" value="" title="Align Left">
              <AlignLeft className="w-4 h-4" />
            </button>
            <button className="ql-align p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" value="center" title="Align Center">
              <AlignCenter className="w-4 h-4" />
            </button>
            <button className="ql-align p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" value="right" title="Align Right">
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Links and Images */}
          <div className="flex items-center space-x-1 mr-4">
            <button className="ql-link p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" title="Insert Link">
              <Link className="w-4 h-4" />
            </button>
            <button className="ql-image p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" title="Insert Image">
              <Image className="w-4 h-4" />
            </button>
          </div>

          {/* More Options */}
          <div className="flex items-center space-x-1">
            <select className="ql-header text-sm border border-fluent-gray-300 dark:border-fluent-gray-600 rounded px-2 py-1">
              <option value="">Normal</option>
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </select>
            <select className="ql-color text-sm border border-fluent-gray-300 dark:border-fluent-gray-600 rounded px-2 py-1 ml-2">
              <option value="#000000">Black</option>
              <option value="#e60000">Red</option>
              <option value="#ff9900">Orange</option>
              <option value="#ffcc00">Yellow</option>
              <option value="#008a00">Green</option>
              <option value="#0066cc">Blue</option>
              <option value="#9933ff">Purple</option>
            </select>
            <button className="p-2 rounded hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700" title="More Options">
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
          <div className="flex items-center space-x-2">
            {note.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-2 py-1 rounded text-xs bg-fluent-gray-200 dark:bg-fluent-gray-700 text-fluent-gray-700 dark:text-fluent-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="flex-1 overflow-hidden">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          placeholder="Start writing your note here..."
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
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
