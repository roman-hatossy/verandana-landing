export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) return { isValid: false, error: 'Email jest wymagany' }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Nieprawidłowy format email' }
  }
  return { isValid: true }
}

export const validatePhone = (phone: string): { isValid: boolean; error?: string } => {
  if (!phone) return { isValid: false, error: 'Telefon jest wymagany' }
  // Usuń spacje, myślniki i inne znaki
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  // Polski numer: 9 cyfr lub z prefixem +48
  const phoneRegex = /^(?:\+48)?(?:\d{9})$/
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Podaj 9 cyfr (np. 123456789 lub +48123456789)' }
  }
  return { isValid: true }
}

export const validatePostalCode = (code: string): { isValid: boolean; error?: string } => {
  if (!code) return { isValid: false, error: 'Kod pocztowy jest wymagany' }
  // Polski kod pocztowy: XX-XXX
  const postalRegex = /^\d{2}-\d{3}$/
  if (!postalRegex.test(code)) {
    return { isValid: false, error: 'Format: XX-XXX (np. 00-950)' }
  }
  return { isValid: true }
}

export const formatPhone = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
}

export const formatPostalCode = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  if (cleaned.length <= 2) return cleaned
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}`
}
