'use client'
import React, { useState, useCallback, useMemo } from 'react'

type DayStatus = 'past' | 'unavailable' | 'weekend' | 'available'

export interface CalendarProps {
  selectedDate?: Date | null
  onDateSelect: (date: Date | null) => void
  isOpen?: boolean
  onClose?: () => void
  currentMonth?: number
  currentYear?: number
  onMonthChange?: (direction: number) => void
}

export default function Calendar({
  selectedDate: selectedDateProp = null,
  onDateSelect,
  isOpen,
  onClose,
  currentMonth,
  currentYear,
  onMonthChange
}: CalendarProps) {
  const now = new Date()
  const [im, setIM] = useState<number>(typeof currentMonth === 'number' ? currentMonth : now.getMonth())
  const [iy, setIY] = useState<number>(typeof currentYear === 'number' ? currentYear : now.getFullYear())
  const [isel, setISel] = useState<Date | null>(selectedDateProp)

  const month = typeof currentMonth === 'number' ? currentMonth : im
  const year  = typeof currentYear === 'number' ? currentYear : iy
  const selectedDate = selectedDateProp ?? isel

  const monthNames = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień']
  const dayNames   = ['Pn','Wt','Śr','Cz','Pt','Sb','Nd']

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDayOfMonth = (y: number, m: number) => {
    const firstDay = new Date(y, m, 1).getDay()
    return firstDay === 0 ? 6 : firstDay - 1
  }

  const getDayStatus = useCallback((d: Date): DayStatus => {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (date < today) return 'past'
    const dow = date.getDay()
    if (dow === 0) return 'unavailable'
    const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 3)
    if (date > maxDate) return 'unavailable'
    return dow === 6 ? 'weekend' : 'available'
  }, [])

  const handleDateClick = useCallback((day: number) => {
    const date = new Date(year, month, day)
    const status = getDayStatus(date)
    if (status === 'available' || status === 'weekend') {
      setISel(date)
      onDateSelect(date)
      onClose?.()
    }
  }, [getDayStatus, month, year, onClose, onDateSelect])

  const navigateMonth = useCallback((direction: number) => {
    if (onMonthChange) { onMonthChange(direction); return }
    const base = new Date(year, month, 1)
    base.setMonth(base.getMonth() + direction)
    setIM(base.getMonth()); setIY(base.getFullYear())
  }, [month, year, onMonthChange])

  const isDateSelected = useCallback((day: number) => {
    if (!selectedDate) return false
    return selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year
  }, [selectedDate, month, year])

  const renderCalendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const days: JSX.Element[] = []
    for (let i = 0; i < firstDayOfMonth; i++) days.push(<div key={`empty-${i}`} className="h-10" />)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const status = getDayStatus(date)
      const selected = isDateSelected(day)
      let cls = 'h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors '
      if (selected) cls += 'bg-orange-500 text-white font-bold '
      else if (status === 'past' || status === 'unavailable') cls += 'text-gray-300 cursor-not-allowed '
      else if (status === 'weekend') cls += 'bg-orange-50 text-orange-600 hover:bg-orange-100 '
      else cls += 'hover:bg-gray-100 '
      days.push(<div key={day} className={cls} onClick={() => handleDateClick(day)}>{day}</div>)
    }
    return days
  }, [year, month, getDayStatus, isDateSelected, handleDateClick])

  if (isOpen === false) return null

  return (
    <div className={`bg-white rounded-lg p-4 border border-gray-200 ${isOpen ? 'absolute z-50 mt-2 shadow-xl' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded">←</button>
        <h3 className="font-semibold">{monthNames[month]} {year}</h3>
        <button type="button" onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-600">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderCalendarDays}</div>
      {isOpen && (
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={() => onClose?.()} className="text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50">Zamknij</button>
        </div>
      )}
    </div>
  )
}
