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
    const snapshot = [...intervalsRef.current]
    return () => { snapshot.forEach((it) => clearInterval(it)) }
  }, [])

  const notify = (msg: string, type: 'error' | 'success' = 'error') => onError?.(msg, type)

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); processFiles(Array.from(e.dataTransfer.files)) }

  const clearInput = () => { if (fileInputRef.current) fileInputRef.current.value = '' }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    processFiles(Array.from(e.target.files))
    clearInput() // pozwala wybrać ten sam plik ponownie
  }

  const acceptList = "image/*,.pdf,.doc,.docx,.heic"
  const accept = new Set(['image/jpeg','image/png','image/webp','image/gif','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/heic'])
  const MAX_SIZE = 10 * 1024 * 1024
  const MAX_FILES = 5

  const processFiles = (picked: File[]) => {
    const current = files ?? []
    if (current.length + picked.length > MAX_FILES) { notify(`Maksymalnie ${MAX_FILES} plików`); return }
    const filtered = picked.filter(f => {
      const t = f.type || (f.name.toLowerCase().endsWith('.heic') ? 'image/heic' : '')
      if (!accept.has(t)) { notify(`Niedozwolony typ: ${f.name}`); return false }
      if (f.size > MAX_SIZE)  { notify(`Za duży plik: ${f.name}`);   return false }
      return true
    })
    const newFiles: FileData[] = filtered.map(file => ({
      id: (typeof crypto !== "undefined" && "randomUUID" in crypto ? (crypto).randomUUID() : (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,11))),
      file, progress: 0,
      preview: (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic')) ? URL.createObjectURL(file) : undefined,
    }))
    onFilesChange(prev => [...prev, ...newFiles])
    newFiles.forEach(fileData => {
      const interval = setInterval(() => {
        onFilesChange(prevFiles =>
          prevFiles.map(f => {
            if (f.id === fileData.id) {
              const p = Math.min(f.progress + Math.random() * 30, 100)
              if (p >= 100) {
                clearInterval(interval)
                const i = intervalsRef.current.indexOf(interval)
                if (i > -1) intervalsRef.current.splice(i, 1)
                notify(`Załadowano: ${fileData.file.name}`, 'success')
              }
              return { ...f, progress: p }
            }
            return f
          })
        )
      }, 500)
      intervalsRef.current.push(interval)
    })
  }

  const items = files ?? []
  const removeFile = (id: string) => onFilesChange(prev => prev.filter(f => f.id !== id))

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'}`}
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        onClick={clearInput}
        className="hidden"
        accept={acceptList}
      />
      <button type="button" onClick={() => fileInputRef.current?.click()} className="font-medium text-orange-500 hover:text-orange-600">
        Kliknij aby wybrać pliki
      </button>
      <span className="mt-2 block text-sm text-gray-600">…lub przeciągnij i upuść</span>
      <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP, GIF, HEIC, PDF, DOC/DOCX do 10MB (max 5)</p>

      {items.length > 0 && (
        <div className="mt-4 space-y-2 text-left">
          {items.map(f => (
            <div key={f.id} className="bg-gray-50 p-2 rounded border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="truncate text-sm">{f.file.name}</div>
                <button type="button" onClick={() => removeFile(f.id)} className="text-xs text-red-600 hover:underline">Usuń</button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div className="h-1 rounded-full transition-all" style={{ width: `${Math.round(f.progress)}%`, backgroundColor: '#16a34a' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
