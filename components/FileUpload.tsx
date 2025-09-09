'use client'
import React, { useState, useEffect, useRef } from 'react'

export interface FileData {
  id: string
  file: File
  progress: number
  preview?: string
}

interface FileUploadProps {
  files?: FileData[]
  onFilesChange: React.Dispatch<React.SetStateAction<FileData[]>>
  onError?: (message: string, type?: 'error' | 'success') => void
}

export default function FileUpload({ files, onFilesChange, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const intervalsRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    const localIntervals = intervalsRef.current
    return () => { localIntervals.forEach((it) => clearInterval(it)) }
  }, [])

  const notify = (msg: string, type: 'error' | 'success' = 'error') => {
    if (onError) onError(msg, type)
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); processFiles(Array.from(e.dataTransfer.files)) }
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    processFiles(Array.from(e.target.files))
  }

  const accept = new Set(['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
  const MAX_SIZE = 10 * 1024 * 1024
  const MAX_FILES = 5

  const processFiles = (picked: File[]) => {
    const current = files ?? []
    if (current.length + picked.length > MAX_FILES) {
      notify(`Maksymalnie ${MAX_FILES} plików`, 'error'); return
    }

    const filtered = picked.filter(f => {
      if (!accept.has(f.type)) { notify(`Niedozwolony typ: ${f.name}`, 'error'); return false }
      if (f.size > MAX_SIZE) { notify(`Za duży plik: ${f.name}`, 'error'); return false }
      return true
    })

    const newFiles: FileData[] = filtered.map((file) => ({
      id: Math.random().toString(36).slice(2, 11),
      file,
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))

    onFilesChange((prev) => [...prev, ...newFiles])

    newFiles.forEach((fileData) => {
      const interval = setInterval(() => {
        onFilesChange((prevFiles) =>
          prevFiles.map((f) => {
            if (f.id === fileData.id) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100)
              if (newProgress >= 100) {
                clearInterval(interval)
                const idx = intervalsRef.current.indexOf(interval)
                if (idx > -1) intervalsRef.current.splice(idx, 1)
                notify(`Załadowano: ${fileData.file.name}`, 'success')
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
    onFilesChange((prev) => prev.filter((f) => f.id !== id))
  }

  const items = files ?? []

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}
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
        accept="image/*,.pdf"
      />

      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>

      <p className="mt-2 text-sm text-gray-600">
        <button type="button" onClick={() => fileInputRef.current?.click()} className="font-medium text-orange-500 hover:text-orange-600">
          Kliknij aby wybrać pliki
        </button>{' '}
        lub przeciągnij i upuść
      </p>
      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP, GIF, PDF do 10MB (max 5 plików)</p>

      {items.length > 0 && (
        <div className="mt-4 space-y-2 text-left">
          {items.map((f) => (
            <div key={f.id} className="bg-gray-50 p-2 rounded border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="truncate text-sm">{f.file.name}</div>
                <button type="button" onClick={() => removeFile(f.id)} className="text-xs text-red-600 hover:underline">Usuń</button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div className="bg-green-500 h-1 rounded-full transition-all" style={{ width: `${Math.round(f.progress)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
