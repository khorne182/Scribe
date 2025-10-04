/**
 * Import Dialog Component for Scribe
 * 
 * Provides import options for files and folders
 */

import React, { useState, useRef } from 'react'
import { X, Upload, FileText, Folder, AlertCircle, CheckCircle } from 'lucide-react'
import { ImportService, ImportResult } from '../lib/importService'
import { Note } from '../lib/models'

interface ImportDialogProps {
  isOpen: boolean
  onClose: () => void
  onImport: (notes: Note[]) => void
}

export default function ImportDialog({ isOpen, onClose, onImport }: ImportDialogProps) {
  const [importType, setImportType] = useState<'file' | 'folder'>('file')
  const [preserveMetadata, setPreserveMetadata] = useState(true)
  const [addPrefix, setAddPrefix] = useState('')
  const [defaultTags, setDefaultTags] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleImport(Array.from(files))
    }
  }

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleImport(Array.from(files))
    }
  }

  const handleImport = async (files: File[]) => {
    setIsImporting(true)
    setImportResult(null)

    try {
      const options = {
        preserveMetadata,
        addPrefix: addPrefix.trim() || undefined,
        defaultTags: defaultTags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      let result: ImportResult

      if (importType === 'folder') {
        result = await ImportService.importFromFolder(files as any, options)
      } else {
        result = await ImportService.importFromFiles(files, options)
      }

      setImportResult(result)

      if (result.success && result.notes.length > 0) {
        onImport(result.notes)
      }
    } catch (error) {
      console.error('Import failed:', error)
      setImportResult({
        success: false,
        imported: 0,
        failed: files.length,
        errors: [`Import failed: ${error}`],
        notes: []
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setImportResult(null)
    setAddPrefix('')
    setDefaultTags('')
    onClose()
  }

  const triggerFileInput = () => {
    if (importType === 'file') {
      fileInputRef.current?.click()
    } else {
      folderInputRef.current?.click()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-fluent-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-fluent-gray-200 dark:border-fluent-gray-700">
          <div className="flex items-center gap-3">
            <Upload className="w-6 h-6 text-fluent-blue-600" />
            <h2 className="text-xl font-semibold text-fluent-gray-800 dark:text-fluent-gray-100">
              Import Notes
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-fluent-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Import Type Selection */}
          <div>
            <h3 className="text-lg font-medium text-fluent-gray-800 dark:text-fluent-gray-100 mb-4">
              Import Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setImportType('file')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  importType === 'file'
                    ? 'border-fluent-blue-500 bg-fluent-blue-50 dark:bg-fluent-blue-900/20'
                    : 'border-fluent-gray-200 dark:border-fluent-gray-600 hover:border-fluent-gray-300 dark:hover:border-fluent-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-fluent-blue-600" />
                  <span className="font-medium text-fluent-gray-800 dark:text-fluent-gray-100">
                    Individual Files
                  </span>
                </div>
                <p className="text-sm text-fluent-gray-600 dark:text-fluent-gray-400">
                  Import one or more note files
                </p>
              </button>

              <button
                onClick={() => setImportType('folder')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  importType === 'folder'
                    ? 'border-fluent-blue-500 bg-fluent-blue-50 dark:bg-fluent-blue-900/20'
                    : 'border-fluent-gray-200 dark:border-fluent-gray-600 hover:border-fluent-gray-300 dark:hover:border-fluent-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Folder className="w-5 h-5 text-fluent-blue-600" />
                  <span className="font-medium text-fluent-gray-800 dark:text-fluent-gray-100">
                    Folder
                  </span>
                </div>
                <p className="text-sm text-fluent-gray-600 dark:text-fluent-gray-400">
                  Import all files from a folder
                </p>
              </button>
            </div>
          </div>

          {/* Import Options */}
          <div>
            <h3 className="text-lg font-medium text-fluent-gray-800 dark:text-fluent-gray-100 mb-4">
              Import Options
            </h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preserveMetadata}
                  onChange={(e) => setPreserveMetadata(e.target.checked)}
                  className="rounded border-fluent-gray-300 dark:border-fluent-gray-600"
                />
                <span className="text-fluent-gray-700 dark:text-fluent-gray-300">
                  Preserve original metadata (creation dates, etc.)
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-fluent-gray-700 dark:text-fluent-gray-300 mb-2">
                  Add Prefix to Titles (Optional)
                </label>
                <input
                  type="text"
                  value={addPrefix}
                  onChange={(e) => setAddPrefix(e.target.value)}
                  placeholder="e.g., 'Imported'"
                  className="w-full px-3 py-2 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md bg-white dark:bg-fluent-gray-700 text-fluent-gray-800 dark:text-fluent-gray-100 placeholder-fluent-gray-500 dark:placeholder-fluent-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-fluent-gray-700 dark:text-fluent-gray-300 mb-2">
                  Default Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={defaultTags}
                  onChange={(e) => setDefaultTags(e.target.value)}
                  placeholder="e.g., imported, notes"
                  className="w-full px-3 py-2 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md bg-white dark:bg-fluent-gray-700 text-fluent-gray-800 dark:text-fluent-gray-100 placeholder-fluent-gray-500 dark:placeholder-fluent-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="bg-fluent-gray-50 dark:bg-fluent-gray-700 p-4 rounded-lg">
            <h4 className="font-medium text-fluent-gray-800 dark:text-fluent-gray-100 mb-2">
              Supported Formats
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-fluent-gray-600 dark:text-fluent-gray-400">
              <div>• Markdown (.md, .markdown)</div>
              <div>• Plain Text (.txt)</div>
              <div>• HTML (.html, .htm)</div>
              <div>• JSON (.json)</div>
            </div>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className={`p-4 rounded-lg ${
              importResult.success 
                ? 'bg-fluent-green-50 dark:bg-fluent-green-900/20' 
                : 'bg-fluent-red-50 dark:bg-fluent-red-900/20'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-fluent-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-fluent-red-600" />
                )}
                <span className={`font-medium ${
                  importResult.success 
                    ? 'text-fluent-green-700 dark:text-fluent-green-300' 
                    : 'text-fluent-red-700 dark:text-fluent-red-300'
                }`}>
                  Import {importResult.success ? 'Successful' : 'Failed'}
                </span>
              </div>
              
              <div className="text-sm text-fluent-gray-600 dark:text-fluent-gray-400 space-y-1">
                <div>Imported: {importResult.imported} notes</div>
                {importResult.failed > 0 && <div>Failed: {importResult.failed} files</div>}
                {importResult.errors.length > 0 && (
                  <div>
                    <div className="font-medium text-fluent-red-600 dark:text-fluent-red-400 mt-2">Errors:</div>
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-xs text-fluent-red-600 dark:text-fluent-red-400">
                        • {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-fluent-gray-200 dark:border-fluent-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-fluent-gray-700 dark:text-fluent-gray-300 hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 rounded-md transition-colors"
          >
            {importResult ? 'Close' : 'Cancel'}
          </button>
          {!importResult && (
            <button
              onClick={triggerFileInput}
              disabled={isImporting}
              className="px-6 py-2 bg-fluent-blue-600 hover:bg-fluent-blue-700 disabled:bg-fluent-gray-400 text-white rounded-md font-medium transition-colors flex items-center gap-2"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {importType === 'file' ? 'Select Files' : 'Select Folder'}
                </>
              )}
            </button>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.markdown,.txt,.html,.htm,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          webkitdirectory=""
          onChange={handleFolderSelect}
          className="hidden"
        />
      </div>
    </div>
  )
}
