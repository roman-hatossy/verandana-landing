'use client'

import { useRef, useEffect } from 'react'

export interface FileData {
  file: File
  id: number
  progress: number
  preview?: string
}

interface FileUploadProps {
  files: FileData[]
  onFilesChange: (files: FileData[]) => void
  onError: (message: string) => void
}

export default function FileUpload({ files, onFilesChange, onError }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const intervalsRef = useRef<Record<number, NodeJS.Timeout>>({})
  
  useEffect(() => {
    return () => {
      Object.values(intervalsRef.current).forEach(clearInterval)
    }
  }, [])
  
  const handleFileSelect = async (selectedFiles: FileList) => {
    if (files.length >= 10) {
      onError('Maksymalnie 10 plików')
      return
    }
    
    const newFiles: FileData[] = []
    
    for (let i = 0; i < selectedFiles.length && files.length + newFiles.length < 10; i++) {
      const file = selectedFiles[i]
      
      if (file.size > 10 * 1024 * 1024) {
        onError(`Plik "${file.name}" jest za duży (max 10MB)`)
        continue
      }
      
      const fileData: FileData = {
        file,
        id: Date.now() + i,
        progress: 0
      }
      
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file)
        fileData.preview = preview
      }
      
      newFiles.push(fileData)
    }
    
    const updatedFiles = [...files, ...newFiles]
    onFilesChange(updatedFiles)
    
    newFiles.forEach(fileData => {
      const interval = setInterval(() => {
        onFilesChange(prevFiles =>
          prevFiles.map(f => {
            if (f.id === fileData.id) {
              const newProgress = Math.min(f.progress + Math.random() * 30, 100)
              if (newProgress >= 100) {
                clearInterval(intervalsRef.current[fileData.id])
                delete intervalsRef.current[fileData.id]
              }
              return { ...f, progress: newProgress }
            }
            return f
          })
        )
      }, 300)
      
      intervalsRef.current[fileData.id] = interval
    })
  }
  
  const removeFile = (fileId: number) => {
    if (intervalsRef.current[fileId]) {
      clearInterval(intervalsRef.current[fileId])
      delete intervalsRef.current[fileId]
    }
    
    const fileToRemove = files.find(f => f.id === fileId)
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    
    onFilesChange(files.filter(f => f.id !== fileId))
  }
  
  return (
    <div>
      <div
        className="border-2 border-dashed border-gray-300 rounded-2xl bg-white p-6 text-center cursor-pointer hover:border-orange-400 hover:shadow-lg transition-all duration-200"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files)
          }
        }}
      >
        <div className="text-2xl text-orange-400 mb-2">📁</div>
        <div className="text-sm text-gray-600">Kliknij lub przeciągnij pliki</div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 space-y-3">
          {files.map(file => (
            <div key={file.id} className="flex gap-4 items-center">
              <div className="w-16 h-16 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                {file.preview ? (
                  <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500">📄</span>
                )}
              </div>
              <div className="flex-1">
                <div className="h-1 bg-orange-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-orange-400 transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 text-sm">
                    <span className="text-gray-900">{file.file.name}</span>
                    <span className="text-gray-500">{(file.file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="text-red-500 border border-red-500 px-2 py-1 rounded text-xs hover:bg-red-50"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
