import { useReducer, type ReactNode } from 'react'
import { NotesDispatchContext, NotesStateContext } from './context'
import { initialNotesState, notesReducer, type NotesState } from './notesReducer'

interface NotesProviderProps {
  children: ReactNode
  initialState?: NotesState
}

export function NotesProvider({ children, initialState = initialNotesState }: NotesProviderProps) {
  const [state, dispatch] = useReducer(notesReducer, initialState)
  return (
    <NotesStateContext.Provider value={state}>
      <NotesDispatchContext.Provider value={dispatch}>{children}</NotesDispatchContext.Provider>
    </NotesStateContext.Provider>
  )
}
