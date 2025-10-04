/**
 * Export Dialog Component for Scribe
 * 
 * Provides export options for single notes or multiple notes
 */

import React, { useState } from 'react'
import { X, Download, FileText, FileImage, Code, File } from 'lucide-react'
import { Note } from '../lib/models'
import { ExportService, ExportOptions } from '../lib/exportService'

interface ExportDialogProps {
  notes: Note[]
  isOpen: boolean
  onClose: () => void
}

export default function ExportDialog({ notes, isOpen, onClose }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'markdown' | 'html' | 'txt'>('pdf')
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeTags, setIncludeTags] = useState(true)
  const [includeTimestamps, setIncludeTimestamps] = useState(true)
  const [customFilename, setCustomFilename] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeMetadata,
        includeTags,
        includeTimestamps,
        filename: customFilename || undefined
      }

      if (notes.length === 1) {
        ExportService.exportNote(notes[0], options)
      } else {
        ExportService.exportNotes(notes, options)
      }
      
      onClose()
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: FileImage, description: 'Print-ready format with formatting preserved' },
    { value: 'markdown', label: 'Markdown', icon: Code, description: 'Plain text with markdown formatting' },
    { value: 'html', label: 'HTML Web Page', icon: FileText, description: 'Web-ready format with styling' },
    { value: 'txt', label: 'Plain Text', icon: File, description: 'Simple text format' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-fluent-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-fluent-blue-600" />
            <h2 className="text-xl font-semibold text-fluent-gray-800 dark:text-fluent-gray-100">
              Export {notes.length === 1 ? 'Note' : 'Notes'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-fluent-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Summary */}
          <div className="bg-fluent-blue-50 dark:bg-fluent-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-fluent-blue-700 dark:text-fluent-blue-300">
              <strong>{notes.length}</strong> note{notes.length !== 1 ? 's' : ''} selected for export
              {notes.length === 1 && (
                <span className="block mt-1 text-fluent-blue-600 dark:text-fluent-blue-400">
                  "{notes[0].title}"
                </span>
              )}
            </p>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-fluent-gray-800 dark:text-fluent-gray-100 mb-4">
              Export Format
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formatOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFormat(option.value as any)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedFormat === option.value
                        ? 'border-fluent-blue-500 bg-fluent-blue-50 dark:bg-fluent-blue-900/20'
                        : 'border-fluent-gray-200 dark:border-fluent-gray-600 hover:border-fluent-gray-300 dark:hover:border-fluent-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className="w-5 h-5 text-fluent-blue-600" />
                      <span className="font-medium text-fluent-gray-800 dark:text-fluent-gray-100">
                        {option.label}
                      </span>
                    </div>
                    <p className="text-sm text-fluent-gray-600 dark:text-fluent-gray-400">
                      {option.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-medium text-fluent-gray-800 dark:text-fluent-gray-100 mb-4">
              Export Options
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeMetadata}
                  onChange={(e) => setIncludeMetadata(e.target.checked)}
                  className="rounded border-fluent-gray-300 dark:border-fluent-gray-600"
                />
                <span className="text-fluent-gray-700 dark:text-fluent-gray-300">
                  Include metadata (creation date, tags, etc.)
                </span>
              </label>
              
              {includeMetadata && (
                <>
                  <label className="flex items-center gap-3 ml-6">
                    <input
                      type="checkbox"
                      checked={includeTimestamps}
                      onChange={(e) => setIncludeTimestamps(e.target.checked)}
                      className="rounded border-fluent-gray-300 dark:border-fluent-gray-600"
                    />
                    <span className="text-fluent-gray-700 dark:text-fluent-gray-300">
                      Include timestamps
                    </span>
                  </label>
                  
                  <label className="flex items-center gap-3 ml-6">
                    <input
                      type="checkbox"
                      checked={includeTags}
                      onChange={(e) => setIncludeTags(e.target.checked)}
                      className="rounded border-fluent-gray-300 dark:border-fluent-gray-600"
                    />
                    <span className="text-fluent-gray-700 dark:text-fluent-gray-300">
                      Include tags
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Custom Filename */}
          <div>
            <h3 className="text-lg font-medium text-fluent-gray-800 dark:text-fluent-gray-100 mb-4">
              Filename (Optional)
            </h3>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder={`Leave empty for auto-generated filename`}
              className="w-full px-3 py-2 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md bg-white dark:bg-fluent-gray-700 text-fluent-gray-800 dark:text-fluent-gray-100 placeholder-fluent-gray-500 dark:placeholder-fluent-gray-400"
            />
            <p className="text-sm text-fluent-gray-500 dark:text-fluent-gray-400 mt-1">
              If empty, filename will be auto-generated based on note title and date
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-fluent-gray-200 dark:border-fluent-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-fluent-gray-700 dark:text-fluent-gray-300 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-fluent-blue-600 hover:bg-fluent-blue-700 disabled:bg-fluent-gray-400 text-white rounded-md font-medium transition-colors flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export {notes.length === 1 ? 'Note' : 'Notes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
