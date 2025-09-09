'use client'

import { useMemo } from 'react'

interface CalendarProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  isOpen: boolean
  onClose: () => void
  currentMonth: number
  currentYear: number
  onMonthChange: (direction: number) => void
}

const monthNamesFull = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień']

const MIN_WEEKS = 16
const EXPRESS_MIN_WEEKS = 6

export default function Calendar({
  selectedDate,
  onDateSelect,
  isOpen,
  onClose,
  currentMonth,
  currentYear,
  onMonthChange
}: CalendarProps) {
  const dateConstants = useMemo(() => {
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const minAllowedDate = new Date(tomorrow)
    minAllowedDate.setDate(minAllowedDate.getDate() + (MIN_WEEKS * 7))
    
    const expressMinDate = new Date(tomorrow)
    expressMinDate.setDate(expressMinDate.getDate() + (EXPRESS_MIN_WEEKS * 7))
    
    return { today, tomorrow, minAllowedDate, expressMinDate }
  }, [])

  const isDateInExpressRange = (date: Date): boolean => {
    return date >= dateConstants.expressMinDate && date < dateConstants.minAllowedDate
  }

  const getDayStatus = (date: Date) => {
    const isPast = date < dateConstants.tomorrow
    const isBlocked = date >= dateConstants.tomorrow && date < dateConstants.expressMinDate
    const isWarning = !isPast && !isBlocked && isDateInExpressRange(date)
    const isAvailable = !isPast && !isBlocked && !isWarning
    const isSelected = selectedDate &&
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    
    return { isPast, isBlocked, isWarning, isAvailable, isSelected }
  }

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay() || 7
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const days = []
    
    for (let i = 1; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day"></div>)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      date.setHours(12, 0, 0, 0)
      
      const { isPast, isBlocked, isWarning, isAvailable, isSelected } = getDayStatus(date)
      
      let classes = 'calendar-day'
      if (isPast) classes += ' day-past'
      else if (isBlocked) classes += ' day-blocked'
      else if (isWarning) classes += ' day-warning'
      if (isSelected) classes += ' selected'
      
      const handleClick = () => {
        if (isAvailable || isWarning) {
          onDateSelect(date)
        }
      }
      
      days.push(
        <button
          key={day}
          type="button"
          className={classes}
          onClick={handleClick}
          disabled={isPast || isBlocked}
        >
          {day}
        </button>
      )
    }
    
    return days
  }, [currentMonth, currentYear, selectedDate, onDateSelect])

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-xl p-4 shadow-xl z-20 min-w-[20rem]">
      <div className="flex justify-between items-center mb-4">
        <button
          type="button"
          onClick={() => onMonthChange(-1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ‹
        </button>
        <span className="font-semibold">{monthNamesFull[currentMonth]} {currentYear}</span>
        <button
          type="button"
          onClick={() => onMonthChange(1)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          ›
        </button>
      </div>
      
      <div className="text-sm text-gray-600 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-2 mb-3">
        Minimalny termin realizacji: {MIN_WEEKS} tygodni
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Pn','Wt','Śr','Cz','Pt','Sb','Nd'].map(day => (
          <div key={day} className="text-center text-xs text-gray-600 p-2">{day}</div>
        ))}
        {calendarDays}
      </div>
      
      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-600">
        <span><span className="inline-block w-3 h-3 bg-gray-300 rounded mr-1"></span> Przeszłość</span>
        <span><span className="inline-block w-3 h-3 bg-red-200 border border-red-300 rounded mr-1"></span> Zablokowane</span>
        <span><span className="inline-block w-3 h-3 bg-yellow-200 border border-yellow-300 rounded mr-1"></span> Ekspresowe</span>
        <span><span className="inline-block w-3 h-3 bg-white border border-gray-300 rounded mr-1"></span> Dostępne</span>
      </div>
    </div>
  )
}
