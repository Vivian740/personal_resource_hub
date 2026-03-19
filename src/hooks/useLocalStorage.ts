import { ref, watch } from 'vue'
import type { LocalStorageError } from '../types/resource'

// Error log for debugging localStorage issues
const errorLog: LocalStorageError[] = []

/**
 * Safely serialize a value to JSON string
 */
const safeSerialize = <T>(value: T): { success: boolean; data?: string; error?: string } => {
  try {
    // Handle circular references and special types
    const serialized = JSON.stringify(value, (_key, val) => {
      // Handle special types that JSON.stringify can't handle
      if (typeof val === 'function') {
        return undefined // Skip functions
      }
      if (val instanceof Map) {
        return { __type: 'Map', data: Array.from(val.entries()) }
      }
      if (val instanceof Set) {
        return { __type: 'Set', data: Array.from(val.values()) }
      }
      if (val instanceof Date) {
        return { __type: 'Date', data: val.toISOString() }
      }
      return val
    })
    return { success: true, data: serialized }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown serialization error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Safely parse a JSON string with type validation
 */
const safeParse = <T>(raw: string, validator?: (data: unknown) => data is T): { success: boolean; data?: T; error?: string } => {
  try {
    const parsed = JSON.parse(raw, (_key, val) => {
      // Restore special types
      if (val && typeof val === 'object') {
        if (val.__type === 'Map') {
          return new Map(val.data)
        }
        if (val.__type === 'Set') {
          return new Set(val.data)
        }
        if (val.__type === 'Date') {
          return new Date(val.data)
        }
      }
      return val
    })
    
    // Optional type validation
    if (validator && !validator(parsed)) {
      return { success: false, error: 'Parsed data failed type validation' }
    }
    
    return { success: true, data: parsed as T }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'
    return { success: false, error: errorMessage }
  }
}

/**
 * Log localStorage errors for debugging
 */
const logError = (key: string, error: string) => {
  const entry: LocalStorageError = {
    key,
    error,
    timestamp: Date.now(),
  }
  errorLog.push(entry)
  console.warn(`[LocalStorage] Error for key "${key}":`, error)
}

/**
 * Type-safe localStorage composable with safe serialization
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  options?: {
    validator?: (data: unknown) => data is T
    onError?: (error: string) => void
  }
) => {
  const storedValue = ref<T>(initialValue) as ReturnType<typeof ref<T>>

  // Try to load initial value from localStorage
  const storedRaw = localStorage.getItem(key)
  if (storedRaw) {
    const result = safeParse<T>(storedRaw, options?.validator)
    if (result.success && result.data !== undefined) {
      storedValue.value = result.data
    } else {
      logError(key, result.error || 'Failed to parse stored value')
      options?.onError?.(result.error || 'Failed to parse stored value')
    }
  }

  // Watch for changes and persist to localStorage
  watch(
    storedValue,
    (value) => {
      const result = safeSerialize(value)
      if (result.success && result.data) {
        try {
          localStorage.setItem(key, result.data)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to save to localStorage'
          logError(key, errorMessage)
          options?.onError?.(errorMessage)
        }
      } else {
        logError(key, result.error || 'Serialization failed')
        options?.onError?.(result.error || 'Serialization failed')
      }
    },
    { deep: true }
  )

  return {
    storedValue,
    /** Get all logged errors */
    getErrorLog: () => [...errorLog],
    /** Clear stored value from localStorage */
    clear: () => {
      localStorage.removeItem(key)
      storedValue.value = initialValue
    },
  }
}
