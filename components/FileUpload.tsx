'use client'

import React, { useState, useEffect, useRef } from 'react'

export interface FileData {
  id: string;
  file: File;
  progress: number;
  preview?: string;
}

interface FileUploadProps {
  // zgodne z useState<FileData[]>
  onFilesChange: React.Dispatch<React.SetStateAction<FileData[]>>;
}

export default function FileUpload({ onFilesChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const intervalsRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    const localIntervals = intervalsRef.current
    return () => {
      localIntervals.forEach((interval) => clearInterval(interval))
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      processFiles(files)
    }
  }

  const processFiles = (files: File[]) => {
    const newFiles: FileData[] = files.map((file) => ({
      id: Math.random().toString(36).slice(2, 11),
      file,
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))

    // dodajemy do istniejącej listy (bez utraty poprzednich)
    onFilesChange((prev: FileData[]) => [...prev, ...newFiles])

    newFiles.forEach((fileData) => {
      const interval = setInterval(() => {
        onFilesChange((prevFiles: FileData[]) =>
          prevFiles.map((f) => {
            if (f.id === fileData.id) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100)
              if (newProgress >= 100) {
                clearInterval(interval)
                const idx = intervalsRef.current.indexOf(interval)
                if (idx > -1) intervalsRef.current.splice(idx, 1)
              }
              return { ...f, progress: newProgress }
            }
            return f
          })
        )
      }, 500)
      intervalsRef.current.push(interval)
    })
  }

  const removeFile = (id: string) => {
    onFilesChange((prevFiles: FileData[]) => prevFiles.filter((f) => f.id !== id))
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
      />

      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>

      <p className="mt-2 text-sm text-gray-600">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="font-medium text-orange-500 hover:text-orange-600"
        >
          Kliknij aby wybrać pliki
        </button>{' '}
        lub przeciągnij i upuść
      </p>
      <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF, DOC do 10MB</p>

      {/* Przykładowy przycisk usuwania (ukryty w UI – zostawiamy handler) */}
      <button type="button" onClick={() => {}} className="hidden" aria-hidden />
    </div>
  )
}
