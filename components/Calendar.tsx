'use client'
import React, { useState, useCallback, useMemo } from 'react'

interface CalendarProps {
  onDateSelect: (date: Date | null) => void
}

export default function Calendar({ onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthNames = [
    'Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec',
    'Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'
  ]
  const dayNames = ['Pn','Wt','Śr','Cz','Pt','Sb','Nd']

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const getDayStatus = useCallback((incoming: Date) => {
    const d = new Date(incoming.getFullYear(), incoming.getMonth(), incoming.getDate())
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (d < today) return 'past'
    const dayOfWeek = d.getDay()
    if (dayOfWeek === 0) return 'unavailable'
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    if (d > maxDate) return 'unavailable'
    const isWeekend = dayOfWeek === 6
    return isWeekend ? 'weekend' : 'available'
  }, [])

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const status = getDayStatus(date)
    if (status === 'available' || status === 'weekend') {
      setSelectedDate(date)
      onDateSelect(date)
    }
  }

  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1))
  }

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  const renderCalendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth)
    const days: JSX.Element[] = []

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const status = getDayStatus(date)
      const selected = isDateSelected(day)

      let className = 'h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors '
      if (selected) className += 'bg-orange-500 text-white font-bold '
      else if (status === 'past' || status === 'unavailable') className += 'text-gray-300 cursor-not-allowed '
      else if (status === 'weekend') className += 'bg-orange-50 text-orange-600 hover:bg-orange-100 '
      else className += 'hover:bg-gray-100 '

      days.push(
        <div key={day} className={className} onClick={() => handleDateClick(day)}>
          {day}
        </div>
      )
    }
    return days
  }, [currentMonth, getDayStatus, selectedDate])

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded">←</button>
        <h3 className="font-semibold">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
        <button type="button" onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-600">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays}</div>
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center"><span className="w-3 h-3 bg-orange-50 rounded mr-1"></span>Weekendy (+25%)</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-gray-100 rounded mr-1"></span>Dostępne</span>
        </div>
      </div>
    </div>
  )
}
