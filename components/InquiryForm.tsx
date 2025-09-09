'use client'

import React, { useState, useEffect } from 'react'
import Calendar from './Calendar'
import FileUpload from './FileUpload'
import { validateEmail, validatePhone, validatePostalCode, formatPhone, formatPostalCode } from '@/lib/validation'

interface FileData {
  id: string;
  file: File;
  progress: number;
  preview?: string;
}

interface ValidationErrors {
  email?: string;
  phone?: string;
  postalCode?: string;
}

export default function InquiryForm() {
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [files, setFiles] = useState<FileData[]>([])
  const [formProgress, setFormProgress] = useState(0)
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [emailForQuestions, setEmailForQuestions] = useState('')
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [comment, setComment] = useState('')
  
  // Validation errors
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Real-time validation
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'email':
        const emailValidation = validateEmail(value)
        if (!emailValidation.isValid && touched.email) {
          newErrors.email = emailValidation.error
        } else {
          delete newErrors.email
        }
        break
      case 'phone':
        const phoneValidation = validatePhone(value)
        if (!phoneValidation.isValid && touched.phone) {
          newErrors.phone = phoneValidation.error
        } else {
          delete newErrors.phone
        }
        break
      case 'postalCode':
        const postalValidation = validatePostalCode(value)
        if (!postalValidation.isValid && touched.postalCode) {
          newErrors.postalCode = postalValidation.error
        } else {
          delete newErrors.postalCode
        }
        break
    }
    
    setErrors(newErrors)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    validateField('email', value)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    validateField('phone', formatted)
  }

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPostalCode(e.target.value)
    if (formatted.length <= 6) {
      setPostalCode(formatted)
      validateField('postalCode', formatted)
    }
  }

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true })
    switch (field) {
      case 'email':
        validateField('email', email)
        break
      case 'phone':
        validateField('phone', phone)
        break
      case 'postalCode':
        validateField('postalCode', postalCode)
        break
    }
  }

  // Calculate progress
  useEffect(() => {
    let progress = 0
    const fields = [
      selectedType,
      name,
      email,
      phone,
      address,
      postalCode,
      city,
      selectedDate,
      files.length > 0
    ]
    
    fields.forEach(field => {
      if (field) progress += 100 / fields.length
    })
    
    setFormProgress(Math.min(Math.round(progress), 100))
  }, [selectedType, name, email, phone, address, postalCode, city, selectedDate, files])

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && formProgress > 0 && formProgress < 100) {
        setShowExitPopup(true)
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [formProgress])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all fields before submit
    const emailValidation = validateEmail(email)
    const phoneValidation = validatePhone(phone)
    const postalValidation = validatePostalCode(postalCode)
    
    if (!emailValidation.isValid || !phoneValidation.isValid || !postalValidation.isValid) {
      setErrors({
        email: emailValidation.error,
        phone: phoneValidation.error,
        postalCode: postalValidation.error
      })
      setTouched({ email: true, phone: true, postalCode: true })
      alert('Popraw błędy w formularzu przed wysłaniem')
      return
    }
    
    console.log('Form submitted:', {
      selectedType,
      name,
      email,
      phone,
      address,
      postalCode,
      city,
      selectedDate,
      files,
      comment
    })
    alert('Dziękujemy za wypełnienie formularza! Skontaktujemy się wkrótce.')
  }

  const gardenTypes = [
    { id: 'home-extension', name: 'Home Extension', icon: '🏠', desc: 'Rozszerzenie przestrzeni mieszkalnej' },
    { id: 'classic-warm', name: 'Klasyczny ciepły', icon: '☀️', desc: 'Całoroczny, ogrzewany ogród' },
    { id: 'seasonal-cold', name: 'Sezonowy zimny', icon: '❄️', desc: 'Użytkowany w ciepłych miesiącach' },
    { id: 'pergola', name: 'Pergola', icon: '🌿', desc: 'Otwarta konstrukcja ogrodowa' },
    { id: 'not-sure', name: 'Nie wiem', icon: '❓', desc: 'Pomożemy wybrać najlepsze rozwiązanie' }
  ]

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Postęp wypełniania</span>
            <span className="text-sm font-medium text-orange-500">{formProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${formProgress}%` }}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Panel 1: Typ ogrodu */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">1. Wybierz typ ogrodu</h3>
            <div className="space-y-3">
              {gardenTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedType === type.id 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{type.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{type.name}</div>
                      <div className="text-sm text-gray-600">{type.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Panel 2: Dane kontaktowe */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">2. Dane kontaktowe</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder="123 456 789"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kod pocztowy
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={handlePostalCodeChange}
                    onBlur={() => handleBlur('postalCode')}
                    placeholder="00-950"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      errors.postalCode ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Miasto
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Termin i pliki */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-800">3. Termin i materiały</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferowany termin spotkania
                </label>
                <Calendar onDateSelect={setSelectedDate} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dodaj zdjęcia lub dokumenty
                </label>
                <FileUpload onFilesChange={setFiles} />
                
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {files.map(file => (
                      <div key={file.id} className="bg-gray-50 p-2 rounded flex items-center justify-between">
                        <span className="text-sm truncate">{file.file.name}</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-1 mr-2">
                            <div 
                              className="bg-green-500 h-1 rounded-full transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(file.progress)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dodatkowe informacje
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Opisz swoje oczekiwania..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6">
          <h3 className="text-lg font-bold mb-3">Podsumowanie zapytania:</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Typ ogrodu:</span> {
                selectedType ? gardenTypes.find(t => t.id === selectedType)?.name : 'Nie wybrano'
              }
            </div>
            <div>
              <span className="font-medium">Kontakt:</span> {name || 'Nie podano'}
            </div>
            <div>
              <span className="font-medium">Termin:</span> {
                selectedDate ? selectedDate.toLocaleDateString('pl-PL') : 'Nie wybrano'
              }
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 text-center">
          <button
            type="submit"
            disabled={formProgress < 50}
            className={`px-8 py-3 rounded-full font-semibold transition-all ${
              formProgress >= 50
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {formProgress >= 50 ? 'Wyślij zapytanie' : `Wypełnij formularz (${formProgress}%)`}
          </button>
        </div>
      </form>

      {/* Exit Popup */}
      {showExitPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4">Poczekaj! Mamy dla Ciebie coś specjalnego</h2>
            <p className="mb-4">
              Zostaw swój email, a wyślemy Ci listę 10 najważniejszych pytań, 
              które pomogą Ci przygotować się do rozmowy o ogrodzie zimowym.
            </p>
            <input
              type="email"
              value={emailForQuestions}
              onChange={(e) => setEmailForQuestions(e.target.value)}
              placeholder="twoj@email.pl"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (emailForQuestions) {
                    alert('Dziękujemy! Sprawdź swoją skrzynkę email.')
                    setShowExitPopup(false)
                  }
                }}
                className="flex-1 bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
              >
                Wyślij mi pytania
              </button>
              <button
                onClick={() => setShowExitPopup(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                Nie, dziękuję
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
