import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { NotesProvider } from '@/state/NotesProvider'
import type { NotesState } from '@/state/notesReducer'

/** Render a component wrapped in a NotesProvider, optionally seeded with state. */
export function renderWithNotes(
  ui: ReactElement,
  options: { initialState?: NotesState } & Omit<RenderOptions, 'wrapper'> = {},
) {
  const { initialState, ...rest } = options
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <NotesProvider {...(initialState ? { initialState } : {})}>{children}</NotesProvider>
  )
  return render(ui, { wrapper: Wrapper, ...rest })
}
