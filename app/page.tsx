'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Calendar from '../components/Calendar'
import FileUpload, { FileData } from '../components/FileUpload'

const monthNamesGen = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']

export default function Home() {
  const [selectedType, setSelectedType] = useState('home-extension')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    postal: '',
    area: '',
    comment: '',
    express: false,
    consent: false
  })
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [files, setFiles] = useState<FileData[]>([])
  const [notifications, setNotifications] = useState<{id: number, message: string, type: 'error' | 'success'}[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [exitShown, setExitShown] = useState(false)
  
  const progress = useMemo(() => {
    const requiredFields = ['name', 'phone', 'email', 'postal']
    const filledFields = requiredFields.filter(field =>
      formData[field as keyof typeof formData]?.toString().trim()
    )
    const hasDate = selectedDate !== null
    const total = requiredFields.length + 1
    const filled = filledFields.length + (hasDate ? 1 : 0)
    return Math.round((filled / total) * 100)
  }, [formData, selectedDate])
  
  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    const notification = {
      id: Date.now(),
      message,
      type
    }
    setNotifications(prev => [...prev, notification])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.phone || !formData.postal) {
      showNotification('Wypełnij wszystkie wymagane pola', 'error')
      return
    }
    
    if (!selectedDate) {
      showNotification('Wybierz termin realizacji', 'error')
      return
    }
    
    if (!formData.consent) {
      showNotification('Musisz wyrazić zgodę na przetwarzanie danych', 'error')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: selectedType,
          date: selectedDate.toISOString(),
          filesCount: files.length
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        showNotification('Dziękujemy! Twoje zapytanie zostało wysłane.', 'success')
        setFormData({
          name: '',
          phone: '',
          email: '',
          postal: '',
          area: '',
          comment: '',
          express: false,
          consent: false
        })
        setSelectedDate(null)
        setFiles([])
        setSelectedType('home-extension')
      } else {
        showNotification('Wystąpił błąd. Spróbuj ponownie.', 'error')
      }
    } catch {
      showNotification('Wystąpił błąd. Spróbuj ponownie.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg animate-slide-in ${
              notification.type === 'error'
                ? 'bg-red-100 text-red-800 border border-red-200'
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>
      
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">VERANDANA</h1>
        </div>
      </nav>
      
      <section className="py-20 px-4 text-center bg-gradient-to-r from-gray-900/80 to-gray-900/60">
        <h2 className="text-5xl font-bold mb-4 text-white">
          Nowoczesne ogrody zimowe z aluminium
        </h2>
        <p className="text-xl text-white/90 mb-8">
          Od funkcjonalnych rozwiązań dla rodzin po luksusowe
        </p>
      </section>
      
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-2">Wybierz typ konstrukcji</h2>
            <p className="text-gray-600">Każdy typ to inna filozofia życia z naturą</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {[
              { type: 'home-extension', name: 'Home Extension', desc: 'Nowoczesna bryła z płaskim dachem' },
              { type: 'classic-warm', name: 'Klasyczny ciepły', desc: 'Szlachetny detal i elegancja' },
              { type: 'seasonal-cold', name: 'Sezonowy zimny', desc: 'Idealny na wiosnę i lato' },
              { type: 'pergola', name: 'Pergola Bioclimatic', desc: 'Lamele regulowane' },
              { type: 'unknown', name: 'Nie wiem', desc: 'Potrzebuję porady eksperta' }
            ].map(item => (
              <div
                key={item.type}
                className={`border-2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  selectedType === item.type ? 'border-orange-400 shadow-lg shadow-orange-400/20' : 'border-gray-200 hover:border-orange-400'
                }`}
                onClick={() => setSelectedType(item.type)}
              >
                <div className="h-36 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-500">{item.name}</span>
                </div>
                <div className="p-4">
                  <div className="font-semibold text-sm mb-1">{item.name}</div>
                  <div className="text-xs text-gray-600 leading-tight">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section id="form" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold font-serif mb-2">Zacznij swoją podróż</h2>
            <p className="text-gray-600">3 kroki do wymarzanego ogrodu</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center mt-3 text-sm text-gray-600">
              Wypełniono: {progress}%
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="w-9 h-9 bg-orange-400 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                <h3 className="text-xl font-semibold">Dane osobowe</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-medium">
                    Imię <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-medium">
                    Telefon <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-medium">
                    Email <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-medium">
                    Kod pocztowy <span className="text-orange-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{2}-[0-9]{3}"
                    placeholder="00-000"
                    value={formData.postal}
                    onChange={(e) => setFormData({...formData, postal: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200">
                <div className="w-9 h-9 bg-orange-400 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                <h3 className="text-xl font-semibold">Szczegóły projektu</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="relative">
                  <label className="block text-sm text-gray-600 mb-2 font-medium">
                    Termin realizacji <span className="text-orange-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-left flex items-center gap-2 hover:border-orange-400 transition-all duration-200"
                  >
                    <span>📅</span>
                    <span>
                      {selectedDate
                        ? `${selectedDate.getDate()} ${monthNamesGen[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
                        : 'Wybierz termin'
                      }
                    </span>
                  </button>
                  
                  <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={(date) => {
                      setSelectedDate(date)
                      setIsCalendarOpen(false)
                    }}
                    isOpen={isCalendarOpen}
                    onClose={() => setIsCalendarOpen(false)}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onMonthChange={(direction) => {
                      let newMonth = currentMonth + direction
                      let newYear = currentYear
                      
                      if (newMonth < 0) {
                        newMonth = 11
                        newYear--
                      } else if (newMonth > 11) {
                        newMonth = 0
                        newYear++
                      }
                      
                      setCurrentMonth(newMonth)
                      setCurrentYear(newYear)
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-2 font-medium">Powierzchnia (m²)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-600 mb-2 font-medium">Komentarz</label>
                <textarea
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all duration-200 resize-y"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2 font-medium">Załączniki</label>
                <FileUpload
                  files={files}
                  onFilesChange={setFiles}
                  onError={showNotification}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <label className="flex items-start gap-3 mb-6 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consent}
                  onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                  className="w-4 h-4 mt-1 accent-orange-400"
                />
                <span className="text-sm">
                  Wyrażam zgodę na przetwarzanie danych osobowych <span className="text-orange-400">*</span>
                </span>
              </label>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gray-900 text-white rounded-xl text-lg font-semibold hover:bg-orange-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij zapytanie'}
              </button>
            </div>
          </form>
        </div>
      </section>
      
      <footer className="bg-gray-900 text-white py-12 text-center">
        <div>VERANDANA sp. z o.o. | 44-151 Gliwice, Miodunki 3</div>
      </footer>
    </div>
  )
}
