/**
 * Tag Manager Component for Scribe
 * 
 * Manages all tags with edit, delete, and color coding
 */

import React, { useState } from 'react'
import { Tag, Edit2, Trash2, X, Check } from 'lucide-react'

interface TagManagerProps {
  tags: string[]
  onTagRename: (oldName: string, newName: string) => void
  onTagDelete: (tagName: string) => void
  onClose: () => void
}

export default function TagManager({ 
  tags, 
  onTagRename, 
  onTagDelete, 
  onClose 
}: TagManagerProps) {
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleEditStart = (tagName: string) => {
    setEditingTag(tagName)
    setEditValue(tagName)
  }

  const handleEditSave = () => {
    if (editingTag && editValue.trim() && editValue.trim() !== editingTag) {
      onTagRename(editingTag, editValue.trim())
    }
    setEditingTag(null)
    setEditValue('')
  }

  const handleEditCancel = () => {
    setEditingTag(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-fluent-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
          <h2 className="text-lg font-semibold text-fluent-gray-800 dark:text-fluent-gray-100">
            Manage Tags
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-fluent-gray-500" />
          </button>
        </div>

        {/* Tags List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {tags.length === 0 ? (
            <p className="text-fluent-gray-500 dark:text-fluent-gray-400 text-center py-8">
              No tags yet. Create some tags by adding them to your notes.
            </p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-fluent-gray-50 dark:bg-fluent-gray-700 rounded-md"
                >
                  {editingTag === tag ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 px-2 py-1 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded bg-white dark:bg-fluent-gray-800 text-fluent-gray-800 dark:text-fluent-gray-100"
                        autoFocus
                      />
                      <button
                        onClick={handleEditSave}
                        className="p-1 hover:bg-fluent-green-100 dark:hover:bg-fluent-green-900/20 rounded transition-colors"
                      >
                        <Check className="w-4 h-4 text-fluent-green-600" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1 hover:bg-fluent-gray-200 dark:hover:bg-fluent-gray-600 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-fluent-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1">
                        <Tag className="w-4 h-4 text-fluent-blue-600" />
                        <span className="text-fluent-gray-800 dark:text-fluent-gray-100">
                          {tag}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditStart(tag)}
                          className="p-1 hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 rounded transition-colors"
                          title="Rename tag"
                        >
                          <Edit2 className="w-4 h-4 text-fluent-blue-600" />
                        </button>
                        <button
                          onClick={() => onTagDelete(tag)}
                          className="p-1 hover:bg-fluent-red-100 dark:hover:bg-fluent-red-900/20 rounded transition-colors"
                          title="Delete tag"
                        >
                          <Trash2 className="w-4 h-4 text-fluent-red-600" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-fluent-gray-200 dark:border-fluent-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-fluent-blue-600 hover:bg-fluent-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
