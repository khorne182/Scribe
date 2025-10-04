/**
 * Folder Manager Component for Scribe
 * 
 * Manages folders with create, edit, delete, and color coding
 */

import React, { useState } from 'react'
import { Folder, Edit2, Trash2, X, Check, Plus, FolderOpen } from 'lucide-react'

interface Folder {
  id: number
  name: string
  color?: string
  created_at: string
  updated_at: string
}

interface FolderManagerProps {
  folders: Folder[]
  onCreateFolder: (name: string, color: string) => void
  onRenameFolder: (id: number, newName: string) => void
  onDeleteFolder: (id: number) => void
  onClose: () => void
}

const FOLDER_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
]

export default function FolderManager({ 
  folders, 
  onCreateFolder, 
  onRenameFolder, 
  onDeleteFolder, 
  onClose 
}: FolderManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [editingFolder, setEditingFolder] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderColor)
      setNewFolderName('')
      setNewFolderColor(FOLDER_COLORS[0])
      setShowCreateForm(false)
    }
  }

  const handleEditStart = (folder: Folder) => {
    setEditingFolder(folder.id)
    setEditValue(folder.name)
  }

  const handleEditSave = () => {
    if (editingFolder && editValue.trim()) {
      onRenameFolder(editingFolder, editValue.trim())
    }
    setEditingFolder(null)
    setEditValue('')
  }

  const handleEditCancel = () => {
    setEditingFolder(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showCreateForm) {
        handleCreateFolder()
      } else {
        handleEditSave()
      }
    } else if (e.key === 'Escape') {
      if (showCreateForm) {
        setShowCreateForm(false)
        setNewFolderName('')
      } else {
        handleEditCancel()
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-fluent-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
          <h2 className="text-lg font-semibold text-fluent-gray-800 dark:text-fluent-gray-100">
            Manage Folders
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-fluent-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Create New Folder */}
          {showCreateForm ? (
            <div className="mb-4 p-3 bg-fluent-gray-50 dark:bg-fluent-gray-700 rounded-md">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Folder name"
                  className="w-full px-3 py-2 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded bg-white dark:bg-fluent-gray-800 text-fluent-gray-800 dark:text-fluent-gray-100"
                  autoFocus
                />
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-fluent-gray-600 dark:text-fluent-gray-400">Color:</span>
                  <div className="flex gap-1">
                    {FOLDER_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewFolderColor(color)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          newFolderColor === color 
                            ? 'border-fluent-gray-800 dark:border-fluent-gray-200' 
                            : 'border-fluent-gray-300 dark:border-fluent-gray-600'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateFolder}
                    className="px-3 py-1 bg-fluent-blue-600 hover:bg-fluent-blue-700 text-white rounded text-sm transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1 bg-fluent-gray-200 dark:bg-fluent-gray-600 hover:bg-fluent-gray-300 dark:hover:bg-fluent-gray-500 text-fluent-gray-700 dark:text-fluent-gray-300 rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full mb-4 p-3 border-2 border-dashed border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md hover:border-fluent-blue-400 dark:hover:border-fluent-blue-500 transition-colors flex items-center justify-center gap-2 text-fluent-gray-600 dark:text-fluent-gray-400"
            >
              <Plus className="w-4 h-4" />
              Create New Folder
            </button>
          )}

          {/* Folders List */}
          {folders.length === 0 ? (
            <p className="text-fluent-gray-500 dark:text-fluent-gray-400 text-center py-8">
              No folders yet. Create your first folder to organize your notes.
            </p>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between p-3 bg-fluent-gray-50 dark:bg-fluent-gray-700 rounded-md"
                >
                  {editingFolder === folder.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: folder.color }}
                      />
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
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: folder.color }}
                        />
                        <Folder className="w-4 h-4 text-fluent-gray-500" />
                        <span className="text-fluent-gray-800 dark:text-fluent-gray-100">
                          {folder.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditStart(folder)}
                          className="p-1 hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 rounded transition-colors"
                          title="Rename folder"
                        >
                          <Edit2 className="w-4 h-4 text-fluent-blue-600" />
                        </button>
                        <button
                          onClick={() => onDeleteFolder(folder.id)}
                          className="p-1 hover:bg-fluent-red-100 dark:hover:bg-fluent-red-900/20 rounded transition-colors"
                          title="Delete folder"
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
