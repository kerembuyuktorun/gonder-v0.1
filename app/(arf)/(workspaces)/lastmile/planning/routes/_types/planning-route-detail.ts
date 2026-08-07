export type RouteNoteVisibility = 'everyone' | 'dispatcher' | 'operation'

export type RouteNoteItem = {
  id: string
  note: string
  visibility: RouteNoteVisibility
  authorName: string
  createdUserId: string | null
  createdAt: string
}
