/**
 * Tag Input Component for Scribe
 * 
 * Handles tag input with autocomplete and creation
 */

import React, { useState, useRef, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  availableTags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
}

export default function TagInput({ 
  tags, 
  availableTags, 
  onTagsChange, 
  placeholder = "Add tags..." 
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = availableTags.filter(tag => 
        tag.toLowerCase().includes(inputValue.toLowerCase()) &&
        !tags.includes(tag)
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [inputValue, availableTags, tags])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue.trim())
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag if input is empty and backspace is pressed
      removeTag(tags[tags.length - 1])
    }
  }

  const addTag = (tagName: string) => {
    if (tagName && !tags.includes(tagName)) {
      onTagsChange([...tags, tagName])
    }
    setInputValue('')
    setShowSuggestions(false)
  }

  const removeTag = (tagName: string) => {
    onTagsChange(tags.filter(tag => tag !== tagName))
  }

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion)
  }

  const handleInputFocus = () => {
    if (inputValue.trim()) {
      setShowSuggestions(true)
    }
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => setShowSuggestions(false), 150)
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md bg-white dark:bg-fluent-gray-800 min-h-[40px]">
        {/* Existing Tags */}
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-fluent-blue-100 dark:bg-fluent-blue-900/20 text-fluent-blue-700 dark:text-fluent-blue-300 rounded-md text-sm"
          >
            <Tag className="w-3 h-3" />
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:bg-fluent-blue-200 dark:hover:bg-fluent-blue-800/40 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-fluent-gray-800 dark:text-fluent-gray-100 placeholder-fluent-gray-500 dark:placeholder-fluent-gray-400"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-fluent-gray-800 border border-fluent-gray-300 dark:border-fluent-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-fluent-gray-100 dark:hover:bg-fluent-gray-700 text-fluent-gray-800 dark:text-fluent-gray-100 flex items-center gap-2"
            >
              <Tag className="w-4 h-4 text-fluent-gray-500" />
              {suggestion}
            </button>
          ))}
          
          {/* Create new tag option */}
          {inputValue.trim() && !availableTags.includes(inputValue.trim()) && (
            <button
              onClick={() => addTag(inputValue.trim())}
              className="w-full px-3 py-2 text-left hover:bg-fluent-blue-100 dark:hover:bg-fluent-blue-900/20 text-fluent-blue-600 dark:text-fluent-blue-400 flex items-center gap-2 border-t border-fluent-gray-200 dark:border-fluent-gray-700"
            >
              <Plus className="w-4 h-4" />
              Create "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}
