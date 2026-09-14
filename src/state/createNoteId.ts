import type { NoteId } from '@/types'

/**
 * Mint a branded NoteId. `crypto.randomUUID` is available in all target browsers
 * (Chrome/Firefox/Edge, secure context); the brand is applied at this single site.
 */
export function createNoteId(): NoteId {
  return crypto.randomUUID() as NoteId
}

/** Re-brand a raw string (e.g. when hydrating from storage). */
export function toNoteId(raw: string): NoteId {
  return raw as NoteId
}
