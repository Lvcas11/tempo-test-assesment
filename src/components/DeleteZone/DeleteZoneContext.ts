import { createContext, useContext, type RefObject } from 'react'

export interface DeleteZoneApi {
  /** Ref to the delete-strip element, used for live hit-testing during a drag. */
  ref: RefObject<HTMLDivElement | null>
  /** Show/hide the strip — driven on move-gesture start/end. */
  setDragging: (dragging: boolean) => void
  /** Toggle the armed (about-to-delete) visual while a note is over the strip. */
  setArmed: (armed: boolean) => void
}

export const DeleteZoneContext = createContext<DeleteZoneApi | null>(null)

/** Optional consumer — returns null outside a provider so gestures can no-op. */
export function useDeleteZone(): DeleteZoneApi | null {
  return useContext(DeleteZoneContext)
}
