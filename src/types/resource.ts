export interface ResourceItem {
  id: string
  title: string
  url: string
  description?: string
  tags: string[]
  addedAt: string
}

export type Category = string

export interface LocalStorageError {
  key: string
  error: string
  timestamp: number
}
